const resetPassword = async () => {
  const email = document.querySelector('#email').value;
  const newPassword = document.querySelector('#newPassword').value;

  const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword })
  });

  const data = await res.json();

  if (res.ok) {
    alert('Password updated successfully!');
    window.location.href = '../login-page/login.html';
  } else {
    alert(data.message || 'Failed to reset password');
  }
};

document.querySelector('#resetForm').addEventListener('submit', function (e) {
  e.preventDefault(); // prevent the page from reloading
  resetPassword();    // call the async function
});
