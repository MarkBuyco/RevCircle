function openPostModal() {
  document.getElementById('postModal').style.display = 'flex';
}

function closePostModal() {
  document.getElementById('postModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
  const postForm = document.getElementById('postForm');

  postForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const caption = document.getElementById('caption').value;
    const image = document.getElementById('imageUpload').files[0];

    const reader = new FileReader();
    reader.onload = function () {
      const post = {
        caption,
        image: image ? reader.result : null,
        date: new Date().toISOString()
      };
      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      posts.unshift(post);
      localStorage.setItem('posts', JSON.stringify(posts));
      closePostModal();
      location.reload(); // refresh home page to show post
    };

    if (image) {
      reader.readAsDataURL(image);
    } else {
      reader.onload(); // simulate load if no image
    }
  });
});