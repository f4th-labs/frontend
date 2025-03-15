<template>
  <nav id="nav">
    <div class="nav-content">
      <div class="nav-links">
        <a href="/" class="home-link" title="Home">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="home-icon"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="home-text">Home</span>
        </a>

        <router-link to="/login" active-class="active" v-if="!isLoggedIn" class="login-link"
          >Login</router-link
        >
        <router-link to="/register" active-class="active" v-if="!isLoggedIn" class="register-link"
          >Register</router-link
        >
        <a href="#" @click.prevent="showLogoutConfirm" v-if="isLoggedIn" class="logout-link"
          >Logout</a
        >
      </div>

      <div class="actions-container">
        <div class="search-container">
          <form @submit.prevent="handleSearch">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search news..."
              class="search-input"
              aria-label="Search news articles"
            />
            <button type="submit" class="search-button">
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
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>

        <router-link
          to="/create"
          active-class="active"
          v-if="isAdminOrAuthor"
          class="create-button"
          title="Create New Post"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </router-link>
      </div>
    </div>
  </nav>

  <div class="modal-overlay" v-if="showingLogoutModal" @click="cancelLogout">
    <div class="modal-content" @click.stop>
      <h3>Confirm Logout</h3>
      <p>Are you sure you want to log out?</p>

      <div class="modal-actions">
        <button @click="cancelLogout" class="cancel-btn">Cancel</button>
        <button @click="confirmLogout" class="confirm-btn">Yes, Logout</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import router from '@/router'

export default defineComponent({
  name: 'NavBar',
  setup() {
    const searchQuery = ref('')
    const showingLogoutModal = ref(false)

    const isLoggedIn = computed(() => {
      const userStr = localStorage.getItem('user')
      return !!userStr
    })

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          path: '/search',
          query: { q: searchQuery.value.trim() },
        })
        searchQuery.value = ''
      }
    }

    const currentUser = computed(() => {
      if (!isLoggedIn.value) return null

      try {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
      } catch (e) {
        console.error('Error parsing user data:', e)
        return null
      }
    })

    const isAdminOrAuthor = computed(() => {
      if (!currentUser.value) return false
      return currentUser.value.role === 'admin' || currentUser.value.role === 'author'
    })

    const showLogoutConfirm = () => {
      showingLogoutModal.value = true
    }

    const cancelLogout = () => {
      showingLogoutModal.value = false
    }

    const confirmLogout = () => {
      localStorage.removeItem('user')
      localStorage.removeItem('token')

      showingLogoutModal.value = false

      router.push('/').then(() => {
        setTimeout(() => {
          window.location.reload()
        }, 100)
      })
    }

    return {
      searchQuery,
      isLoggedIn,
      showingLogoutModal,
      handleSearch,
      showLogoutConfirm,
      cancelLogout,
      confirmLogout,
      currentUser,
      isAdminOrAuthor
    }
  },
})
</script>

<style scoped>
#nav {
  padding: 15px 30px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  border-radius: 0 0 20px 20px;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

#nav a {
  font-weight: 500;
  color: #2c3e50;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

#nav a:hover:not(.login-link):not(.register-link):not(.create-button):not(.logout-link) {
  background-color: rgba(66, 185, 131, 0.1);
  color: #42b983;
}

#nav a.active,
#nav a.router-link-exact-active:not(.login-link):not(.register-link) {
  color: #42b983;
  background-color: rgba(66, 185, 131, 0.1);
}

.home-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px !important;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.home-icon {
  transition: all 0.3s ease;
}

.home-link:hover .home-icon,
.home-link.active .home-icon,
.home-link.router-link-exact-active .home-icon {
  color: #42b983;
}

.home-text {
  display: inline-block;
  font-weight: 500;
}

.login-link {
  background-color: #42b983 !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 8px 18px !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(66, 185, 131, 0.3);
  transition: all 0.2s ease;
}

.login-link:hover {
  background-color: #3ca575 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.4);
}

.login-link.active,
.login-link.router-link-exact-active {
  background-color: #3ca575 !important;
}

.register-link {
  background-color: #4299e1 !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 8px 18px !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
  transition: all 0.2s ease;
}

.register-link:hover {
  background-color: #3182ce !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 153, 225, 0.4);
}

.register-link.active,
.register-link.router-link-exact-active {
  background-color: #3182ce !important;
}

.logout-link {
  background-color: #f56565 !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 8px 18px !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(245, 101, 101, 0.3);
  transition: all 0.2s ease;
}

.logout-link:hover {
  background-color: #e53e3e !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(245, 101, 101, 0.4);
}

.actions-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-container {
  position: relative;
}

.search-container form {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 10px 12px 10px 38px;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 14px;
  width: 220px;
  transition: all 0.3s ease;
  outline: none;
  background-color: #f9fafb;
}

.search-input:focus {
  width: 280px;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
  background-color: white;
}

.search-button {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  color: #42b983;
}

.create-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #42b983 !important;
  color: white !important;
  width: 40px;
  height: 40px;
  border-radius: 50% !important;
  padding: 0 !important;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(66, 185, 131, 0.3);
}

.create-button:hover {
  background-color: #3ca575 !important;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(66, 185, 131, 0.4);
}

.create-button svg {
  stroke: white;
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
  padding: 25px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 15px;
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
.confirm-btn {
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

.confirm-btn {
  background-color: #f56565;
  color: white;
}

.confirm-btn:hover {
  background-color: #e53e3e;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(229, 62, 62, 0.3);
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 15px;
  }

  .actions-container {
    width: 100%;
    justify-content: center;
  }

  .search-input {
    width: 100%;
    min-width: 200px;
  }

  .search-input:focus {
    width: 100%;
  }

  .nav-links {
    width: 100%;
    overflow-x: auto;
    justify-content: center;
    padding-bottom: 8px;
    gap: 8px;
  }

  .search-container {
    width: 100%;
    max-width: 300px;
  }

  .search-container form {
    width: 100%;
  }

  .create-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    z-index: 999;
  }

  #nav a {
    font-size: 0.95rem;
    padding: 8px 12px;
  }

  .login-link,
  .register-link,
  .logout-link {
    padding: 8px 14px !important;
  }
}
@media (max-width: 640px) {
  .home-text {
    display: none;
  }

  .home-link {
    padding: 8px 12px !important;
  }
}

.create-button:hover {
  background-color: #3ca575 !important;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(66, 185, 131, 0.4);
}

#nav {
  border-radius: 0 0 20px 20px;
}

@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
  }

  .modal-content {
    padding: 20px;
  }
}
</style>
