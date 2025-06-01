// IMAGE PREVIEW FILENAME
document.getElementById('imageUpload').addEventListener('change', function () {
  const fileName = this.files[0]?.name || 'No file chosen';
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
    const res = await fetch('https://revcircle.onrender.com/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      alert('Post created!');
      location.reload();
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
    const res = await fetch('https://revcircle.onrender.com/api/posts');
    const posts = await res.json();
    const feed = document.querySelector('.feed');
    feed.innerHTML = '';

    // Parse JWT to identify current user
    function parseJwt(token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch {
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
            <img src="https://revcircle.onrender.com/${post.image}" alt="Post image" />
          </div>
        `;
      }

      const likeCount = post.likes?.length || 0;
      const commentCount = post.comments?.length || 0;

      postHTML += `
        <div class="post-footer">
          <span>Posted by @${post.userId?.username || 'Unknown'}</span>
          <div class="actions">
            <button class="like-btn" data-id="${post._id}">👍 ${likeCount}</button>
            <span class="comment-count">💬 ${commentCount}</span>
            ${post.userId?._id === currentUser?.id ? `<button class="delete-post-btn" data-id="${post._id}"> Delete Post</button>` : ''}
          </div>
        </div>

        <div class="comments">
          ${(post.comments || []).map(comment => {
            const isOwner = currentUser?.id === comment.userId?._id;
            return `
              <div class="comment">
                <strong>@${comment.userId?.username || 'user'}:</strong> ${comment.text}
                ${isOwner ? `<button class="delete-comment-btn" data-post="${post._id}" data-comment="${comment._id}">Delete</button>` : ''}
              </div>
            `;
          }).join('')}

          <form class="comment-form" data-id="${post._id}">
            <input type="text" placeholder="Write a comment..." required />
            <button type="submit">Post</button>
          </form>
        </div>
      `;

      postCard.innerHTML = postHTML;
      feed.appendChild(postCard);

      // COMMENT SUBMISSION HANDLER
      postCard.querySelector('.comment-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const postId = form.dataset.id;
        const input = form.querySelector('input');
        const commentText = input.value.trim();

        if (!commentText) return alert('Comment cannot be empty.');

        try {
          const res = await fetch(`https://revcircle.onrender.com/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: commentText })
          });

          const data = await res.json();
          if (res.ok) {
            alert('Comment added!');
            location.reload();
          } else {
            alert(data.message || 'Error adding comment');
          }
        } catch (err) {
          console.error('Add comment error:', err);
          alert('Server error');
        }
      });

      // DELETE COMMENT
      postCard.querySelectorAll('.delete-comment-btn').forEach(button => {
        button.addEventListener('click', async () => {
          console.log('Delete comment button clicked');
          if (!confirm('Delete this comment?')) {
            console.log('Delete canceled by user');

            return;
          }
          
          console.log('Deleting comment for post:', button.dataset.post);
          console.log('Comment ID:', button.dataset.comment);
          console.log('URL:', `https://revcircle.onrender.com/api/posts/${button.dataset.post}/comments/${button.dataset.comment}`)

          console.log('Confirmed delete. Sending DELETE request for comment:', button.dataset.comment, 'post:', button.dataset.post);

          try {
            const res = await fetch(`https://revcircle.onrender.com/api/posts/${button.dataset.post}/comments/${button.dataset.comment}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            console.log('Delete comment response:', data);

            if (res.ok) {
              alert('Comment deleted!');
              location.reload();
            } else {
              alert(data.message || 'Error deleting comment');
            }
          } catch (err) {
            console.error('Delete comment error:', err);
            alert('Server error while deleting comment');
          }
        });
      });


      // DELETE POST
      const deleteBtn = postCard.querySelector('.delete-post-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (!confirm('Delete this post?')) return;

          const res = await fetch(`https://revcircle.onrender.com/api/posts/${deleteBtn.dataset.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          const data = await res.json();
          if (res.ok) {
            alert('Post deleted!');
            postCard.remove(); // No need to reload
          } else {
            alert(data.message || 'Error deleting post');
          }
        });
      }

      // LIKE POST
      postCard.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', async () => {
          const res = await fetch(`https://revcircle.onrender.com/api/posts/${button.dataset.id}/like`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await res.json();
          if (res.ok) {
            alert('You liked or unliked a post!');
            location.reload(); // You can optimize this by updating UI directly
          } else {
            alert(data.message || 'Like failed');
          }
        });
      });
    });
  } catch (err) {
    console.error('Error loading posts:', err);
  }
});




