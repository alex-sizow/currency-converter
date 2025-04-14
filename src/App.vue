<script setup lang="ts">
import AppHeader from './components/Header.vue'
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>



* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  scroll-behavior: smooth;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f9f9f9;
  color: var(--text-dark);
  line-height: 1.6;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 1rem;
}

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: white;
}

button {
  cursor: pointer;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem 0.5rem;
  }
}
</style>
