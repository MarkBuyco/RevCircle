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

    // For deleting comment and post
    function parseJwt(token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    }

const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const currentUser = parseJwt(token);


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
          ${post.userId?._id === currentUser.id ? `<button class="delete-post-btn" data-id="${post._id}">🗑️ Delete</button>` : ''}
        </div>
      </div>

    <div class="comments">
      ${Array.isArray(post.comments) && post.comments.map(comment => {
        const isOwner = currentUser && (currentUser._id === comment.userId?._id || currentUser.id === comment.userId?._id);
        return `
          <div class="comment">
            <strong>@${comment.userId?.username || 'user'}:</strong> ${comment.text}
            ${isOwner ? `<button class="delete-comment-btn" data-post="${post._id}" data-comment="${comment._id}">🗑️</button>` : ''}
          </div>
        `;
      }).join('') || ''}

      <form class="comment-form" data-id="${post._id}">
        <input type="text" placeholder="Write a comment..." required />
        <button type="submit">Post</button>
      </form>
    </div>

      `;

      postCard.innerHTML = postHTML;
      feed.appendChild(postCard);

    // Now that the post is in the DOM, attach delete button listener
    const deleteButton = postCard.querySelector('.delete-post-btn');
    if (deleteButton) {
      deleteButton.addEventListener('click', async () => {
        const postId = deleteButton.getAttribute('data-id');
        if (!confirm('Delete this post?')) return;

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        try {
          const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.ok) {
            alert('Post deleted!');
            postCard.remove(); // Remove post without full page reload
          } else {
            const data = await res.json();
            alert(data.message || 'Error deleting post');
          }
        } catch (err) {
          console.error('Error deleting post:', err);
          alert('Server error');
        }
      });
    }
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

// DELETE COMMENT
document.querySelectorAll('.delete-comment-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const postId = button.getAttribute('data-post');     // ✅ matches HTML
    const commentId = button.getAttribute('data-comment'); // ✅ matches HTML

    if (!confirm('Delete this comment?')) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        alert('Comment deleted!');
        location.reload();
      } else {
        alert(data.message || 'Error deleting comment');
      }
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  });
});


  } catch (err) {
    console.error('Error loading posts:', err);
  }
});

// DELETE POST
document.querySelectorAll('.delete-post-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const postId = button.getAttribute('data-id');
    if (!confirm('Delete this post?')) return;

    const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert('Post deleted!');
      location.reload();
    } else {
      const data = await res.json();
      alert(data.message || 'Error deleting post');
    }
  });
});

// DELETE COMMENT
document.querySelectorAll('.delete-comment-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const postId = button.getAttribute('data-postid');
    const commentId = button.getAttribute('data-commentid');
    if (!confirm('Delete this comment?')) return;

    const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert('Comment deleted!');
      location.reload();
    } else {
      const data = await res.json();
      alert(data.message || 'Error deleting comment');
    }
  });
});


// LOGOUT FUNCTION
function logout() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.location.href = '../login-page/login.html';
}
