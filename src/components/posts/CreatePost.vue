<template>
  <div class="create-post-container">
    <div class="create-post-card">
      <h2>Create Post</h2>

      <div v-if="isLoading" class="alert alert-info">
        <div class="spinner"></div>
        Loading categories...
      </div>

      <form id="create-post-form" @submit.prevent="createPost">
        <div class="form-group">
          <label for="title"
            >Title <span class="char-count">{{ title.length }}/28</span></label
          >
          <input
            type="text"
            id="title"
            v-model="title"
            name="title"
            class="form-control"
            placeholder="Enter title"
            required
            maxlength="28"
            :disabled="isSubmitting || isLoading"
          />
        </div>

        <div class="form-group">
          <label for="description"
            >Description <span class="char-count">{{ description.length }}/60</span></label
          >
          <input
            type="text"
            id="description"
            v-model="description"
            name="description"
            class="form-control"
            placeholder="Enter description"
            required
            maxlength="60"
            :disabled="isSubmitting || isLoading"
          />
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <select
            id="category"
            v-model="selectedCategory"
            name="category"
            class="form-control"
            :class="{ 'is-invalid': categoryError }"
            required
            :disabled="isLoading || isSubmitting"
          >
            <option value="" disabled>Select a category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <div class="error-message" v-if="categoryError">Please select a category</div>
        </div>

        <div class="form-group">
          <label for="body"
            >Write Content <span class="char-count">{{ content.length }}/2000</span></label
          >
          <textarea
            id="body"
            cols="30"
            rows="5"
            v-model="content"
            class="form-control"
            placeholder="Enter content"
            required
            maxlength="2000"
            :disabled="isSubmitting || isLoading"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="image">Image</label>
          <input
            type="file"
            id="image"
            @change="onFileChange"
            class="form-control file-input"
            :disabled="isSubmitting || isLoading"
          />
          <div class="error-message" v-if="imageError">{{ imageError }}</div>
        </div>

        <div v-if="errorMsg" class="alert alert-danger">
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="alert alert-success">
          {{ successMsg }}
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting || isLoading">
          {{ isSubmitting ? 'Creating...' : 'Create Post' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { server } from '@/utils/helper'
import router from '@/router'
import { defineComponent, ref } from 'vue'

interface Category {
  id: string
  name: string
}

export default defineComponent({
  name: 'CreatePost',
  setup() {
    const title = ref('')
    const description = ref('')
    const content = ref('')
    const image = ref(null)
    const date_posted = ref(new Date().toLocaleDateString())
    const imageError = ref('')
    const errorMsg = ref('')
    const successMsg = ref('')
    const categories = ref<Category[]>([])
    const selectedCategory = ref('')
    const isLoading = ref(false)
    const categoryError = ref(false)
    const isSubmitting = ref(false)

    const fetchCategories = () => {
      isLoading.value = true
      axios
        .get(`${server.BASE_URL}/news-categories`, {
          withCredentials: true,
        })
        .then((response) => {
          categories.value = response.data
          if (categories.value.length > 0 && !selectedCategory.value) {
            selectedCategory.value = categories.value[0].id
          }
        })
        .catch((error) => {
          console.error('Error fetching categories:', error)
          errorMsg.value = 'Failed to load categories. Please refresh the page.'
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    const onFileChange = (event) => {
      const file = event.target.files[0]
      const validImageTypes = ['image/jpeg', 'image/png']
      if (file && validImageTypes.includes(file.type)) {
        image.value = file
        imageError.value = ''
      } else {
        image.value = null
        imageError.value = 'Please select a valid image file (JPEG, PNG).'
      }
    }

    const createPost = () => {
      categoryError.value = false
      errorMsg.value = ''

      if (imageError.value) {
        return
      }

      if (!selectedCategory.value) {
        categoryError.value = true
        return
      }

      if (!title.value.trim() || !content.value.trim()) {
        errorMsg.value = 'Title and content are required'
        return
      }

      isSubmitting.value = true
      successMsg.value = ''

      const formData = new FormData()
      formData.append('title', title.value)
      formData.append('description', description.value)
      formData.append('content', content.value)
      formData.append('category', selectedCategory.value)

      if (image.value) {
        formData.append('image', image.value)
      }

      submitToServer(formData)
    }

    const submitToServer = (data) => {
      const url = `${server.BASE_URL}/news`

      axios
        .post(url, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        })
        .then(() => {
          successMsg.value = 'Post created successfully! Redirecting...'
          setTimeout(() => {
            router.push({
              name: 'home',
              query: { refresh: Date.now().toString() },
            })
          }, 2000)
        })
        .catch((error) => {
          console.error('API Error:', error)
          errorMsg.value = 'Failed to create post. Please try again.'
        })
        .finally(() => {
          isSubmitting.value = false
        })
    }

    fetchCategories()

    return {
      title,
      description,
      content,
      image,
      date_posted,
      imageError,
      errorMsg,
      successMsg,
      categories,
      selectedCategory,
      isLoading,
      categoryError,
      isSubmitting,
      onFileChange,
      createPost,
    }
  },
})
</script>

<style scoped>
.create-post-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.create-post-card {
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
  font-size: 24px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
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

.form-control.is-invalid {
  border-color: #ef4444;
}

select.form-control {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23495057' viewBox='0 0 16 16'><path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>");
  background-repeat: no-repeat;
  background-position: calc(100% - 10px) center;
  padding-right: 30px;
  height: 48px;
}

select.form-control::-ms-expand {
  display: none;
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

.file-input {
  height: 60px;
}

.file-input::-webkit-file-upload-button {
  background-color: #e2e8f0;
  color: #4a5568;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  height: 36px;
}

.file-input::-webkit-file-upload-button:hover {
  background-color: #cbd5e0;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 5px;
}

.submit-btn {
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
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #3ba876;
}

.submit-btn:disabled {
  background-color: #9de0c3;
  cursor: not-allowed;
}

.alert {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.alert-danger {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #ef4444;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #42b983;
}

.alert-info {
  background-color: #e8f4f8;
  color: #2c5282;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #4299e1;
  display: flex;
  align-items: center;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(66, 153, 225, 0.3);
  border-radius: 50%;
  border-top-color: #4299e1;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

.char-count {
  float: right;
  font-size: 0.85rem;
  color: #718096;
  font-weight: normal;
}

input:valid ~ label .char-count:has(+ input[maxlength]:where(:not([value='']):nth-last-child(5))),
textarea:valid
  ~ label
  .char-count:has(+ textarea[maxlength]:where(:not([value='']):nth-last-child(400))) {
  color: #dd6b20;
}

input:valid ~ label .char-count:has(+ input[maxlength]:where(:not([value='']):nth-last-child(0))),
textarea:valid
  ~ label
  .char-count:has(+ textarea[maxlength]:where(:not([value='']):nth-last-child(0))) {
  color: #e53e3e;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
