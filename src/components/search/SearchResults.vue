<template>
  <div class="search-results-container">
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Searching...</p>
    </div>

    <div v-else>
      <div class="search-header">
        <h1 v-if="searchQuery">
          Search results for: <span class="search-query">{{ searchQuery }}</span>
        </h1>
        <p class="results-count">{{ results.length }} results found</p>
      </div>

      <div v-if="results.length > 0" class="results-grid">
        <div v-for="post in results" :key="post.id" class="search-result-item">
          <div class="search-result-link" @click="showLoginPrompt(post.id)">
            <div class="result-image-container">
              <img
                :src="post.imageUrl || placeholderImage"
                :alt="post.title"
                class="result-image"
              />
              <div class="category-tag" v-if="post.category">{{ post.category.name }}</div>
            </div>
            <div class="result-content">
              <h2>{{ post.title }}</h2>
              <p class="result-description">{{ truncateText(post.description, 100) }}</p>
              <div class="result-meta">
                <span v-if="post.author">{{ post.author.fullName }}</span>
                <span v-else>Unknown author</span>
                <span>{{ formatTimeAgo(post.createdDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-results">
        <div class="no-results-icon">🔍</div>
        <h2>No results found</h2>
        <p>Try different keywords or browse all news</p>
        <router-link to="/" class="back-to-home">Back to Home</router-link>
      </div>
    </div>

    <div class="modal-overlay" v-if="showLoginModal" @click="closeLoginModal">
      <div class="login-modal" @click.stop>
        <div class="modal-header">
          <h3>Login Required</h3>
          <button class="close-button" @click="closeLoginModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>You need to log in to read the full article.</p>
          <div class="modal-actions">
            <button class="login-btn" @click="navigateToLogin">Log in</button>
            <button class="register-btn" @click="navigateToRegister">Register</button>
            <button class="cancel-btn" @click="closeLoginModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <app-footer />

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/types/news'
import placeholderImage from '@/assets/placeholder-image.png'
import AppFooter from '@/components/layout/Footer.vue'

export default defineComponent({
  name: 'SearchResults',
  components: {
    AppFooter,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const searchQuery = ref('')
    const results = ref<Post[]>([])
    const isLoading = ref(true)

    const showLoginModal = ref(false)
    const pendingPostId = ref('')

    const updateSearchQuery = () => {
      searchQuery.value = route.query.q?.toString() || ''
      if (searchQuery.value) {
        performSearch()
      } else {
        router.push('/')
      }
    }

    watch(() => route.query.q, updateSearchQuery)

    const performSearch = async () => {
      isLoading.value = true
      results.value = []

      try {
        const response = await fetch(
          `http://localhost:5001/news/search?q=${encodeURIComponent(searchQuery.value)}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error('Search failed')
        }

        results.value = await response.json()
      } catch (error) {
        console.error('Error searching posts:', error)
      } finally {
        isLoading.value = false
      }
    }

    const showLoginPrompt = (postId: string) => {
      const userStr = localStorage.getItem('user')

      if (userStr) {
        const postPath = `${window.location.origin}/post/${postId}`
        window.location.href = postPath
      } else {
        pendingPostId.value = postId
        showLoginModal.value = true
      }
    }

    const closeLoginModal = () => {
      showLoginModal.value = false
      pendingPostId.value = ''
    }

    const navigateToLogin = () => {
      const redirectPath = `/post/${pendingPostId.value}`
      const message = 'Please log in to read the full article'

      showLoginModal.value = false
      pendingPostId.value = ''

      window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}&message=${encodeURIComponent(message)}`
    }

    const navigateToRegister = () => {
      const redirectPath = `/post/${pendingPostId.value}`

      showLoginModal.value = false
      pendingPostId.value = ''

      window.location.href = `/register?redirect=${encodeURIComponent(redirectPath)}`
    }

    const formatTimeAgo = (dateString: string) => {
      if (!dateString) return ''

      try {
        const date = new Date(dateString)
        return formatDistanceToNow(date, { addSuffix: true })
      } catch {
        return dateString
      }
    }

    const truncateText = (text: string | null, length: number) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    onMounted(updateSearchQuery)

    return {
      searchQuery,
      results,
      isLoading,
      showLoginPrompt,
      formatTimeAgo,
      truncateText,
      placeholderImage,
      showLoginModal,
      closeLoginModal,
      navigateToLogin,
      navigateToRegister,
    }
  },
})
</script>

<style scoped>
.search-results-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 20px;
  min-height: calc(100vh - 60px);
  background-color: #fff;
}

.search-header {
  margin-bottom: 30px;
}

.search-query {
  color: #42b983;
  font-weight: bold;
}

.results-count {
  color: #666;
  margin-top: 5px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.search-result-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.search-result-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(66, 185, 131, 0.15);
  border-bottom: 3px solid hsla(160, 100%, 37%, 1);
}

.search-result-link {
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
}

.result-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.search-result-item:hover .result-image {
  transform: scale(1.05);
}

.category-tag {
  position: absolute;
  top: 15px;
  left: 15px;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  padding: 6px 12px;
  font-size: 0.75rem;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-result-item:hover .category-tag {
  background: #35a471;
  transform: translateY(-3px);
}

.result-content {
  padding: 20px;
}

.result-content h2 {
  margin: 0 0 10px;
  font-size: 1.3rem;
  transition: color 0.3s ease;
}

.search-result-item:hover h2 {
  color: hsla(160, 100%, 37%, 1);
}

.result-description {
  color: #555;
  margin-bottom: 15px;
  line-height: 1.5;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #777;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.loading {
  text-align: center;
  padding: 50px 0;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid hsla(160, 100%, 37%, 1);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-results {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.6;
}

.back-to-home {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.back-to-home:hover {
  background-color: #35a471;
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

.login-modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin-top: 0;
  margin-bottom: 20px;
  color: #555;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.login-btn,
.register-btn,
.cancel-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  min-width: 100px;
  transition: all 0.2s ease;
}

.login-btn {
  background-color: #42b983;
  color: white;
}

.login-btn:hover {
  background-color: #3ca575;
}

.register-btn {
  background-color: #4299e1;
  color: white;
}

.register-btn:hover {
  background-color: #3182ce;
}

.cancel-btn {
  background-color: #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover {
  background-color: #cbd5e0;
}

@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
  }

  .login-btn,
  .register-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>
