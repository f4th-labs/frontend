<template>
  <footer class="simple-footer">
    <div class="footer-content">
      <p>&copy; {{ currentYear }} News Portal</p>
      <button @click="scrollToTop" class="back-to-top" aria-label="Back to top">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'AppFooter',
  setup() {
    const currentYear = computed(() => new Date().getFullYear())

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    return {
      currentYear,
      scrollToTop,
    }
  },
})
</script>

<style scoped>
.simple-footer {
  margin-top: 60px;
  padding: 20px 0;
  border-top: 1px solid #eaeaea;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content p {
  color: #666;
  margin: 0;
}

.back-to-top {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(66, 185, 131, 0.3);
}

.back-to-top:hover {
  background-color: #3ca575;
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.4);
}

@media (max-width: 480px) {
  .simple-footer {
    margin-top: 40px;
  }
}
</style>
