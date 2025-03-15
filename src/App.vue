<template>
  <div id="app">
    <nav-bar />

    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from '@/components/layout/Navbar.vue'

export default defineComponent({
  name: 'App',
  components: {
    NavBar,
  },
  mounted() {
    if (this.$route.path === '/') {
      setTimeout(() => {
        const event = new Event('resize')
        window.dispatchEvent(event)
      }, 300)
    }
  },
})
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #fff;
  max-width: 100%;
  overflow-x: hidden;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #f9f9f9;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 25px;
  font-family: 'ReithSerif', Georgia, serif;
  position: relative;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 40px;
  border-bottom: 4px solid hsla(160, 100%, 37%, 1);
}
</style>
