// js/index.js

const user = localStorage.getItem('user');

if (user) {
  // Redirect to chat if user is logged in
  window.location.href = 'chat.html';
} else {
  // Otherwise, go to login page
  window.location.href = 'login.html';
}
