<template>
  <div class="featured-section">
    <h2 class="section-title">Featured Articles</h2>
    <div class="featured-grid">
      <div
        v-for="(post, index) in posts"
        :key="`featured-${post.id || index}`"
        class="featured-article"
      >
        <div class="featured-link" @click="$emit('view-post', post.id)">
          <div class="featured-image-container">
            <img
              :src="post.imageUrl || placeholderImage"
              :alt="post.title"
              class="featured-image"
            />
            <div class="category-label" v-if="post.category">{{ post.category.name }}</div>
          </div>
          <div class="featured-content">
            <h3>{{ post.title }}</h3>
            <p>{{ truncateText(post.description, 100) }}</p>
            <div class="article-footer">
              <span class="author">{{ getAuthorName(post.author) }}</span>
              <span class="date">{{ formatTimeAgo(post.createdDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <template v-if="posts.length < 3">
        <div v-for="i in 3 - posts.length" :key="`empty-${i}`" class="featured-article empty">
          <div class="featured-content empty-content">
            <div class="empty-placeholder"></div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Post } from '../../types/news'
import placeholderImage from '@/assets/placeholder-image.png'
import { getAuthorName } from '@/utils/getFullName'

export default defineComponent({
  name: 'FeaturedArticles',
  props: {
    posts: {
      type: Array as PropType<Post[]>,
      required: true,
    },
    formatTimeAgo: {
      type: Function as PropType<(date: string) => string>,
      required: true,
    },
    truncateText: {
      type: Function as PropType<(text: string | null, length: number) => string>,
      required: true,
    },
  },
  emits: ['view-post'],
  setup() {
    return { placeholderImage, getAuthorName }
  },
})
</script>

<style scoped>
.featured-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.7rem;
  color: #222;
  margin-bottom: 1.5rem;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.featured-article {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background-color: white;
  position: relative;
  z-index: 1;
}

.featured-article:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(66, 185, 131, 0.15);
  border-bottom: 3px solid hsla(160, 100%, 37%, 1);
}

.featured-link {
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
  height: 100%;
}

.featured-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.featured-article:hover .featured-image {
  transform: scale(1.05);
}

.category-label {
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
  z-index: 2;
}

.featured-article:hover .category-label {
  background: #35a471;
}

.featured-content {
  padding: 20px;
  background-color: white;
  position: relative;
}

.featured-content h3 {
  margin: 0 0 12px;
  font-size: 1.3rem;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.featured-article:hover h3 {
  color: hsla(160, 100%, 37%, 1);
}

.featured-content p {
  color: #555;
  margin-bottom: 15px;
  line-height: 1.5;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #777;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.author {
  font-weight: 500;
}

.featured-article.empty {
  background-color: #f5f5f5;
  opacity: 0.7;
}

.empty-content {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-placeholder {
  width: 80%;
  height: 70%;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1024px) {
  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .featured-grid {
    grid-template-columns: 1fr;
  }
}
</style>
