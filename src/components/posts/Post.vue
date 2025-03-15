<template>
  <div class="post-page-container">
    <div class="post-container">
      <div v-if="loading" class="loading-spinner">Loading...</div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else class="post-content">
        <div class="admin-controls" v-if="isAdminOrAuthor">
          <button @click="showEditPost" class="edit-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button @click="confirmDelete" class="delete-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
          </button>
        </div>

        <div class="post-header">
          <h1>{{ post.title }}</h1>

          <div class="post-meta">
            <span class="author">{{ getAuthorName(post.author) }}</span>

            <span class="date" v-if="post.createdDate">
              {{
                new Date(post.createdDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}
            </span>
          </div>

          <div class="category" v-if="post.category">
            <span class="category-label">{{ post.category.name }}</span>
          </div>
        </div>

        <div class="featured-image-container" v-if="post.imageUrl">
          <img :src="post.imageUrl" :alt="post.title" class="featured-image" />
        </div>

        <div class="post-description" v-if="post.description">
          <p>{{ post.description }}</p>
        </div>

        <div class="post-body">
          <div v-html="post.content"></div>
        </div>

        <div class="post-footer">
          <router-link to="/" class="back-button">Back to news</router-link>
        </div>
      </div>

      <div class="modal-overlay" v-if="showDeleteModal" @click="cancelDelete">
        <div class="modal-content" @click.stop>
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete this post? This action cannot be undone.</p>

          <div class="modal-actions">
            <button @click="cancelDelete" class="cancel-btn">Cancel</button>
            <button @click="deletePost" class="confirm-delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <app-footer />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { server } from '@/utils/helper'
import type { Post as PostType } from '@/types/news'
import AppFooter from '@/components/layout/Footer.vue'
import { getAuthorName } from '@/utils/getFullName'

export default defineComponent({
  name: 'PostView',
  components: {
    AppFooter,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const post = ref<PostType>({
      id: '',
      title: '',
      description: '',
      content: '',
      imageUrl: '',
      createdDate: '',
      author: null,
      category: null,
    })

    const loading = ref(true)
    const error = ref('')
    const showDeleteModal = ref(false)
    const currentUser = ref<any>(null)

    const isAdminOrAuthor = computed(() => {
      if (!currentUser.value) return false

      if (currentUser.value.role === 'admin') return true

      if (post.value.author && currentUser.value.id === post.value.author.id) return true

      return false
    })

    const getPost = async () => {
      const id = route.params.id as string
      if (!id) return

      loading.value = true
      error.value = ''

      try {
        setTimeout(async () => {
          try {
            const response = await axios.get(`${server.BASE_URL}/news/post/${id}`, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
              },
            })
            post.value = response.data
            loading.value = false
          } catch (err: any) {
            console.error('Error fetching post:', err)
            if (err.response && err.response.status === 401) {
              const userStr = localStorage.getItem('user')
              if (!userStr) {
                router.push({
                  name: 'Login',
                  query: {
                    redirect: route.fullPath,
                    message: 'Please log in to view this article',
                  },
                })
              } else {
                error.value = 'Your session may have expired. Please log in again.'
                localStorage.removeItem('user')
              }
            } else {
              error.value = 'Failed to load the article.'
            }
            loading.value = false
          }
        }, 100)
      } catch (err) {
        console.error('Error in getPost outer try/catch:', err)
        loading.value = false
        error.value = 'An unexpected error occurred.'
      }
    }

    const confirmDelete = () => {
      showDeleteModal.value = true
    }

    const cancelDelete = () => {
      showDeleteModal.value = false
    }

    const deletePost = async () => {
      try {
        await axios.delete(`${server.BASE_URL}/news/post/${post.value.id}`, {
          withCredentials: true,
        })

        router.push({
          path: '/',

          query: { refresh: Date.now().toString(), message: 'Post deleted successfully' },
        })
      } catch (err) {
        console.error('Error deleting post:', err)
        error.value = 'Failed to delete the post. Please try again.'
        showDeleteModal.value = false
      }
    }

    const showEditPost = () => {
      router.push(`/edit/${post.value.id}`)
    }

    onMounted(() => {
      window.scrollTo(0, 0)

      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push({
          name: 'Login',
          query: {
            redirect: route.fullPath,
            message: 'Please log in to view full articles',
          },
        })
        return
      }

      try {
        currentUser.value = JSON.parse(userStr)
      } catch (err) {
        console.error('Error parsing user data')
      }

      getPost()
    })

    watch(
      () => route.params.id,
      (newId) => {
        if (newId) {
          getPost()
        }
      },
    )

    return {
      post,
      loading,
      error,
      isAdminOrAuthor,
      showDeleteModal,
      confirmDelete,
      cancelDelete,
      deletePost,
      showEditPost,
      getAuthorName,
    }
  },
})
</script>

