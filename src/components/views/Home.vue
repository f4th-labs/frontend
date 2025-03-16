<template>
  <div class="news-homepage">
    <header-banner :current-date="currentDate" />

    <category-nav
      :categories="categories"
      :selected-category="selectedCategory"
      @filter="filterByCategory"
    />

    <div class="content-wrapper">
      <div v-if="filteredPosts.length > 0">
        <news-carousel
          v-if="carouselPosts.length > 0 && currentSlide < carouselPosts.length"
          :posts="carouselPosts"
          :current-slide="currentSlide"
          @next-slide="nextSlide"
          @prev-slide="prevSlide"
          @go-to-slide="goToSlide"
          @view-post="showLoginPrompt"
        />

        <section-divider v-if="carouselPosts.length > 0" />

        <featured-articles
          v-if="featuredPosts.length > 0"
          :posts="featuredPosts"
          :format-time-ago="formatTimeAgo"
          :truncate-text="truncateText"
          @view-post="showLoginPrompt"
        />

        <section-divider v-if="featuredPosts.length > 0" />

        <latest-news
          v-if="latestPosts.length > 0"
          :posts="latestPosts"
          :format-time-ago="formatTimeAgo"
          :truncate-text="truncateText"
          @view-post="showLoginPrompt"
        />
      </div>

      <empty-state v-else :selected-category="selectedCategory" @filter="filterByCategory" />
    </div>

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

    const carouselPosts = computed(() => {
      const carouselCount = Math.min(Math.ceil(filteredPosts.value.length / 3), 5)
      return filteredPosts.value.slice(0, carouselCount)
    })

    const featuredPosts = computed(() => {
      const carouselCount = carouselPosts.value.length

      const featuredCount = Math.min(Math.ceil((filteredPosts.value.length - carouselCount) / 2), 3)

      return filteredPosts.value.slice(carouselCount, carouselCount + featuredCount)
    })

    const latestPosts = computed(() => {
      const usedCount = carouselPosts.value.length + featuredPosts.value.length
      return filteredPosts.value.slice(usedCount)
    })

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
      if (!carouselPosts.value || carouselPosts.value.length === 0) return 0
      return carouselPosts.value.length
    })

    const nextSlide = () => {
      if (maxCarouselSlides.value === 0) return

      if (currentSlide.value < maxCarouselSlides.value - 1) {
        currentSlide.value++
      } else {
        currentSlide.value = 0
      }
    }

    const prevSlide = () => {
      if (maxCarouselSlides.value === 0) return

      if (currentSlide.value > 0) {
        currentSlide.value--
      } else {
        currentSlide.value = maxCarouselSlides.value - 1
      }
    }

    const goToSlide = (index: number) => {
      if (index < 0 || index >= maxCarouselSlides.value) return

      currentSlide.value = index

      if (autoplayInterval.value) {
        startAutoplay()
      }
    }

    const startAutoplay = () => {
      clearAutoplay()

      if (maxCarouselSlides.value === 0) return

      autoplayInterval.value = window.setInterval(() => {
        if (maxCarouselSlides.value > 0) {
          if (currentSlide.value < maxCarouselSlides.value - 1) {
            currentSlide.value++
          } else {
            currentSlide.value = 0
          }
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
      () => route.path,
      (newPath) => {
        if (newPath === '/' || newPath === '/home') {
          fetchPosts()
          fetchCategories()

          currentSlide.value = 0
          if (autoplayInterval.value) {
            startAutoplay()
          }
        }
      },
      { immediate: true },
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
      startAutoplay()
    })

    watch(
      () => posts.value,
      (newPosts) => {
        if (newPosts && newPosts.length > 0) {
          currentSlide.value = 0
          startAutoplay()
        } else {
          clearAutoplay()
        }
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
      currentDate,
      formatTimeAgo,
      truncateText,
      nextSlide,
      prevSlide,
      goToSlide,
      filterByCategory,
      showLoginModal,
      showLoginPrompt,
      closeLoginModal,
      navigateToLogin,
      navigateToRegister,
      carouselPosts,
      featuredPosts,
      latestPosts,
    }
  },
})
</script>

<style scoped>
.news-homepage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: ReithSans, Arial, Helvetica, sans-serif;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
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
