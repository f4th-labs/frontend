<template>
  <div class="empty-state">
    <h2>No news articles found</h2>
    <p v-if="selectedCategory">
      No articles in this category. Try another category or view all articles.
    </p>
    <p v-else-if="isAdminOrAuthor">Check back later for updates or create your first article</p>
    <p v-else>Check back later for updates</p>
    <div class="empty-actions">
      <button @click="$emit('filter', null)" v-if="selectedCategory" class="view-all-btn">
        View All Articles
      </button>
      <router-link v-if="isAdminOrAuthor" to="/create" class="create-post-btn">
        Create Article
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue'

export default defineComponent({
  name: 'EmptyState',
  props: {
    selectedCategory: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  setup() {
    const isAdminOrAuthor = computed(() => {
      const userStr = localStorage.getItem('user')
      if (!userStr) return false

      try {
        const user = JSON.parse(userStr)
        return user.role === 'admin' || user.role === 'author'
      } catch (e) {
        console.error('Error parsing user data:', e)
        return false
      }
    })

    return {
      isAdminOrAuthor,
    }
  },
  emits: ['filter'],
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 80px 0;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 30px;
}

.empty-state h2 {
  margin-bottom: 15px;
  font-size: 2rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 25px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.create-post-btn,
.view-all-btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
}

.create-post-btn {
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
}

.create-post-btn:hover {
  background-color: hsla(160, 100%, 30%, 1);
}

.view-all-btn {
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
}

.view-all-btn:hover {
  background-color: #f5f5f5;
}
</style>
