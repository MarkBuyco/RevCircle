document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent page reload

  const fullName = document.getElementById('name').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${window.location.origin}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, username, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Signup successful!');
      window.location.href = '../login-page/login.html';
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    alert('Error connecting to server');
    console.error(err);
  }
});
