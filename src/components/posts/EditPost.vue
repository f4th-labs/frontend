<template>
  <div class="edit-post-container">
    <div class="edit-post-card">
      <h2>Edit Post</h2>

      <div v-if="loading" class="alert alert-info">
        <div class="spinner"></div>
        Loading post...
      </div>

      <form id="edit-post-form" @submit.prevent="editPost" v-if="!loading">
        <div class="form-group">
          <label for="title"
            >Title
            <span class="char-count">{{ post.title ? post.title.length : 0 }}/28</span></label
          >
          <input
            type="text"
            id="title"
            v-model="post.title"
            name="title"
            class="form-control"
            placeholder="Enter title"
            required
            maxlength="28"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label for="description"
            >Description
            <span class="char-count"
              >{{ post.description ? post.description.length : 0 }}/60</span
            ></label
          >
          <input
            type="text"
            id="description"
            v-model="post.description"
            name="description"
            class="form-control"
            placeholder="Enter description"
            required
            maxlength="60"
            :disabled="isSubmitting"
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
            :disabled="isSubmitting || categoriesLoading"
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
            >Write Content
            <span class="char-count">{{ post.content ? post.content.length : 0 }}/2000</span></label
          >
          <textarea
            id="body"
            cols="30"
            rows="10"
            v-model="post.content"
            class="form-control"
            placeholder="Enter content"
            required
            maxlength="2000"
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="image">Image</label>
          <input
            type="file"
            id="image"
            @change="onFileChange"
            class="form-control file-input"
            :disabled="isSubmitting"
          />
          <div v-if="post.imageUrl" class="current-image">
            <p>Current image:</p>
            <img :src="post.imageUrl" alt="Current post image" class="img-preview" />
          </div>
          <div class="error-message" v-if="imageError">{{ imageError }}</div>
        </div>

        <div v-if="errorMsg" class="alert alert-danger">
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="alert alert-success">
          {{ successMsg }}
        </div>

        <div class="button-group">
          <button type="button" class="cancel-btn" @click="navigate" :disabled="isSubmitting">
            Cancel
          </button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Updating...' : 'Update Post' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { server } from '@/utils/helper'
import axios from 'axios'

export default defineComponent({
  name: 'EditPost',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const id = computed(() => route.params.id as string)

    const post = ref({
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
    const isSubmitting = ref(false)
    const imageError = ref('')
    const errorMsg = ref('')
    const successMsg = ref('')
    const image = ref(null)
    const categories = ref([])
    const categoriesLoading = ref(true)
    const selectedCategory = ref('')
    const categoryError = ref(false)

    const navigate = () => {
      router.go(-1)
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${server.BASE_URL}/news-categories`, {
          withCredentials: true,
        })
        categories.value = response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        categoriesLoading.value = false
      }
    }

    const getPost = async () => {
      loading.value = true
      errorMsg.value = ''

      try {
        const response = await axios.get(`${server.BASE_URL}/news/post/${id.value}`)
        post.value = response.data

        if (post.value.category && post.value.category.id) {
          selectedCategory.value = post.value.category.id
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        errorMsg.value = 'Failed to load post data'
      } finally {
        loading.value = false
      }
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

    const editPost = async () => {
      if (imageError.value) {
        return
      }

      if (!selectedCategory.value) {
        categoryError.value = true
        return
      }

      isSubmitting.value = true
      errorMsg.value = ''
      successMsg.value = ''

      try {
        const formData = new FormData()
        formData.append('title', post.value.title)
        formData.append('description', post.value.description)
        formData.append('content', post.value.content)
        formData.append('categoryId', selectedCategory.value)

        if (image.value) {
          formData.append('image', image.value)
        }

        await axios.put(`${server.BASE_URL}/news/post/${id.value}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        })

        successMsg.value = 'Post updated successfully! Redirecting...'

        setTimeout(() => {
          const targetUrl = `/post/${id.value}`
          router.push(targetUrl).then(() => {
            window.location.reload()
          })
        }, 2000)
      } catch (error) {
        console.error('Error updating post:', error)
        errorMsg.value = 'Failed to update post. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(() => {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push('/login')
        return
      }

      getPost()
      fetchCategories()
    })

    return {
      id,
      post,
      loading,
      isSubmitting,
      imageError,
      errorMsg,
      successMsg,
      categories,
      categoriesLoading,
      selectedCategory,
      categoryError,
      navigate,
      onFileChange,
      editPost,
    }
  },
})
</script>

<style scoped>
.edit-post-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.edit-post-card {
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
  padding: 12px 8px;
  height: 48px;
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

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background-color: #e5e7eb;
  color: #4b5563;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #d1d5db;
}

.submit-btn {
  flex: 2;
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

.submit-btn:hover {
  background-color: #3ba876;
}

.submit-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.char-count {
  float: right;
  font-size: 0.85rem;
  color: #718096;
  font-weight: normal;
}

.alert {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.alert-danger {
  background-color: #fee2e2;
  color: #b91c1c;
  border-left: 4px solid #ef4444;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #42b983;
}

.alert-info {
  background-color: #e8f4f8;
  color: #2c5282;
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

.current-image {
  margin-top: 10px;
}

.img-preview {
  max-width: 100%;
  max-height: 200px;
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
