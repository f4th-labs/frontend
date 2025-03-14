<template>
  <div class="section-divider"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SectionDivider'
})
</script>

<style scoped>
.section-divider {
  border-top: 1px solid #ddd;
  margin: 40px 0;
  position: relative;
}

.section-divider:after {
  content: '';
  position: absolute;
  top: -3px;
  left: 0;
  width: 60px;
  border-top: 5px solid hsla(160, 100%, 37%, 1);
}
</style>
