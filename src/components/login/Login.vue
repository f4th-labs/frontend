<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Login</h2>

      <div v-if="message" class="login-message alert alert-info">
        {{ message }}
      </div>

      <form @submit.prevent="loginUser">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-control"
            placeholder="Enter email"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-control"
            placeholder="Enter password"
            required
            :disabled="isLoading"
          />
        </div>

        <div v-if="errorMsg" class="alert alert-danger">
          {{ errorMsg }}
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>

        <div class="register-link">
          Don't have an account? <router-link to="/register">Register here</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { server } from '@/utils/helper'
import router from '@/router'

export default defineComponent({
  name: 'Login',
  props: {
    redirect: {
      type: String,
      default: '/',
    },
    message: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const route = useRoute()
    const email = ref('')
    const password = ref('')
    const errorMsg = ref('')
    const isLoading = ref(false)
    const redirectPath = ref(props.redirect || route.query.redirect || '/')

    const loginUser = async () => {
      try {
        errorMsg.value = ''
        isLoading.value = true

        const response = await axios.post(
          `${server.BASE_URL}/auth/login`,
          {
            email: email.value,
            password: password.value,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (response.data && response.data.user) {
          const userData = response.data.user
          localStorage.setItem('user', JSON.stringify(userData))

          const targetPath = typeof redirectPath.value === 'string' ? redirectPath.value : '/'
          router.push(targetPath).then(() => {
            setTimeout(() => {
              window.location.reload()
            }, 100)
          })
        }
      } catch (error: any) {
        console.error('Login error:', error)

        if (error.response) {
          if (error.response.status === 401) {
            errorMsg.value = 'Invalid email or password'
          } else if (error.response.data && error.response.data.message) {
            errorMsg.value = error.response.data.message
          } else {
            errorMsg.value = 'An error occurred during login'
          }
        } else if (error.request) {
          errorMsg.value = 'Server is not responding. Please try again later.'
        } else {
          errorMsg.value = 'An error occurred. Please try again.'
        }
      } finally {
        isLoading.value = false
      }
    }

    return {
      email,
      password,
      errorMsg,
      isLoading,
      loginUser,
    }
  },
})
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.login-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
}

.login-message {
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 4px;
  background-color: #e8f4f8;
  color: #2c5282;
  border-left: 4px solid #4299e1;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background-color: #3ba876;
}

.login-btn:disabled {
  background-color: #9de0c3;
  cursor: not-allowed;
}

.alert-danger {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #ef4444;
}

.register-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #718096;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
  border-radius: 4px;
}
</style>
