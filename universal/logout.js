// LOGOUT FUNCTION
function logout() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.location.href = '../login-page/login.html';
}