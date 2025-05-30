// IMAGE PREVIEW FILENAME
document.getElementById('imageUpload').addEventListener('change', function () {
  const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
  document.getElementById('fileName').textContent = fileName;
});

// FORM SUBMISSION HANDLER
document.getElementById('postForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('postTitle').value;
  const body = document.getElementById('postBody').value;
  const image = document.getElementById('imageUpload').files[0];

  const formData = new FormData();
  formData.append('title', title);
  formData.append('body', body);
  formData.append('caption', body);
  if (image) formData.append('image', image);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  try { 
    const res = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      alert('Post created!');
      location.reload(); // Reload the page to show the new post
    } else {
      alert(data.message || 'Error creating post');
    }
  } catch (err) {
    console.error('Post error:', err);
    alert('Server error');
  }
});

// RENDER POSTS ON PAGE LOAD
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('http://localhost:5000/api/posts');
    const posts = await res.json();

    const feed = document.querySelector('.feed');
    feed.innerHTML = ''; // Clear existing content

    posts.forEach(post => {
      const postCard = document.createElement('div');
      postCard.classList.add('post-card');

      let postHTML = `
        <h3 class="post-title">${post.title || 'Untitled'}</h3>
        <p class="post-body">${post.body}</p>
      `;

      if (post.image) {
        postHTML += `
          <div class="post-image">
            <img src="http://localhost:5000/${post.image}" alt="Post image" />
          </div>
        `;
      }

      const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
      const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

      postHTML += `
      <div class="post-footer">
        <span>Posted by @${post.userId?.username || 'Unknown'}</span>
        <div class="actions">
          <button class="like-btn" data-id="${post._id}">👍 ${likeCount}</button>
          <span>💬 ${commentCount}</span>
        </div>
      </div>

        <div class="comments">
          ${Array.isArray(post.comments) ? post.comments.map(c => `<div class="comment"><strong>@${c.userId?.username || 'user'}:</strong> ${c.text}</div>`).join('') : ''}
          <form class="comment-form" data-id="${post._id}">
            <input type="text" placeholder="Write a comment..." required />
            <button type="submit">Post</button>
          </form>
        </div>
      `;

      postCard.innerHTML = postHTML;
      feed.appendChild(postCard);
    }); 

          // LIKE button handler
document.querySelectorAll('.like-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const postId = button.getAttribute('data-id');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (res.ok) {
        alert('You Liked or unliked a post!');
        location.reload();
        button.textContent = `👍 ${data.likes.length}`;
      } else {
        alert(data.message || 'Like failed');
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  });
});

// COMMENT form submission handler
document.querySelectorAll('.comment-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postId = form.getAttribute('data-id');
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      if (res.ok) {
      alert('Comment added!');
      location.reload();
      const newCommentHTML = `<div class="comment"><strong>@${data.userId?.username || 'user'}:</strong> ${data.text}</div>`;
      form.insertAdjacentHTML('beforebegin', newCommentHTML);
      input.value = '';
      } else {
        alert(data.message || 'Comment failed');
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  });
});

  } catch (err) {
    console.error('Error loading posts:', err);
  }
});

// LOGOUT FUNCTION
function logout() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.location.href = '../login-page/login.html';
}
