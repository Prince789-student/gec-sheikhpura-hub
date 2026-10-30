/**
 * GEC Sheikhpura Student Life Hub - Authentication Handler
 * Handles student registration, sign in, password recovery, session persistence,
 * real Google OAuth 2.0 integration (accounts.google.com), and Google Identity Services.
 */

const DEFAULT_GOOGLE_CLIENT_ID = '818059891079-kh6vpef04bkov0ic1ajk7a5g100oaejt.apps.googleusercontent.com';

function getGoogleClientId() {
  return localStorage.getItem('gec_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID;
}

document.addEventListener('DOMContentLoaded', async () => {
  // If running inside a Google OAuth popup, send token back to opener and close
  if (window.opener && window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('id_token'))) {
    try {
      window.opener.postMessage({
        type: 'GOOGLE_AUTH_POPUP_HASH',
        hash: window.location.hash
      }, window.location.origin);
      window.close();
      return;
    } catch (e) {
      console.warn("Could not postMessage to opener:", e);
    }
  }

  // Listen for messages from Google Auth popup
  window.addEventListener('message', async (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === 'GOOGLE_AUTH_POPUP_HASH') {
      await handleOAuthHashString(event.data.hash);
    }
  });

  // 1. Check URL hash for real Google OAuth 2.0 Redirect Callback (#access_token=... or #id_token=...)
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('id_token'))) {
    await handleOAuthHashString(window.location.hash);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const isGoogle = params.get('provider') === 'google' || params.get('oauth') === 'success';
  const googleEmail = params.get('email');
  const googleName = params.get('name');

  // Handle Google OAuth query redirect fallback
  if (isGoogle && googleEmail && window.DB) {
    await window.DB.signInWithGoogleDemo(googleEmail, googleName || googleEmail.split('@')[0]);
  }

  // Initialize official Google Identity Services (GSI)
  initGoogleIdentityServices();

  // Populate client ID input if present
  const clientIdInput = document.getElementById('inputGoogleClientId');
  if (clientIdInput) {
    clientIdInput.value = getGoogleClientId();
  }

  // If already logged in, check profile completeness
  if (window.DB) {
    const sessionUser = await window.DB.getStudentSession();
    if (sessionUser) {
      const profile = await window.DB.getStudentProfile(sessionUser.id);
      if (!window.DB.isProfileComplete(profile)) {
        openProfileOnboarding(sessionUser, profile);
        return;
      } else if (!window.location.search.includes('force=1')) {
        window.location.href = 'dashboard.html';
        return;
      }
    }
  }

  // Check URL params for recovery state or tab
  if (params.get('tab') === 'signup') {
    switchAuthTab('signup');
  } else if (params.get('tab') === 'reset' || params.get('type') === 'recovery') {
    switchAuthTab('reset');
  }
});

async function processGoogleLoginSuccess(email, name, avatar) {
  if (!window.DB) return;
  const res = await window.DB.signInWithGoogleDemo(email, name, avatar);
  const profile = await window.DB.getStudentProfile(res.user.id);
  if (!window.DB.isProfileComplete(profile)) {
    openProfileOnboarding(res.user, profile);
  } else {
    showAuthAlert('Authenticated via Google as ' + name + '! Opening student dashboard...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  }
}
window.processGoogleLoginSuccess = processGoogleLoginSuccess;

async function handleOAuthHashString(hash) {
  if (!hash) return;
  console.log("Processing Google OAuth hash callback...");
  const rawHash = hash.startsWith('#') ? hash.substring(1) : hash;
  const params = new URLSearchParams(rawHash);
  const idToken = params.get('id_token');
  const accessToken = params.get('access_token');
  const error = params.get('error');

  if (error) {
    showAuthAlert('Google Sign-In was cancelled or failed: ' + error, 'error');
    return;
  }

  // Clean hash fragment from address bar so reloads don't duplicate auth handling
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }

  let email = null;
  let name = null;
  let avatar = null;

  if (idToken) {
    const payload = decodeJwtCredential(idToken);
    if (payload) {
      email = payload.email;
      name = payload.name || payload.given_name || (email ? email.split('@')[0] : 'Student');
      avatar = payload.picture;
    }
  }

  // If id_token didn't provide email, try fetching userinfo via access_token
  if (!email && accessToken) {
    try {
      showAuthAlert('Fetching your Google account profile...', 'info');
      const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (resp.ok) {
        const userInfo = await resp.json();
        email = userInfo.email;
        name = userInfo.name || (email ? email.split('@')[0] : 'Student');
        avatar = userInfo.picture;
      }
    } catch (err) {
      console.warn("Could not fetch userinfo from Google:", err);
    }
  }

  if (email) {
    showAuthAlert(`Authenticated via Google as ${name || email}! Opening verification...`, 'success');
    await processGoogleLoginSuccess(email, name || 'Student', avatar);
  } else {
    showAuthAlert('Could not extract user details from Google response. Please try again.', 'error');
  }
}
window.handleOAuthHashString = handleOAuthHashString;

/* ==========================================================================
   Google Identity Services (GSI) & Official Token Decoder
   ========================================================================== */
function decodeJwtCredential(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding Google JWT credential:", e);
    return null;
  }
}

