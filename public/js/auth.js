const alertArea = document.getElementById('alert-area');
const nextUrl = new URLSearchParams(window.location.search).get('next') || '/index.html';

function showError(message) {
  alertArea.innerHTML = `<div class="alert alert-error">${escapeHtml(message)}</div>`;
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const { token, user } = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession(token, user);
      window.location.href = nextUrl;
    } catch (err) {
      showError(err.message);
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const { token, user } = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setSession(token, user);
      window.location.href = nextUrl;
    } catch (err) {
      showError(err.message);
    }
  });
}
