const clientId = '818059891079-kh6vpef04bkov0ic1ajk7a5g100oaejt.apps.googleusercontent.com';
const redirectUri = 'http://localhost:3000/login.html';
const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&nonce=12345`;

console.log('Testing URL:', url);
fetch(url, { redirect: 'follow' })
  .then(async res => {
    console.log('Status code:', res.status);
    console.log('Final URL:', res.url);
    const body = await res.text();
    console.log('Body length:', body.length);
    if (body.includes('redirect_uri_mismatch')) {
      console.log('RESULT: redirect_uri_mismatch! The redirect URI http://localhost:3000/login.html is not added to Google Cloud Console.');
    } else if (body.includes('deleted_client') || body.includes('invalid_client')) {
      console.log('RESULT: invalid_client or deleted_client.');
    } else if (body.includes('Sign in') || body.includes('Choose an account') || body.includes('google')) {
      console.log('RESULT: Google returned Sign In / Choose Account page successfully!');
    }
  })
  .catch(err => {
    console.error('Fetch error:', err);
  });