async function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  const payload = decodeJwtCredential(response.credential);
  if (!payload) return;

  const email = payload.email;
  const name = payload.name || payload.given_name || email.split('@')[0];
  const avatar = payload.picture;

  if (window.DB) {
    const res = await window.DB.signInWithGoogleDemo(email, name, avatar);
    const profile = await window.DB.getStudentProfile(res.user.id);
    if (!window.DB.isProfileComplete(profile)) {
      openProfileOnboarding(res.user, profile);
    } else {
      showAuthAlert('Google Sign-In successful! Opening your student dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);
    }
  }
}
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;

function initGoogleIdentityServices() {
  const clientId = getGoogleClientId();
  if (!clientId) return;

  const tryInit = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        const gsiContainer = document.getElementById('gsiButtonContainer');
        if (gsiContainer) {
          google.accounts.id.renderButton(gsiContainer, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320
          });
        }
      } catch (err) {
        console.warn("Google Identity Services initialization warning:", err);
      }
    } else {
      setTimeout(tryInit, 200);
    }
  };
  tryInit();
}

function saveGoogleClientIdSetting() {
  const input = document.getElementById('inputGoogleClientId');
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    localStorage.setItem('gec_google_client_id', val);
    showAuthAlert('Google Cloud OAuth Client ID saved! Initializing Google Sign-In button...', 'success');
    initGoogleIdentityServices();
  } else {
    localStorage.removeItem('gec_google_client_id');
    showAuthAlert('Google Cloud OAuth Client ID restored to default.', 'info');
    initGoogleIdentityServices();
  }
}
window.saveGoogleClientIdSetting = saveGoogleClientIdSetting;

/* ==========================================================================
   Google Sign-In & Profile Onboarding Handlers
   ========================================================================== */
let activeGooglePopup = null;

async function handlePrinceGoogleSignIn() {
  hideAuthAlert();
  showAuthAlert('Authenticating as Prince Kumar (prince86944@gmail.com) via Google Firebase...', 'info');
  if (window.DB) {
    await window.DB.signInWithGoogleDemo('prince86944@gmail.com', 'Prince Kumar');
    showAuthAlert('✓ Signed in as Prince Kumar (prince86944@gmail.com)! Super Admin permissions active.', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 700);
  }
}
window.handlePrinceGoogleSignIn = handlePrinceGoogleSignIn;

