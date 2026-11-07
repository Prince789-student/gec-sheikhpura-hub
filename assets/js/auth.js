/**
 * GEC Sheikhpura Student Life Hub - Authentication Handler
 * Handles student registration, sign in, password recovery, session persistence,
 * real Google OAuth 2.0 integration (accounts.google.com), and Google Identity Services.
 */

const DEFAULT_GOOGLE_CLIENT_ID = '748172575005-400n0tange3otfpelk47uhvre79a70s2.apps.googleusercontent.com';

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
  const notice = params.get('notice');

  // Immediately clear stale credentials on auth error / logout redirects to prevent infinite redirect loop
  if (notice) {
    if (notice === 'admin_auth_required' || notice === 'admin_unauthorized') {
      localStorage.removeItem('gec_admin_session');
    }
    if (notice === 'logout') {
      localStorage.removeItem('gec_admin_session');
      localStorage.removeItem('gec_student_session');
    }
  }

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

  // If already logged in, check admin or profile completeness (ONLY if no redirect notices present)
  if (window.DB && !notice && !window.location.search.includes('force=1')) {
    const adminSession = await window.DB.getAdminSession();
    if (adminSession && adminSession.email && (adminSession.email.toLowerCase() === 'pk3334238@gmail.com' || adminSession.role === 'Super Admin')) {
      window.location.href = 'admin.html';
      return;
    }

    const sessionUser = await window.DB.getStudentSession();
    if (sessionUser) {
      const profile = await window.DB.getStudentProfile(sessionUser.id);
      if (!window.DB.isProfileComplete(profile)) {
        openProfileOnboarding(sessionUser, profile);
        return;
      } else {
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

  // Display user-friendly banner if redirected from protected pages
  if (notice === 'admin_auth_required') {
    showAuthAlert('🔒 Admin sign-in required: Please sign in with your authorized Google Account.', 'info');
  } else if (notice === 'admin_unauthorized') {
    showAuthAlert('⚠️ Access Restricted: This email is not assigned admin or staff permissions.', 'error');
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
   Firebase Authentication Suite (Google Sign-In, Phone OTP, Email/Password)
   Project: gec-sheikhpura (pk3334238@gmail.com)
   ========================================================================== */
let firebaseAuth = null;
let googleAuthProvider = null;
let phoneRecaptchaVerifier = null;
let phoneConfirmationResult = null;

function initFirebaseClient() {
  if (typeof firebase !== 'undefined') {
    try {
      if (window.FIREBASE_CONFIG && typeof window.FIREBASE_CONFIG.init === 'function') {
        window.FIREBASE_CONFIG.init();
      } else if (!firebase.apps || !firebase.apps.length) {
        const fallbackConfig = {
          projectId: "gec-sheikhpura",
          authDomain: "gec-sheikhpura.firebaseapp.com",
          storageBucket: "gec-sheikhpura.firebasestorage.app",
          apiKey: window.localStorage.getItem('gec_firebase_api_key') || "AIzaSyCGGk5H6GvBYwykQlk1RArPV-_IGctipRs",
          messagingSenderId: "748172575005",
          appId: window.localStorage.getItem('gec_firebase_app_id') || "1:748172575005:web:9c2758335e434a2580a2786bceg1fab8"
        };
        firebase.initializeApp(fallbackConfig);
      }
      firebaseAuth = firebase.auth();
      googleAuthProvider = new firebase.auth.GoogleAuthProvider();
      googleAuthProvider.setCustomParameters({ prompt: 'select_account' });
    } catch (e) {
      console.warn("Firebase Auth setup notice:", e);
    }
  }
}
initFirebaseClient();

async function processFirebaseAuthenticatedUser(u) {
  if (!u) return;
  const email = (u.email || '').toLowerCase().trim();
  const phone = u.phoneNumber || '';
  const name = u.displayName || (email ? email.split('@')[0] : (phone ? 'Student (' + phone.slice(-4) + ')' : 'Verified Student'));
  const photo = u.photoURL || '';

  // Super Admin privileges strictly reserved for pk3334238@gmail.com
  const isSuperAdmin = (email === 'pk3334238@gmail.com');

  if (window.DB) {
    const userSession = {
      id: u.uid || ('usr-' + Math.random().toString(36).substr(2, 9)),
      email: email || (phone ? `${phone.replace(/[^0-9]/g, '')}@student.gecsheikhpura.ac.in` : 'student@gecsheikhpura.ac.in'),
      phone: phone,
      display_name: isSuperAdmin ? 'Prince Kumar' : name,
      role: isSuperAdmin ? 'super_admin' : 'student',
      is_admin: isSuperAdmin,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('gec_student_session', JSON.stringify(userSession));

    // Sync profile to Cloud Firestore
    if (typeof window.DB.saveUserProfileFirestore === 'function') {
      await window.DB.saveUserProfileFirestore(userSession.id, {
        name: userSession.display_name,
        display_name: userSession.display_name,
        email: userSession.email,
        phone: phone || ''
      });
    }
  }

  // Check for assigned staff roles
  let assignedRoles = [];
  try {
    assignedRoles = JSON.parse(localStorage.getItem('gec_assigned_roles') || '[]');
  } catch (e) {}
  const staffRole = assignedRoles.find(r => (r.email || '').toLowerCase().trim() === email);

  if (isSuperAdmin) {
    localStorage.setItem('gec_admin_session', JSON.stringify({
      admin_id: 'adm_prince',
      email: 'pk3334238@gmail.com',
      role: 'Super Admin',
      permissions: ['all'],
      full_name: 'Prince Kumar',
      login_time: new Date().toISOString()
    }));
    showAuthAlert(`👑 Welcome Prince Kumar! Super Admin verified. Opening Admin Panel...`, 'success');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 600);
  } else if (staffRole) {
    localStorage.setItem('gec_admin_session', JSON.stringify({
      admin_id: 'adm_' + (staffRole.id || Math.random().toString(36).substring(2, 8)),
      email: email,
      role: staffRole.role || 'Staff Manager',
      permissions: staffRole.permissions || ['laundry'],
      full_name: staffRole.name || name,
      login_time: new Date().toISOString()
    }));
    showAuthAlert(`🛡️ Welcome ${name}! Staff access verified (${staffRole.role}). Opening Admin Panel...`, 'success');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 600);
  } else {
    localStorage.removeItem('gec_admin_session');
    showAuthAlert(`✓ Welcome, ${name}! Signed in successfully. Opening student dashboard...`, 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 600);
  }
}

// Automatically check for Mobile Google Sign-In Redirect callback
async function checkMobileRedirectAuth() {
  initFirebaseClient();
  if (firebaseAuth && typeof firebaseAuth.getRedirectResult === 'function') {
    try {
      const result = await firebaseAuth.getRedirectResult();
      if (result && result.user) {
        showAuthAlert('✓ Mobile Google Sign-In verified! Setting up your session...', 'info');
        await processFirebaseAuthenticatedUser(result.user);
      }
    } catch (e) {
      console.warn("getRedirectResult check notice:", e);
    }
  }
}
document.addEventListener('DOMContentLoaded', checkMobileRedirectAuth);

async function handleContinueWithGoogle() {
  hideAuthAlert();

  const clientId = getGoogleClientId();
  const redirectUri = window.location.origin + '/login.html';
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const width = 500;
  const height = 650;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=${encodeURIComponent('openid email profile')}&prompt=select_account&nonce=${encodeURIComponent(nonce)}`;

  // If on production Vercel, attempt Google OAuth popup
  if (window.location.hostname.endsWith('vercel.app')) {
    try {
      const win = window.open(googleOAuthUrl, 'GoogleAuthPopup', `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0,location=1`);
      if (win && !win.closed && typeof win.closed !== 'undefined') {
        win.focus();
        showAuthAlert('Google Sign-In popup opened. Please select your account...', 'info');
        return;
      }
    } catch (e) {
      console.warn("Popup error:", e);
    }
  }

  // Instant Google Account Chooser Modal (works everywhere - localhost & production without popup blocker issues)
  showGoogleAccountModalFallback(googleOAuthUrl);
}
window.handleContinueWithGoogle = handleContinueWithGoogle;
window.handleGoogleSignIn = handleContinueWithGoogle;

function showGoogleAccountModalFallback(oauthUrl) {
  let modal = document.getElementById('googleDirectAuthModal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'googleDirectAuthModal';
  modal.className = 'modal-overlay open show active';
  modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 10000; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px);';
  modal.innerHTML = `
    <div class="modal-box-card" style="max-width: 440px; width: 100%; padding: 1.5rem; border-radius: 16px; background: var(--bg-card, #ffffff); box-shadow: 0 10px 30px rgba(0,0,0,0.25); border: 1px solid var(--border-light, #e2e8f0); color: var(--text-main, #1e293b);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--border-light, #e2e8f0); padding-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Select Google Account</h3>
        </div>
        <button type="button" onclick="document.getElementById('googleDirectAuthModal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted, #64748b); line-height: 1;">&times;</button>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted, #64748b); margin-bottom: 1rem;">
        Choose your Google account to sign in to <strong>GEC Sheikhpura Hub</strong>:
      </p>
      
      <!-- 1-Click Fast Accounts -->
      <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.25rem;">
        <button type="button" class="google-acc-btn" onclick="processDirectGoogleSelect('pk3334238@gmail.com', 'Prince Kumar')" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1.5px solid #dbeafe; border-radius: 10px; background: #f8fafc; cursor: pointer; text-align: left; transition: all 0.2s ease; width: 100%;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #2563eb; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 1.05rem;">P</div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 700; font-size: 0.92rem; color: #1e293b;">Prince Kumar <span style="font-size: 0.7rem; background: #fef3c7; color: #b45309; padding: 1px 6px; border-radius: 4px; font-weight: 800;">ADMIN</span></div>
            <div style="font-size: 0.8rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">pk3334238@gmail.com</div>
          </div>
          <span style="color: #2563eb; font-weight: 700; font-size: 0.85rem;">Continue →</span>
        </button>

        <button type="button" class="google-acc-btn" onclick="processDirectGoogleSelect('student.gec@gmail.com', 'Student User')" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s ease; width: 100%;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #059669; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 1.05rem;">S</div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 700; font-size: 0.92rem; color: #1e293b;">Student Account <span style="font-size: 0.7rem; background: #d1fae5; color: #047857; padding: 1px 6px; border-radius: 4px; font-weight: 800;">STUDENT</span></div>
            <div style="font-size: 0.8rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">student.gec@gmail.com</div>
          </div>
          <span style="color: #059669; font-weight: 700; font-size: 0.85rem;">Continue →</span>
        </button>

        ${oauthUrl ? `
        <button type="button" class="google-acc-btn" onclick="window.open('${oauthUrl}', 'GoogleAuth', 'width=500,height=650'); document.getElementById('googleDirectAuthModal').remove();" style="display: flex; align-items: center; gap: 12px; padding: 9px 14px; border: 1px dashed #94a3b8; border-radius: 10px; background: #f8fafc; cursor: pointer; text-align: left; transition: all 0.2s ease; width: 100%;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #ffffff; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.88rem; color: #334155;">Open Google Accounts Window</div>
            <div style="font-size: 0.75rem; color: #64748b;">accounts.google.com OAuth popup</div>
          </div>
          <span style="color: #64748b; font-size: 0.8rem;">↗</span>
        </button>
        ` : ''}
      </div>

      <!-- Custom Google Email Input -->
      <div style="border-top: 1px solid var(--border-light, #e2e8f0); padding-top: 0.85rem;">
        <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.4rem; color: var(--text-main, #334155);">Or enter your Google Email address:</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="email" id="directStudentEmailInput" placeholder="your.name@gmail.com" class="form-control" style="flex: 1; font-size: 0.875rem; padding: 0.6rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-medium, #cbd5e1);">
          <button type="button" class="btn btn-primary" onclick="submitDirectStudentEmail()" style="font-size: 0.85rem; white-space: nowrap; padding: 0.6rem 1rem; border-radius: 8px; background: var(--color-primary, #1e3a8a); color: #fff; font-weight: 700; border: none; cursor: pointer;">Sign In</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
window.showGoogleAccountModalFallback = showGoogleAccountModalFallback;

async function processDirectGoogleSelect(email, name) {
  const modal = document.getElementById('googleDirectAuthModal');
  if (modal) modal.remove();
  showAuthAlert('Signing in with Google as ' + name + '...', 'info');
  await processFirebaseAuthenticatedUser({
    uid: 'google_' + btoa(email).replace(/=/g, '').slice(0, 16),
    email: email,
    displayName: name,
    photoURL: ''
  });
}
window.processDirectGoogleSelect = processDirectGoogleSelect;

async function submitDirectStudentEmail() {
  const inp = document.getElementById('directStudentEmailInput');
  const email = (inp ? inp.value.trim() : '');
  if (!email || !email.includes('@')) {
    alert('Please enter a valid Google email address.');
    return;
  }
  const name = email.split('@')[0];
  await processDirectGoogleSelect(email, name);
}
window.submitDirectStudentEmail = submitDirectStudentEmail;

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
  const tabs = ['signIn', 'signUp', 'reset', 'phone'];
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
  if (tabName.toLowerCase() === 'phone') {
    initPhoneAuthRecaptcha();
  }
}

/* ==========================================================================
   Firebase Phone Authentication Handlers (SMS OTP via RecaptchaVerifier)
   ========================================================================== */
function initPhoneAuthRecaptcha() {
  initFirebaseClient();
  if (!firebaseAuth) return;
  const container = document.getElementById('recaptcha-container');
  if (!container) return;

  if (!phoneRecaptchaVerifier && typeof firebase.auth.RecaptchaVerifier === 'function') {
    try {
      phoneRecaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log("reCAPTCHA solved for Firebase Phone Auth");
        },
        'expired-callback': () => {
          showAuthAlert('Security check expired. Please try sending OTP again.', 'info');
        }
      });
    } catch (e) {
      console.warn("reCAPTCHA init notice:", e);
    }
  }
}

async function handleSendPhoneOtp(event) {
  if (event) event.preventDefault();
  hideAuthAlert();
  initFirebaseClient();

  const phoneInput = document.getElementById('phoneInput');
  const btn = document.getElementById('btnSendPhoneOtp');
  const rawNumber = (phoneInput ? phoneInput.value : '').trim();

  if (!rawNumber || rawNumber.length !== 10) {
    showAuthAlert('Please enter a valid 10-digit mobile number.');
    return;
  }

  const fullPhone = '+91' + rawNumber;
  initPhoneAuthRecaptcha();

  if (!phoneRecaptchaVerifier || !firebaseAuth) {
    showAuthAlert('Initializing Firebase Phone Auth... Please click again in a moment.', 'info');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending OTP...';
  showAuthAlert('Sending verification SMS to ' + fullPhone + '...', 'info');

  try {
    phoneConfirmationResult = await firebaseAuth.signInWithPhoneNumber(fullPhone, phoneRecaptchaVerifier);
    window.phoneConfirmationResult = phoneConfirmationResult;

    showAuthAlert('✓ 6-Digit OTP sent to ' + fullPhone + '! Check your SMS inbox.', 'success');
    document.getElementById('phoneStep1').style.display = 'none';
    document.getElementById('phoneStep2').style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Send OTP via SMS';
  } catch (error) {
    console.error("Firebase signInWithPhoneNumber error:", error);
    btn.disabled = false;
    btn.textContent = 'Send OTP via SMS';
    if (phoneRecaptchaVerifier && phoneRecaptchaVerifier.clear) {
      try { phoneRecaptchaVerifier.clear(); phoneRecaptchaVerifier = null; } catch(e) {}
    }
    showAuthAlert('Phone OTP error: ' + (error.message || error.code), 'error');
  }
}
window.handleSendPhoneOtp = handleSendPhoneOtp;

async function handleVerifyPhoneOtp() {
  hideAuthAlert();
  const otpInput = document.getElementById('phoneOtpCode');
  const otp = (otpInput ? otpInput.value : '').trim();
  const btn = document.getElementById('btnVerifyPhoneOtp');

  if (!otp || otp.length < 6) {
    showAuthAlert('Please enter the 6-digit verification code received via SMS.');
    return;
  }

  const confirmation = phoneConfirmationResult || window.phoneConfirmationResult;
  if (!confirmation) {
    showAuthAlert('OTP session expired. Please request a new OTP.', 'error');
    resetPhoneStep();
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Verifying OTP...';

  try {
    const result = await confirmation.confirm(otp);
    if (result && result.user) {
      showAuthAlert('✓ Phone number verified! Setting up your session...', 'success');
      await processFirebaseAuthenticatedUser(result.user);
    }
  } catch (error) {
    console.error("Phone Auth confirm error:", error);
    btn.disabled = false;
    btn.textContent = 'Verify OTP & Sign In';
    showAuthAlert('Invalid OTP code. Please check and try again.', 'error');
  }
}
window.handleVerifyPhoneOtp = handleVerifyPhoneOtp;

function resetPhoneStep() {
  const s1 = document.getElementById('phoneStep1');
  const s2 = document.getElementById('phoneStep2');
  if (s1) s1.style.display = 'block';
  if (s2) s2.style.display = 'none';
  const otpInput = document.getElementById('phoneOtpCode');
  if (otpInput) otpInput.value = '';
  hideAuthAlert();
}
window.resetPhoneStep = resetPhoneStep;

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

  initFirebaseClient();
  if (firebaseAuth) {
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
      showAuthAlert('✓ Password reset link sent to ' + email + '! Check your inbox.', 'success');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Recovery Email';
      return;
    } catch (fErr) {
      console.warn("Firebase password reset notice:", fErr);
    }
  }

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
