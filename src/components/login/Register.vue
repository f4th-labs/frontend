<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Register</h2>

      <form @submit.prevent="validateAndRegister">
        <div class="form-group">
          <label for="firstName"
            >First Name <span class="char-count">{{ formData.firstName.length }}/15</span></label
          >
          <input
            type="text"
            id="firstName"
            v-model="formData.firstName"
            class="form-control"
            placeholder="Enter first name"
            required
            maxlength="15"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="lastName"
            >Last Name <span class="char-count">{{ formData.lastName.length }}/15</span></label
          >
          <input
            type="text"
            id="lastName"
            v-model="formData.lastName"
            class="form-control"
            placeholder="Enter last name"
            required
            maxlength="15"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="email"
            >Email <span class="char-count">{{ formData.email.length }}/40</span></label
          >
          <input
            type="email"
            id="email"
            v-model="formData.email"
            class="form-control"
            placeholder="Enter email"
            required
            maxlength="40"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password"
            >Password <span class="char-count">{{ formData.password.length }}/64</span></label
          >
          <input
            type="password"
            id="password"
            v-model="formData.password"
            class="form-control"
            placeholder="Enter password"
            required
            minlength="8"
            maxlength="64"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword"
            >Confirm Password <span class="char-count">{{ confirmPassword.length }}/64</span></label
          >
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            class="form-control"
            placeholder="Confirm password"
            required
            minlength="8"
            maxlength="64"
            :disabled="isLoading"
          />
        </div>

        <div v-if="validationErrors.length > 0" class="alert alert-danger">
          <ul class="mb-0">
            <li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li>
          </ul>
        </div>

        <div v-if="errorMsg" class="alert alert-danger">
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="alert alert-success">
          {{ successMsg }}
        </div>

        <button type="submit" class="register-btn" :disabled="isLoading">
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>

        <div class="login-link">
          Already have an account? <router-link to="/login">Log in here</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { server } from '../../utils/helper'
import router from '../../router'

interface RegisterUserDto {
  email: string
  password: string
  firstName: string
  lastName: string
}

export default defineComponent({
  name: 'Register',
  props: {
    redirect: {
      type: String,
      default: '/',
    },
  },
  setup(props) {
    const route = useRoute()
    const redirectPath = ref(props.redirect || route.query.redirect || '/')

    const formData = reactive<RegisterUserDto>({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    })

    const confirmPassword = ref('')
    const errorMsg = ref('')
    const successMsg = ref('')
    const isLoading = ref(false)
    const validationErrors = ref<string[]>([])

    const validateForm = (): boolean => {
      validationErrors.value = []

      if (!formData.firstName) validationErrors.value.push('First name is required')
      if (!formData.lastName) validationErrors.value.push('Last name is required')
      if (!formData.email) validationErrors.value.push('Email is required')
      if (!formData.password) validationErrors.value.push('Password is required')
      if (!confirmPassword.value) validationErrors.value.push('Please confirm your password')

      if (formData.firstName.length > 15)
        validationErrors.value.push('First name must be 15 characters or less')
      if (formData.lastName.length > 15)
        validationErrors.value.push('Last name must be 15 characters or less')
      if (formData.email.length > 40)
        validationErrors.value.push('Email must be 40 characters or less')

      if (formData.password.length < 8)
        validationErrors.value.push('Password must be at least 8 characters')
      if (formData.password.length > 64)
        validationErrors.value.push('Password must be less than 64 characters')
      if (formData.password !== confirmPassword.value)
        validationErrors.value.push('Passwords do not match')

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (formData.email && !emailPattern.test(formData.email)) {
        validationErrors.value.push('Email format is invalid')
      }

      return validationErrors.value.length === 0
    }

    const validateAndRegister = async () => {
      if (!validateForm()) return
      await registerUser()
    }

    const registerUser = async () => {
      try {
        errorMsg.value = ''
        successMsg.value = ''
        isLoading.value = true

        const response = await axios.post(`${server.BASE_URL}/users/register`, formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        successMsg.value = 'Registration successful! Redirecting to login...'

        setTimeout(() => {
          router.push({
            name: 'Login',
            query: {
              redirect: redirectPath.value,
              message: 'Registration successful! Please log in.',
            },
          })
        }, 2000)
      } catch (error: any) {
        console.error('Error registering user:', error)
        if (error.response && error.response.data && error.response.data.message) {
          errorMsg.value = error.response.data.message
        } else {
          errorMsg.value = 'Failed to register. Please try again later.'
        }
      } finally {
        isLoading.value = false
      }
    }

    return {
      formData,
      confirmPassword,
      errorMsg,
      successMsg,
      isLoading,
      validationErrors,
      validateAndRegister,
      registerUser,
    }
  },
})
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.register-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
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

.register-btn {
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

.register-btn:hover {
  background-color: #3ba876;
}

.register-btn:disabled {
  background-color: #9de0c3;
  cursor: not-allowed;
}

.alert {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.alert-danger {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #ef4444;
}

.alert-danger ul {
  margin: 0;
  padding-left: 20px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #42b983;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #718096;
}

.login-link a {
  color: #42b983;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
  border-radius: 4px;
}

.char-count {
  float: right;
  font-size: 0.85rem;
  color: #718096;
  font-weight: normal;
}

.form-group:has(input[value^='12']) label .char-count,
.form-group:has(input[value^='13']) label .char-count,
.form-group:has(input[value^='14']) label .char-count {
  color: #dd6b20;
}

.form-group:has(input[value^='15']) label .char-count,
.form-group:has(input[value^='40']) label .char-count,
.form-group:has(input[value^='64']) label .char-count {
  color: #e53e3e;
}
</style>
