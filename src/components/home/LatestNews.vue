<template>
  <div class="latest-news-section">
    <h2 class="section-title">Latest News</h2>
    <div class="news-grid">
      <div v-for="(post, index) in posts" :key="`latest-${post.id || index}`" class="news-item">
        <div class="news-item-link" @click="$emit('view-post', post.id)">
          <div class="news-image-container">
            <img
              :src="post.imageUrl || placeholderImage"
              :alt="post.title"
              class="news-item-image"
            />
          </div>
          <div class="news-item-content">
            <div class="news-item-header">
              <div class="category-pill" v-if="post.category">{{ post.category.name }}</div>
              <h3>{{ post.title }}</h3>
            </div>
            <p class="news-description">{{ truncateText(post.description, 80) }}</p>
            <p class="news-content-preview">{{ truncateText(post.content, 120) }}</p>
            <div class="story-meta">
              <span class="author" v-if="post.author">{{ post.author.fullName }}</span>
              <span class="author" v-else>Unknown</span>
              <span class="date">{{ formatTimeAgo(post.createdDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="no-latest-news" v-if="posts.length === 0">
        <p>No additional news articles available.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Post } from '../../types/news'
import placeholderImage from '@/assets/placeholder-image.png'

export default defineComponent({
  name: 'LatestNews',
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
  setup() {
    return {
      placeholderImage,
    }
  },
  emits: ['view-post'],
})
</script>

<style scoped>
.latest-news-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.7rem;
  color: #222;
  margin-bottom: 1.5rem;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.news-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.news-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(66, 185, 131, 0.15);
  border-bottom: 3px solid hsla(160, 100%, 37%, 1);
}

.news-item-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  height: 100%;
}

.news-image-container {
  height: 200px;
  overflow: hidden;
}

.news-item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.news-item:hover .news-item-image {
  transform: scale(1.05);
}

.news-item-content {
  padding: 20px;
}

.news-item-header {
  margin-bottom: 15px;
  position: relative;
}

.category-pill {
  display: inline-block;
  background: #f0f0f0;
  color: #444;
  padding: 5px 12px;
  font-size: 0.75rem;
  border-radius: 20px;
  margin-bottom: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.news-item:hover .category-pill {
  background: hsla(160, 100%, 37%, 1);
  color: white;
}

.news-item h3 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.news-item:hover h3 {
  color: hsla(160, 100%, 37%, 1);
}

.news-description {
  color: #444;
  font-weight: 500;
  margin-bottom: 10px;
}

.news-content-preview {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.4;
}

.story-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #777;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.admin-controls {
  margin: 0 20px 20px;
  display: flex;
  gap: 10px;
}

.no-latest-news {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

@media (max-width: 576px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
