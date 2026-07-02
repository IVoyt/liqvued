<script setup lang="ts">
import { surfaceOptions } from '../../../src/surfaces'

const surface = defineModel('surface')
const bezel = defineModel<number>('bezel', { default: 36 })
const thickness = defineModel<number>('thickness', { default: 60 })
const refraction = defineModel<number>('refraction', { default: 1.6 })
const magnification = defineModel<number>('magnification', { default: 0 })
const magnificationFocus = defineModel<number>('magnificationFocus', { default: 0.82 })

defineProps<{
  slider: number
  toggle: boolean
}>()

const emit = defineEmits<{
  'update:slider': [value: number]
  'update:toggle': [value: boolean]
}>()
</script>

<template>
  <div class="showcase-panel">
    <h2 class="showcase-title">
      Liquid Glass
    </h2>
    <p class="showcase-subtitle">
      Refraction & Specular Effects
    </p>

    <div class="showcase-switch-row">
      <span class="sc-label">Surface</span>
      <label class="sc-select">
        <select v-model="surface">
          <option v-for="option in surfaceOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
    </div>

    <div class="showcase-slider-row">
      <span class="sc-label">Blur <strong>{{ slider.toFixed(1) }}</strong></span>
      <input
        :value="slider"
        type="range"
        min="0"
        step="0.1"
        max="10"
        class="sc-slider"
        @input="emit('update:slider', Number(($event.target as HTMLInputElement).value))"
      >
    </div>

    <div class="showcase-slider-row">
      <span class="sc-label">Thickness <strong>{{ thickness }}</strong></span>
      <input
        v-model.number="thickness"
        type="range"
        min="4"
        step="1"
        max="120"
        class="sc-slider"
      >
    </div>

    <div class="showcase-slider-row">
      <span class="sc-label">Refraction <strong>{{ refraction.toFixed(1) }}</strong></span>
      <input
        v-model.number="refraction"
        type="range"
        min="0"
        step="0.1"
        max="3"
        class="sc-slider"
      >
    </div>

    <div class="showcase-slider-row">
      <span class="sc-label">Bezel <strong>{{ bezel }}</strong></span>
      <input
        v-model.number="bezel"
        type="range"
        min="4"
        step="1"
        max="120"
        class="sc-slider"
      >
    </div>

    <div class="showcase-slider-row">
      <span class="sc-label">Magnification <strong>{{ magnification.toFixed(1) }}</strong></span>
      <input
        v-model.number="magnification"
        type="range"
        min="-2"
        step="0.1"
        max="2"
        class="sc-slider"
      >
    </div>

    <div class="showcase-slider-row">
      <span class="sc-label">Magnification Focus <strong>{{ magnificationFocus.toFixed(2) }}</strong></span>
      <input
        v-model.number="magnificationFocus"
        type="range"
        min="0.2"
        step="0.01"
        max="1.4"
        class="sc-slider"
      >
    </div>

    <div class="showcase-switch-row">
      <span class="sc-label">Enable Effects</span>
      <label class="sc-toggle">
        <input
          :checked="toggle"
          type="checkbox"
          @change="emit('update:toggle', ($event.target as HTMLInputElement).checked)"
        >
        <span class="sc-toggle-track" />
      </label>
    </div>
  </div>
</template>

<style scoped>
.showcase-panel {
  padding: 28px 32px;
  min-width: 280px;
  max-width: 480px;
  color: #1e293b;
}

.showcase-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.showcase-subtitle {
  font-size: 13px;
  margin: 0 0 20px;
  opacity: 0.6;
  font-weight: 400;
}

.showcase-slider-row,
.showcase-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.sc-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.sc-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: rgba(30, 41, 59, 0.15);
  outline: none;
  cursor: pointer;
}

.sc-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #64748b;
  cursor: pointer;
  border: none;
}

.sc-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #64748b;
  cursor: pointer;
  border: none;
}

.sc-toggle {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.sc-toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.sc-toggle-track {
  display: block;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: rgba(30, 41, 59, 0.12);
  border: 1.5px solid rgba(30, 41, 59, 0.25);
  transition: background 0.25s, border-color 0.25s;
  position: relative;
}

.sc-toggle-track::after {
  content: '';
  position: absolute;
  top: 0.1em;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: transform 0.25s, background 0.25s;
}

.sc-toggle input:checked + .sc-toggle-track {
  border-color: rgba(30, 41, 59, 0.35);
}

.sc-toggle input:checked + .sc-toggle-track::after {
  transform: translateX(18px);
  background: #475569;
}

.sc-select select {
  -webkit-appearance: none;
  appearance: none;
  padding: 6px 28px 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  background: rgba(30, 41, 59, 0.06);
  border: 1.5px solid rgba(30, 41, 59, 0.2);
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6' fill='none' stroke='%2394a3b8' stroke-width='1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 110px;
}

.sc-select select:hover {
  border-color: rgba(30, 41, 59, 0.4);
}

.sc-select select:focus {
  border-color: #64748b;
}
</style>
