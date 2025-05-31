function goToSignup() {
  window.location.href = '../signup-page/signup.html';
}

const login = async () => {
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const rememberMe = document.querySelector('#remember').checked;

  try {
    const res = await fetch('https://revcircle.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Save the token based on rememberMe
      if (rememberMe) {
        localStorage.setItem('token', data.token);
      } else {
        sessionStorage.setItem('token', data.token);
      }

      alert('Login successful!');
      window.location.href = '../home-page/home-page.html';
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Something went wrong. Please try again later.');
  }
};

// Attach event listener to login button if you want
document.querySelector('.btn-login').addEventListener('click', (e) => {
  e.preventDefault(); // prevent form submit default reload
  login();
});
