<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCurrencyStore } from '@/stores/currencyStore'

const currencyStore = useCurrencyStore()
const currencies = ref(['USD', 'EUR', 'RUB'])
const mobileMenuOpen = ref(false)

onMounted(() => {
  currencyStore.initFromStorage()
})

const handleCurrencyChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  currencyStore.setMainCurrency(target.value)
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="header">
    <div class="logo">
      Currency Converter
    </div>
    
    <button class="mobile-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    
    <div class="header-content" :class="{ 'open': mobileMenuOpen }">
      <nav class="nav-links">
        <router-link to="/" class="nav-link" @click="closeMobileMenu">Home</router-link>
        <router-link to="/convert" class="nav-link" @click="closeMobileMenu">Convert</router-link>
      </nav>
      
      <div class="currency-selector">
        <label for="main-currency">Main Currency:</label>
        <select 
          id="main-currency" 
          :value="currencyStore.mainCurrency" 
          @change="handleCurrencyChange"
        >
          <option v-for="currency in currencies" :key="currency" :value="currency">
            {{ currency }}
          </option>
        </select>
      </div>
    </div>
    
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: rgba(44, 87, 153, 0.7);
  backdrop-filter: blur(8px);
  color: var(--text-light);
  box-shadow: 0 4px 20px var(--shadow-color);
  border-radius: 0 0 15px 15px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  flex-wrap: wrap;
}

.header:hover {
  background-color: rgba(74, 137, 220, 0.8);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.3s ease;
  user-select: none;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.nav-links {
  display: flex;
  gap: var(--spacing-lg);
}

.nav-link {
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-sm) 0;
  position: relative;
  transition: all 0.3s ease;
}

.nav-link:hover {
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 2px;
  background-color: var(--text-light);
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.currency-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: transform 0.3s ease;
}



.currency-selector select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border: none;
  background-color: var(--background-light);
  color: var(--text-dark);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.currency-selector select:hover {
  background-color: var(--background-gray);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.mobile-toggle span {
  width: 100%;
  height: 3px;
  background-color: var(--text-light);
  border-radius: 3px;
  transition: all 0.3s ease-in-out;
}

@media (max-width: 768px) {
  .header {
    padding: var(--spacing-md);
  }
  
  .mobile-toggle {
    display: flex;
  }
  
  .header-content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: rgba(44, 87, 153, 0.95);
    backdrop-filter: blur(10px);
    overflow: hidden;
    transition: height 0.3s ease-in-out;
    z-index: 5;
    visibility: hidden;
  }
  
  .header-content.open {
    height: 100vh;
    padding-top: 80px;
    visibility: visible;
  }
  
  .nav-links {
    flex-direction: column;
    align-items: center;
    margin-bottom: var(--spacing-xl);
  }
  
  .nav-link {
    font-size: 1.2rem;
    padding: var(--spacing-md);
  }
  
  .currency-selector {
    flex-direction: column;
    margin-top: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.2rem;
  }
  
  .header {
    padding: var(--spacing-sm);
  }
}
</style>