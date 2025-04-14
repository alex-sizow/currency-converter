<script setup lang="ts">
import CurrencyConverter from '@/components/CurrencyConverter.vue'
</script>

<template>
  <div class="convert-view">
    <h1>Currency Converter</h1>
    <CurrencyConverter />
  </div>
</template>

<style scoped>
.convert-view {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

h1 {
  margin-bottom: 30px;
  text-align: center;
}

@media (max-width: 768px) {
  .convert-view {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .convert-view {
    padding: 10px;
  }
  
  h1 {
    margin-bottom: 20px;
    font-size: 1.8rem;
  }
}
</style> 