// Profile Page JavaScript

// Function to toggle the visibility of the profile menu
function openEditProfile() {
    document.getElementById('editProfileModal').style.display = 'flex';
}

// Function to close the profile menu
function closeEditProfile() {
    document.getElementById('editProfileModal').style.display = 'none';
}

// Handle Edit Form Submission
document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get new username and image from form
    const newUsername = document.getElementById('username').value;
    const newImage = document.getElementById('profileImage').files[0];

    // Update username display
    document.getElementById('displayUsername').textContent = newUsername;

    // Update avatar image preview if new file is selected
    if (newImage) {
    const reader = new FileReader();
    reader.onload = function(e) {
        document.querySelector('.avatar').src = e.target.result;
    };
    reader.readAsDataURL(newImage);
    }

    // Close modal
    closeEditProfile();
});
