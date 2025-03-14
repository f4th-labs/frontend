<template>
  <div class="category-nav">
    <button
      class="category-button"
      :class="{ active: selectedCategory === '' }"
      @click="$emit('filter', '')"
    >
      All
    </button>
    <button
      v-for="category in categories"
      :key="category.id"
      class="category-button"
      :class="{ active: selectedCategory === category.id }"
      @click="$emit('filter', category.id)"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Category } from '../../types/news'

export default defineComponent({
  name: 'CategoryNav',
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    selectedCategory: {
      type: String,
      default: '',
    },
  },
  emits: ['filter'],
})
</script>
<style scoped>
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px 0;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.category-button {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.category-button:hover {
  background-color: #f0f0f0;
}

.category-button.active {
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  border-color: hsla(160, 100%, 37%, 1);
}

@media (max-width: 576px) {
  .category-nav {
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .category-button {
    padding: 5px 12px;
    font-size: 0.8rem;
  }
}
</style>
