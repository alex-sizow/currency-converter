<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useFetch } from '@/composables/useFetch'

const currencyStore = useCurrencyStore()
const rates = ref<Record<string, number>>({})
const loading = ref(true)
const error = ref('')

const allowedCurrencies = ['USD', 'RUB', 'EUR']

const {
  data: exchangeRatesData,
  error: exchangeRateError,
  loading: isLoading,
  execute: fetchExchangeRates
} = useFetch<Record<string, number>>(import.meta.env.VITE_CURRENCY_API_URL)

watch(exchangeRatesData, (newData) => {
  if (!newData || !currencyStore.mainCurrency) return
  
  const filteredRates: Record<string, number> = {}
  const mainCurrency = currencyStore.mainCurrency.toLowerCase()
  
  allowedCurrencies.forEach(currency => {
    if (currency.toUpperCase() !== currencyStore.mainCurrency) {
      const currencyLower = currency.toLowerCase()
      const key = `${mainCurrency}-${currencyLower}`
      const inverseKey = `${currencyLower}-${mainCurrency}`
      
      if (newData[key]) {
        filteredRates[currency] = newData[key]
      } else if (newData[inverseKey]) {
        filteredRates[currency] = 1 / newData[inverseKey]
      }
    }
  })
  
  rates.value = filteredRates
  loading.value = false
})

watch(exchangeRateError, (newError) => {
  if (newError) {
    error.value = 'Failed to fetch currency rates'
    loading.value = false
  }
})

watch(isLoading, (newLoading) => {
  loading.value = newLoading
})

const fetchRates = () => {
  if (!currencyStore.mainCurrency) return
  
  loading.value = true
  error.value = ''
  fetchExchangeRates()
}

onMounted(fetchRates)
watch(() => currencyStore.mainCurrency, fetchRates)

const displayRates = computed(() => {
  return Object.entries(rates.value).map(([currency, rate]) => ({
    currency,
    rate: rate.toFixed(2),
    displayText: `1 ${currencyStore.mainCurrency} = ${rate.toFixed(2)} ${currency}`
  }))
})
</script>

<template>
  <div class="home">
    <h1 class="home__title">Currency Rates</h1>
    <p class="home__subtitle">All rates relative to {{ currencyStore.mainCurrency }}</p>
    
    <div v-if="loading" class="home__loading">
      <div class="home__loading-spinner"></div>
      <span>Loading rates...</span>
    </div>
    <div v-else-if="error" class="home__error">{{ error }}</div>
    <div v-else class="home__rates">
      <div v-for="item in displayRates" :key="item.currency" class="home__rate-card">
        <span class="home__currency-code">{{ item.currency }}</span>
        <span class="home__rate-value">{{ item.displayText }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  width: 100%;
}

.home__title {
  margin-bottom: var(--spacing-xs);
  text-align: center;
}

.home__subtitle {
  color: var(--text-muted);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.home__rates {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  animation: fadeIn 0.5s ease-out;
}

.home__rate-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px var(--shadow-color);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.home__rate-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.home__currency-code {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
}

.home__rate-value {
  font-size: 16px;
}

.home__loading {
  text-align: center;
  padding: var(--spacing-xl);
  font-size: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.home__loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(74, 137, 220, 0.3);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.home__error {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--error-bg-color);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid var(--error-border-color);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-xl) auto;
  max-width: 600px;
  color: var(--error-color);
}

@media (max-width: 768px) {
  .home {
    padding: var(--spacing-lg);
  }
  
  .home__rates {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }
  
  .home__rate-card {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .home {
    padding: var(--spacing-md);
  }
  
  .home__title {
    font-size: 1.8rem;
  }
  
  .home__subtitle {
    margin-bottom: var(--spacing-lg);
  }
  
  .home__rates {
    grid-template-columns: 1fr;
  }
  
  .home__currency-code {
    font-size: 20px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 