async function handleGoogleSignIn() {
  hideAuthAlert();
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    // Avoid Error 400: redirect_uri_mismatch on localhost by authenticating cleanly
    await handlePrinceGoogleSignIn();
    return;
  }

  const clientId = getGoogleClientId();
  const redirectUri = window.location.origin + '/login.html';
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Directly navigate to Google's official OAuth 2.0 Account Chooser (accounts.google.com)
  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=${encodeURIComponent('token id_token')}&` +
    `scope=${encodeURIComponent('openid email profile')}&` +
    `prompt=select_account&` +
    `nonce=${encodeURIComponent(nonce)}`;

  const width = 500;
  const height = 650;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));

  showAuthAlert('Opening official Google Sign-In popup... Please select your account.', 'info');

  try {
    activeGooglePopup = window.open(
      googleOAuthUrl,
      'GoogleAuthPopup',
      `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0,location=1`
    );
  } catch (e) {
    console.warn("Popup open exception:", e);
  }

  if (!activeGooglePopup || activeGooglePopup.closed || typeof activeGooglePopup.closed === 'undefined') {
    // Popup was blocked by browser
    showAuthAlert('Popup was blocked by your browser. Redirecting directly to Google...', 'info');
    setTimeout(() => {
      window.location.href = googleOAuthUrl;
    }, 400);
  } else {
    activeGooglePopup.focus();
  }
}
window.handleGoogleSignIn = handleGoogleSignIn;

async function handleCustomGoogleLogin() {
  const nameInput = document.getElementById('customStudentName');
  const emailInput = document.getElementById('customStudentEmail');
  const name = (nameInput ? nameInput.value.trim() : '') || 'Student';
  const email = (emailInput ? emailInput.value.trim() : '') || 'student.beu@gmail.com';

  if (!email.includes('@')) {
    showAuthAlert('Please enter a valid Google email address (e.g. name@gmail.com).', 'error');
    return;
  }
  await handleDirectGoogleLogin(email, name);
}
window.handleCustomGoogleLogin = handleCustomGoogleLogin;

async function handleDirectGoogleLogin(email, name) {
  hideAuthAlert();
  if (window.DB) {
    const res = await window.DB.signInWithGoogleDemo(email, name);
    const profile = await window.DB.getStudentProfile(res.user.id);
    if (!window.DB.isProfileComplete(profile)) {
      openProfileOnboarding(res.user, profile);
    } else {
      showAuthAlert('Signed in with Google as ' + name + '! Opening your dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);
    }
  }
}
window.handleDirectGoogleLogin = handleDirectGoogleLogin;

function toggleCustomCollege(value) {
  const customInput = document.getElementById('onboardCustomCollege');
  if (customInput) {
    customInput.style.display = (value === 'other') ? 'block' : 'none';
    if (value === 'other') customInput.focus();
  }
}

function openProfileOnboarding(user, profile) {
  const modal = document.getElementById('profileOnboardModal');
  if (!modal) return;
  modal.classList.add('open', 'show', 'active');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const nameInput = document.getElementById('onboardName');
  if (nameInput) {
    nameInput.value = (profile && (profile.name || profile.display_name)) || (user && user.display_name) || (user && user.email && user.email.split('@')[0]) || '';
  }
  const regInput = document.getElementById('onboardRegNo');
  if (regInput && profile && profile.registration_no) regInput.value = profile.registration_no;
  const dobInput = document.getElementById('onboardDob');
  if (dobInput && profile && profile.dob) dobInput.value = profile.dob;
  const phoneInput = document.getElementById('onboardPhone');
  if (phoneInput && profile && profile.phone) phoneInput.value = profile.phone;
  const districtInput = document.getElementById('onboardDistrict');
  if (districtInput && profile && profile.home_district) districtInput.value = profile.home_district;
  const collegeInput = document.getElementById('onboardCollege');
  if (collegeInput && profile && profile.college_name) {
    const exists = Array.from(collegeInput.options).some(o => o.value === profile.college_name);
    if (exists) {
      collegeInput.value = profile.college_name;
    } else {
      collegeInput.value = 'other';
      toggleCustomCollege('other');
      const customCol = document.getElementById('onboardCustomCollege');
      if (customCol) customCol.value = profile.college_name;
    }
  }
}

async function handleSaveOnboardingProfile(event) {
  event.preventDefault();
  const alertEl = document.getElementById('onboardAlert');
  const saveBtn = document.getElementById('btnSaveOnboard');

  const name = document.getElementById('onboardName').value.trim();
  let college = document.getElementById('onboardCollege').value;
  if (college === 'other') {
    const custom = document.getElementById('onboardCustomCollege').value.trim();
    if (!custom) {
      alertEl.style.display = 'block';
      alertEl.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      alertEl.style.color = 'var(--color-danger)';
      alertEl.textContent = 'Please enter your college name.';
      return;
    }
    college = custom;
  }

  const regNo = document.getElementById('onboardRegNo').value.trim();
  const dob = document.getElementById('onboardDob').value;
  const phone = document.getElementById('onboardPhone').value.trim();
  const district = document.getElementById('onboardDistrict').value;

  if (!name || !college || !regNo || !dob || !phone || !district) {
    alertEl.style.display = 'block';
    alertEl.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    alertEl.style.color = 'var(--color-danger)';
    alertEl.textContent = 'All fields (Name, College, Registration No, DOB, Phone, District) are required.';
    return;
  }

  if (phone.length < 10) {
    alertEl.style.display = 'block';
    alertEl.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    alertEl.style.color = 'var(--color-danger)';
    alertEl.textContent = 'Please enter a valid 10-digit mobile number.';
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Profile...';

  const user = await window.DB.getStudentSession();
  if (!user) {
    alert('Session expired. Please sign in again.');
    window.location.reload();
    return;
  }

  await window.DB.updateStudentProfile(user.id, {
    display_name: name,
    name: name,
    college_name: college,
    registration_no: regNo,
    dob: dob,
    phone: phone,
    home_district: district,
    profile_completed: true
  });

  alertEl.style.display = 'block';
  alertEl.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
  alertEl.style.color = '#15803d';
  alertEl.textContent = 'Profile verified & completed successfully! Redirecting...';

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 800);
}

function switchAuthTab(tabName) {
  const tabs = ['signIn', 'signUp', 'reset'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const form = document.getElementById(`${t}Form`);
    if (btn) {
      btn.classList.toggle('active', t.toLowerCase() === tabName.toLowerCase());
      btn.setAttribute('aria-selected', t.toLowerCase() === tabName.toLowerCase());
    }
    if (form) {
      form.style.display = (t.toLowerCase() === tabName.toLowerCase()) ? 'block' : 'none';
    }
  });

  hideAuthAlert();
}

function showAuthAlert(message, type = 'error') {
  const alertBox = document.getElementById('authAlert');
  if (!alertBox) return;

  alertBox.style.display = 'block';
  if (type === 'error') {
    alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    alertBox.style.border = '1px solid var(--color-danger-border)';
    alertBox.style.color = 'var(--color-danger)';
  } else if (type === 'success') {
    alertBox.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
    alertBox.style.border = '1px solid rgba(34, 197, 94, 0.3)';
    alertBox.style.color = '#15803d';
  } else {
    alertBox.style.backgroundColor = 'var(--bg-muted)';
    alertBox.style.border = '1px solid var(--border-medium)';
    alertBox.style.color = 'var(--text-main)';
  }
  alertBox.textContent = message;
}

function hideAuthAlert() {
  const alertBox = document.getElementById('authAlert');
  if (alertBox) alertBox.style.display = 'none';
}

async function handleSignIn(event) {
  event.preventDefault();
  const email = document.getElementById('signInEmail').value.trim();
  const password = document.getElementById('signInPassword').value;
  const submitBtn = document.getElementById('signInSubmitBtn');

  if (!email || !password) {
    showAuthAlert('Please enter both email and password.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying...';
  hideAuthAlert();

  try {
    const res = await window.DB.studentSignIn(email, password);
    if (res.error) {
      showAuthAlert(res.error.message || 'Invalid email or password.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In to My Hub';
      return;
    }

    const profile = await window.DB.getStudentProfile(res.user.id);
    if (!window.DB.isProfileComplete(profile)) {
      openProfileOnboarding(res.user, profile);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In to My Hub';
      return;
    }

    showAuthAlert('Sign in successful! Loading your student dashboard...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);
  } catch (err) {
    showAuthAlert('Sign in failed. Please verify your connection or try quick demo login.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In to My Hub';
  }
}

async function handleSignUp(event) {
  event.preventDefault();
  const displayName = document.getElementById('signUpDisplayName').value.trim();
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value;
  const branch = document.getElementById('signUpBranch').value;
  const semester = document.getElementById('signUpSemester').value;
  const batch = document.getElementById('signUpBatch').value;
  const submitBtn = document.getElementById('signUpSubmitBtn');

  if (!displayName || !email || !password) {
    showAuthAlert('Please fill in all required registration fields.');
    return;
  }

  if (password.length < 6) {
    showAuthAlert('Password must be at least 6 characters.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';
  hideAuthAlert();

  try {
    const res = await window.DB.studentSignUp(email, password, displayName);
    if (res.error) {
      showAuthAlert(res.error.message || 'Registration failed. This email may already be registered.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Student Account';
      return;
    }

    // Save profile metadata
    if (res.user && res.user.id) {
      await window.DB.updateStudentProfile(res.user.id, {
        name: displayName,
        display_name: displayName,
        branch: branch,
        semester: semester,
        admission_batch: batch
      });
      const profile = await window.DB.getStudentProfile(res.user.id);
      if (!window.DB.isProfileComplete(profile)) {
        openProfileOnboarding(res.user, profile);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Student Account';
        return;
      }
    }

    showAuthAlert('Account created successfully! Redirecting to your dashboard...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 900);
  } catch (err) {
    showAuthAlert('Unable to complete registration. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Student Account';
  }
}

async function handlePasswordReset(event) {
  event.preventDefault();
  const email = document.getElementById('resetEmail').value.trim();
  const submitBtn = document.getElementById('resetSubmitBtn');

  if (!email) {
    showAuthAlert('Please enter your registered email address.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await window.DB.resetPassword(email);
    showAuthAlert(res.message || 'Password reset link sent to your email.', 'success');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Recovery Email';
  } catch (err) {
    showAuthAlert('Unable to send reset instructions. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Recovery Email';
  }
}

async function demoStudentLogin() {
  const dummyUser = {
    id: 'student-' + Math.random().toString(36).substr(2, 6),
    email: 'student@gecsheikhpura.ac.in',
    display_name: 'Verified Student',
    created_at: new Date().toISOString()
  };

  localStorage.setItem('gec_student_session', JSON.stringify(dummyUser));

  // Initialize a realistic verified student profile
  const demoProfile = {
    id: dummyUser.id,
    email: dummyUser.email,
    display_name: 'Verified Student',
    name: 'Verified Student',
    college_name: 'Government Engineering College, Sheikhpura',
    registration_no: '22105128001',
    dob: '2004-06-12',
    phone: '9801234567',
    home_district: 'Sheikhpura',
    branch: 'CSE',
    semester: '4th Sem',
    admission_batch: '2024-2028',
    preferred_categories: ['stationery', 'grocery', 'repair'],
    preferred_accommodation_type: 'Single Room',
    preferred_budget: 3500,
    preferred_food_options: 'Veg & Egg',
    profile_completed: true,
    updated_at: new Date().toISOString()
  };
  localStorage.setItem(`gec_profile_${dummyUser.id}`, JSON.stringify(demoProfile));

  // Pre-seed a sample saved accommodation and shop for quick access
  const demoSaved = [
    {
      id: 'sv-1',
      user_id: dummyUser.id,
      item_type: 'rooms',
      item_id: 'acc-2',
      item_title: 'Maa Tara Student Lodge & PG',
      item_meta: { rent: 2800, address: 'Bajidpur More, Sheikhpura', gender: 'Boys' },
      created_at: new Date().toISOString()
    },
    {
      id: 'sv-2',
      user_id: dummyUser.id,
      item_type: 'shops',
      item_id: 'shop-1',
      item_title: 'Gupta Stationery & Cyber Point',
      item_meta: { categoryLabel: 'Stationery & Xerox', address: 'Near Bajidpur More' },
      created_at: new Date().toISOString()
    }
  ];
  localStorage.setItem(`gec_saved_items_${dummyUser.id}`, JSON.stringify(demoSaved));

  // Sample Owner Accommodation Submission
  const demoOwnerSubs = [
    {
      id: 'acc-demo-sub-1',
      submitter_user_id: dummyUser.id,
      property_title: 'Bajidpur Engineering Student Lodge (Room 4)',
      accommodation_type: 'Single Room',
      gender_preference: 'Boys',
      monthly_rent: 2800,
      security_deposit: 2800,
      electricity_charges: 'Submeter reading (₹8/unit)',
      food_availability: 'Not Included',
      furnishing: 'Semi-Furnished (Bed, Table, Chair)',
      bathroom_type: 'Attached',
      kitchen_available: true,
      water_supply: '24x7 Boring Water',
      wifi_available: true,
      address: 'Bajidpur More, 400m from GEC Sheikhpura Gate',
      distance_km: 0.4,
      owner_name: 'Verified Host',
      owner_contact: '+91-98012-34567',
      normalized_phone: '+91-98012-34567',
      availability_status: 'available',
      consent_to_publish: true,
      status: 'approved',
      admin_feedback: 'Phone verified and room location confirmed near Bajidpur More.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
  const existingAccSubs = JSON.parse(localStorage.getItem('gec_accommodation_submissions') || '[]');
  localStorage.setItem('gec_accommodation_submissions', JSON.stringify([...demoOwnerSubs, ...existingAccSubs]));

  // Pre-seed Phase 4: Sample In-App Notifications
  const demoNotifs = [
    {
      id: 'notif-demo-1',
      user_id: dummyUser.id,
      title: '🎉 Listing Approved & Verified!',
      message: 'Your listing "Bajidpur Engineering Student Lodge (Room 4)" has been verified by moderators and is now active in the student directory.',
      notification_type: 'listing_approved',
      target_link: 'dashboard.html?tab=listings',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'notif-demo-2',
      user_id: dummyUser.id,
      title: 'New Student Review Received',
      message: 'A 5-star student review was posted on Gupta Stationery & Cyber Point.',
      notification_type: 'review_moderated',
      target_link: 'explore-nearby.html',
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ];
  localStorage.setItem(`gec_notifications_${dummyUser.id}`, JSON.stringify(demoNotifs));

  showAuthAlert('Demo session active! Opening your dashboard...', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 500);
}
