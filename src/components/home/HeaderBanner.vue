<template>
  <div class="header-banner">
    <h1 class="site-title">News Portal</h1>
    <div class="date-time">{{ currentDate }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HeaderBanner',
  props: {
    currentDate: {
      type: String,
      required: true,
    },
  },
})
</script>

<style scoped>
.header-banner {
  padding: 20px 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  font-size: 2rem;
  color: hsla(160, 100%, 37%, 1);
  margin: 0;
  font-weight: 700;
}

.date-time {
  font-size: 0.9rem;
  color: #5a5a5a;
}
</style>
