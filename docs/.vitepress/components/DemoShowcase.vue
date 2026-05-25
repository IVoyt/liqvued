<script setup lang="ts">
import { computed, ref } from 'vue'
import BubbleBackground from './BubbleBackground.vue'
import ShowcasePanel from './ShowcasePanel.vue'

const sliderVal = ref(0.8)
const surface = ref('convex')
const toggleVal = ref(true)

const supported = CSS.supports('backdrop-filter', 'url(#x)') && navigator.userAgent.includes('Chrome')
const unsupported = computed(() => !supported)
</script>

<template>
  <div class="showcase">
    <BubbleBackground />
    <div class="showcase-overlay" />

    <div v-if="unsupported" class="showcase-notice">
      ⚡ Your browser doesn't support the Liquid Glass SVG effect.<br>
      A glassmorphism blur fallback is applied instead.
    </div>

    <div class="showcase-content">
      <Liqvued
        v-if="toggleVal"
        :bezel="45"
        :thickness="60"
        :refraction="3"
        :glare-angle="285"
        :specular-opacity="0.2"
        glass-background="#00f0f055"
        :blur="sliderVal"
        :surface="surface"
      >
        <ShowcasePanel v-model:slider="sliderVal" v-model:toggle="toggleVal" v-model:surface="surface" />
      </Liqvued>
      <div v-else class="showcase-fallback">
        <ShowcasePanel v-model:slider="sliderVal" v-model:toggle="toggleVal" v-model:surface="surface" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin: 16px 0;
  min-height: 420px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%);
}

.showcase-notice {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 10px 16px;
  background: #fef3c7;
  color: #92400e;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
}

.showcase-notice br {
  display: none;
}

@media (max-width: 600px) {
  .showcase-notice br {
    display: inline;
  }
}

.showcase-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.05);
}

.showcase-content {
  position: relative;
  z-index: 1;
  padding: 40px 24px;
  display: flex;
  justify-content: center;
}

.showcase-fallback {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
}
</style>
