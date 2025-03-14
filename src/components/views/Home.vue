<template>
  <div class="bbc-news-homepage">
    <header-banner :current-date="currentDate" />

    <category-nav
      :categories="categories"
      :selected-category="selectedCategory"
      @filter="filterByCategory"
    />

    <div v-if="filteredPosts.length > 0">
      <news-carousel
        :posts="filteredPosts.slice(0, Math.min(5, filteredPosts.length))"
        :current-slide="currentSlide"
        @next-slide="nextSlide"
        @prev-slide="prevSlide"
        @go-to-slide="goToSlide"
        @view-post="showLoginPrompt"
      />

      <section-divider />

      <featured-articles
        :posts="filteredPosts.slice(1, 4)"
        :format-time-ago="formatTimeAgo"
        :truncate-text="truncateText"
        @view-post="showLoginPrompt"
      />

      <section-divider />

      <latest-news
        :posts="filteredPosts.slice(4)"
        :is-admin="isAdmin"
        :format-time-ago="formatTimeAgo"
        :truncate-text="truncateText"
        @delete-post="deletePost"
        @view-post="showLoginPrompt"
      />
    </div>

    <empty-state v-else :selected-category="selectedCategory" @filter="filterByCategory" />

    <app-footer />

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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import { server } from '@/utils/helper'
import { useRoute, useRouter } from 'vue-router'

import HeaderBanner from '@/components/home/HeaderBanner.vue'
import CategoryNav from '@/components/home/CategoryNav.vue'
import SectionDivider from '@/components/home/SectionDivider.vue'
import EmptyState from '@/components/home/EmptyState.vue'
import FeaturedArticles from '@/components/home/FeaturedArticles.vue'
import LatestNews from '@/components/home/LatestNews.vue'
import NewsCarousel from '@/components/home/NewsCarousel.vue'
import AppFooter from '@/components/layout/Footer.vue'

import type { Post, Category } from '@/types/news'

export default defineComponent({
  name: 'Home',
  components: {
    HeaderBanner,
    CategoryNav,
    NewsCarousel,
    SectionDivider,
    FeaturedArticles,
    LatestNews,
    EmptyState,
    AppFooter,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const posts = ref<Post[]>([])
    const categories = ref<Category[]>([])
    const isLoading = ref(true)
    const error = ref('')
    const selectedCategory = ref('')
    const currentSlide = ref(0)
    const autoplayInterval = ref<number | null>(null)
    const isAdmin = ref(false)
    const currentDate = ref(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    )

    const showLoginModal = ref(false)
    const pendingPostId = ref('')

    const filteredPosts = computed(() => {
      if (!selectedCategory.value) return posts.value
      return posts.value.filter(
        (post) => post.category && post.category.id === selectedCategory.value,
      )
    })

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

    const maxCarouselSlides = computed(() => {
      return Math.min(5, filteredPosts.value.length)
    })

    const nextSlide = () => {
      if (currentSlide.value < maxCarouselSlides.value - 1) {
        currentSlide.value++
      } else {
        currentSlide.value = 0
      }
    }

    const prevSlide = () => {
      if (currentSlide.value > 0) {
        currentSlide.value--
      } else {
        currentSlide.value = maxCarouselSlides.value - 1
      }
    }

    const goToSlide = (index: number) => {
      currentSlide.value = index

      if (autoplayInterval.value) {
        startAutoplay()
      }
    }

    const startAutoplay = () => {
      clearAutoplay()

      autoplayInterval.value = window.setInterval(() => {
        if (currentSlide.value < maxCarouselSlides.value - 1) {
          currentSlide.value++
        } else {
          currentSlide.value = 0
        }
      }, 5000)
    }

    const clearAutoplay = () => {
      if (autoplayInterval.value !== null) {
        clearInterval(autoplayInterval.value)
        autoplayInterval.value = null
      }
    }

    const fetchPosts = async () => {
      isLoading.value = true
      error.value = ''

      try {
        const response = await axios.get(`${server.BASE_URL}/news/posts`)
        posts.value = response.data
      } catch (err) {
        console.error('Error fetching posts:', err)
        error.value = 'Failed to load posts. Please try again later.'
      } finally {
        isLoading.value = false
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${server.BASE_URL}/news-categories`)
        categories.value = response.data
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    const filterByCategory = (categoryId: string) => {
      selectedCategory.value = categoryId
    }

    const deletePost = async (postId: string) => {
      if (!confirm('Are you sure you want to delete this post?')) return

      try {
        await axios.delete(`${server.BASE_URL}/news/delete/${postId}`, {
          withCredentials: true,
        })
        posts.value = posts.value.filter((post) => post.id !== postId)
      } catch (err) {
        console.error('Error deleting post:', err)
        alert('Failed to delete post. Please try again.')
      }
    }

    const checkUserRole = () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        isAdmin.value = user.role === 'admin'
      }
    }

    const showLoginPrompt = (postId: string) => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        router.push(`/post/${postId}`)
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
      router.push({
        name: 'Login',
        query: {
          redirect: `/post/${pendingPostId.value}`,
          message: 'Please log in to read the full article',
        },
      })
      closeLoginModal()
    }

    const navigateToRegister = () => {
      router.push({
        name: 'Register',
        query: { redirect: `/post/${pendingPostId.value}` },
      })
      closeLoginModal()
    }

    watch(
      () => route.query.refresh,
      () => {
        fetchPosts()
      },
    )

    watch(
      () => posts.value,
      () => {
        currentSlide.value = 0
        startAutoplay()
      },
    )

    watch(
      () => selectedCategory.value,
      () => {
        currentSlide.value = 0
        if (autoplayInterval.value) {
          startAutoplay()
        }
      },
    )

    onMounted(() => {
      fetchPosts()
      fetchCategories()
      checkUserRole()
      startAutoplay()
    })

    watch(
      () => posts.value,
      () => {
        currentSlide.value = 0
        startAutoplay()
      },
    )

    onUnmounted(() => {
      clearAutoplay()
    })

    return {
      posts,
      filteredPosts,
      categories,
      isLoading,
      error,
      selectedCategory,
      currentSlide,
      isAdmin,
      currentDate,
      formatTimeAgo,
      truncateText,
      nextSlide,
      prevSlide,
      goToSlide,
      filterByCategory,
      deletePost,
      showLoginModal,
      showLoginPrompt,
      closeLoginModal,
      navigateToLogin,
      navigateToRegister,
    }
  },
})
</script>

<style scoped>
.bbc-news-homepage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: ReithSans, Arial, Helvetica, sans-serif;
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

.back-to-top {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(66, 185, 131, 0.3);
}

.back-to-top:hover {
  background-color: #3ca575;
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.4);
}

@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
  }
  .simple-footer {
    margin-top: 40px;
  }

  .login-btn,
  .register-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>