<style scoped>
.post-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  flex: 1;
}

.loading-spinner {
  text-align: center;
  padding: 60px;
  color: #555;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  min-height: 300px;
}

.loading-spinner::before {
  content: '';
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #e2e8f0;
  border-top-color: #42b983;
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 20px;
  border-radius: 8px;
  margin: 30px 0;
  border-left: 5px solid #ef4444;
}

.post-header {
  margin-bottom: 35px;
}

.post-page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 20px;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

h1 {
  font-size: 2.8rem;
  margin-bottom: 20px;
  line-height: 1.2;
  color: #1a202c;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.post-meta {
  display: flex;
  gap: 18px;
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 20px;
  align-items: center;
}

.author {
  font-weight: 600;
  color: #334155;
}

.date {
  position: relative;
  padding-left: 18px;
}

.date::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background-color: #cbd5e0;
  border-radius: 50%;
}

.category {
  margin-top: 15px;
}

.category-label {
  background-color: #42b983;
  color: white;
  padding: 6px 14px;
  font-size: 0.85rem;
  border-radius: 20px;
  font-weight: 500;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(66, 185, 131, 0.2);
}

.featured-image-container {
  margin: 0 -20px 30px;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.featured-image {
  width: 100%;
  max-height: 550px;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.featured-image:hover {
  transform: scale(1.02);
}

.post-description {
  font-size: 1.3rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 30px;
  line-height: 1.6;
  padding: 0 0 25px;
  border-bottom: 1px solid #e2e8f0;
  font-style: italic;
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-body {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #2d3748;
  flex: 1;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
}

.post-body p {
  margin-bottom: 24px;
  max-width: 100%;
}

.post-body h2 {
  font-size: 1.8rem;
  margin-top: 36px;
  margin-bottom: 18px;
  color: #1a202c;
}

.post-body h3 {
  font-size: 1.5rem;
  margin-top: 32px;
  margin-bottom: 16px;
  color: #1a202c;
}
.post-body img {
  max-width: 100%;
  height: auto;
}

.post-body a {
  color: #42b983;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
  transition: color 0.2s;
}

.post-body a:hover {
  color: #3ba876;
  text-decoration-thickness: 2px;
}

.post-body blockquote {
  border-left: 4px solid #42b983;
  padding-left: 20px;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  color: #4a5568;
}

.post-body pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.post-body ul,
.post-body ol {
  padding-left: 24px;
  margin-bottom: 24px;
}

.post-body li {
  margin-bottom: 8px;
}

.post-footer {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.25s ease;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(66, 185, 131, 0.25);
}

.back-button:hover {
  background-color: #35a471;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(66, 185, 131, 0.3);
}

.back-button:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(66, 185, 131, 0.2);
}

.admin-controls {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 20px;
}

.edit-btn,
.delete-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.edit-btn {
  background-color: #3182ce;
  color: white;
  box-shadow: 0 2px 5px rgba(49, 130, 206, 0.3);
}

.edit-btn:hover {
  background-color: #2c5282;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(49, 130, 206, 0.4);
}

.delete-btn {
  background-color: #e53e3e;
  color: white;
  box-shadow: 0 2px 5px rgba(229, 62, 62, 0.3);
}

.delete-btn:hover {
  background-color: #c53030;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(229, 62, 62, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  color: #e53e3e;
  font-size: 1.5rem;
}

.modal-content p {
  margin-bottom: 25px;
  color: #4a5568;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.cancel-btn,
.confirm-delete-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background-color: #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover {
  background-color: #cbd5e0;
}

.confirm-delete-btn {
  background-color: #e53e3e;
  color: white;
}

.confirm-delete-btn:hover {
  background-color: #c53030;
}

@media (max-width: 768px) {
  .post-container {
    padding: 20px 16px 40px;
    border-radius: 8px;
  }

  h1 {
    font-size: 2.2rem;
    margin-bottom: 16px;
  }

  .post-meta {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .date::before {
    display: none;
  }

  .date {
    padding-left: 0;
  }

  .featured-image-container {
    margin: 0 -16px 25px;
  }

  .featured-image {
    max-height: 400px;
  }

  .post-description {
    font-size: 1.2rem;
    padding-bottom: 20px;
    margin-bottom: 25px;
  }

  .post-body {
    font-size: 1.05rem;
    line-height: 1.7;
  }
}

@media (max-width: 480px) {
  .admin-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .edit-btn,
  .delete-btn {
    justify-content: center;
  }

  .modal-content {
    padding: 20px;
  }
  h1 {
    font-size: 1.8rem;
  }

  .post-meta {
    font-size: 0.9rem;
  }

  .featured-image {
    max-height: 250px;
  }

  .post-description {
    font-size: 1.1rem;
  }

  .post-body {
    font-size: 1rem;
    line-height: 1.6;
  }
}
</style>
