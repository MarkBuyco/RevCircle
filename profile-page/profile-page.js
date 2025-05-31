function openEditProfile() {
  const modal = document.getElementById("editProfileModal");
  const usernameInput = document.getElementById("username");
  const displayName = document.getElementById("displayUsername").textContent;

  // Strip '@' from display name and set input value
  usernameInput.value = displayName.replace(/^@/, "");

  modal.style.display = "flex";
}

function closeEditProfile() {
  const modal = document.getElementById("editProfileModal");
  modal.style.display = "none";
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log("Token on profile page load:", token);

  if (!token) {
    console.log("No token found, redirecting to login");
    window.location.href = '../login-page/login.html';
    return;
  }

  try {
    // Fetch user profile info
    const res = await fetch('http://localhost:5000/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Profile fetch status:", res.status);

    if (!res.ok) throw new Error('Failed to fetch user profile');

    const userData = await res.json();

    // Update username and avatar on page
    document.getElementById('displayUsername').textContent = '@' + userData.username;

    if (userData.profileImage) {
      document.querySelector('.avatar').src = 'http://localhost:5000' + userData.profileImage;
    }

    // Populate the edit form username input for convenience
    document.getElementById('username').value = userData.username;

  } catch (error) {
    console.error(error);
    alert('Error loading profile. Please login again.');
    window.location.href = '../login-page/login.html';
  }
});

document.getElementById('profileUpdateForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const newUsername = document.getElementById('username').value;
  const newImage = document.getElementById('profileImage').files[0];

  const formData = new FormData();
  formData.append('username', newUsername);
  if (newImage) {
    formData.append('profileImage', newImage);
  }

  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log("🧪 token before fetch:", token);
    if (!token) {
      alert('No token found. Please log in again.');
      window.location.href = '../login-page/login.html';
      return;
    }

    const res = await fetch('http://localhost:5000/api/users/me', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
        // Don't set Content-Type when using FormData
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update profile: ${errorText}`);
    }

    const updatedUser = await res.json();
    console.log('✅ Profile updated:', updatedUser);

    // ✅ Update UI with latest values (Preview here!)
    document.getElementById('displayUsername').textContent = '@' + updatedUser.username;
    if (updatedUser.profileImage) {
      document.querySelector('.avatar').src = 'http://localhost:5000' + updatedUser.profileImage;
    }

    alert('✅ Profile updated successfully!');
    closeEditProfile();

  } catch (err) {
    console.error('❌ Error updating profile:', err);
  }
});



