// js/login.js
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const appName = document.getElementById('appName').value.trim();

  try {
    const response = await fetch('http://192.168.21.113:4000/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: username,
        email,
        appName,
        fcmToken: ''
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Registration failed');

    localStorage.setItem('user', JSON.stringify(data.data));
    window.location.href = 'chat.html';
  } catch (err) {
    Swal.fire({
      title: 'Oops!',
      text: err.message || 'Something went wrong. Please try again.',
      icon: 'error',
      confirmButtonText: 'Retry'
    });
  }
});
