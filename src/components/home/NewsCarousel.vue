<template>
  <div class="carousel-container">
    <div class="carousel-track-container">
      <div class="carousel-track" :style="{ transform: `translateX(${-currentSlide * 100}%)` }">
        <div
          v-for="(post, index) in posts"
          :key="`slide-${post.id || index}`"
          class="carousel-slide"
        >
          <!-- Replace navigateToPost with emit -->
          <div class="slide-link" @click="$emit('view-post', post.id)">
            <div class="image-container">
              <img
                :src="post.imageUrl || placeholderImage"
                :alt="post.title"
                class="slide-image"
                loading="lazy"
              />
            </div>
            <div class="slide-info">
              <div class="category-tag" v-if="post.category">{{ post.category.name }}</div>
              <div class="category-tag" v-else>General</div>
              <h2 class="slide-title">{{ post.title }}</h2>
              <p class="slide-description">{{ post.description }}</p>
              <div class="story-meta">
                <span class="author" v-if="post.author">{{ post.author.fullName }}</span>
                <span class="author" v-else>Unknown author</span>
                <span class="date">{{ formatTimeAgo(post.createdDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="side-controls" v-if="posts.length > 1">
      <button
        class="side-control prev"
        @click.prevent="handlePrevSlide"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        class="side-control next"
        @click.prevent="handleNextSlide"
        aria-label="Next slide"
      >
        ❯
      </button>
    </div>

    <div class="carousel-indicators" v-if="posts.length > 1">
      <button
        v-for="(_, index) in posts"
        :key="`indicator-${index}`"
        class="indicator"
        :class="{ active: currentSlide === index }"
        @click.prevent="$emit('go-to-slide', index)"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Post } from '../../types/news'
import { formatDistanceToNow } from 'date-fns'
import placeholderImage from '@/assets/placeholder-image.png'

export default defineComponent({
  name: 'NewsCarousel',
  props: {
    posts: {
      type: Array as PropType<Post[]>,
      required: true,
    },
    currentSlide: {
      type: Number,
      required: true,
    },
  },
  emits: ['next-slide', 'prev-slide', 'go-to-slide', 'view-post'],
  setup() {
    return {
      placeholderImage,
    }
  },
  methods: {
    formatTimeAgo(dateString: string) {
      if (!dateString) return ''

      try {
        const date = new Date(dateString)
        return formatDistanceToNow(date, { addSuffix: true })
      } catch {
        return dateString
      }
    },
    handleNextSlide() {
      if (this.currentSlide === this.posts.length - 1) {
        this.$emit('go-to-slide', 0)
      } else {
        this.$emit('next-slide')
      }
    },
    handlePrevSlide() {
      if (this.currentSlide === 0) {
        this.$emit('go-to-slide', this.posts.length - 1)
      } else {
        this.$emit('prev-slide')
      }
    },
  },
})
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  background-color: #000;
}

.carousel-track-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.8s ease;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.carousel-slide::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0.7) 80%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 1;
  opacity: 0.7;
  transition: opacity 0.4s ease;
}

.carousel-slide:hover::after {
  opacity: 0.9;
}

.slide-link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  text-decoration: none;
  color: white;
  cursor: pointer;
}

.image-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 1s ease;
}

.carousel-slide:hover .slide-image {
  transform: scale(1.05);
}

.slide-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 30px;
  z-index: 2;
  transition:
    transform 0.3s ease,
    padding 0.3s ease;
}

.carousel-slide:hover .slide-info {
  padding-bottom: 50px;
}

.category-tag {
  display: inline-block;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 20px;
  margin-bottom: 10px;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

.carousel-slide:hover .category-tag {
  background: #35a471;
  transform: translateY(-3px);
}

.slide-title {
  font-size: 2.2rem;
  margin-bottom: 10px;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.carousel-slide:hover .slide-title {
  transform: translateY(-3px);
}

.slide-description {
  font-size: 1.1rem;
  margin-bottom: 20px;
  line-height: 1.5;
  opacity: 0.9;
  max-width: 700px;
}

.story-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  opacity: 0.8;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 10px;
  margin-top: 5px;
}

.side-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.side-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  outline: none;
  pointer-events: all;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.side-control:hover {
  background-color: hsla(160, 100%, 37%, 0.8);
  opacity: 1;
}

.side-control:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.prev {
  left: 20px;
}

.next {
  right: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 25px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 10;
  padding: 0 20px;
  box-sizing: border-box;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  margin: 0 2px;
  flex-shrink: 0;
}

.indicator.active {
  background-color: hsla(160, 100%, 37%, 1);
  transform: scale(1.2);
}

.indicator:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .carousel-container {
    height: 400px;
  }

  .slide-title {
    font-size: 1.8rem;
  }

  .slide-description {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .carousel-indicators {
    bottom: 15px;
  }

  .indicator {
    width: 8px;
    height: 8px;
    margin: 0 1px;
  }

  .slide-info {
    padding: 20px 20px 40px;
  }

  .side-control {
    width: 40px;
    height: 40px;
  }

  .slide-title {
    font-size: 1.5rem;
  }

  .slide-description {
    display: none;
  }
}
</style>
