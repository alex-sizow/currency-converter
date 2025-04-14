<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { useMainCurrency } from '@/composables/useMainCurrency'
import { useFetch } from '@/composables/useFetch'

const { mainCurrency } = useMainCurrency()

const currencies = ref(['USD', 'EUR', 'RUB'])
const fromCurrency = ref(mainCurrency.value || 'USD')
const toCurrency = ref(fromCurrency.value === 'EUR' ? 'USD' : 'EUR')

const fromValue = ref('100')
const toValue = ref('')
const fromValueError = ref('')
const toValueError = ref('')
const apiError = ref('')

let isConverting = false
let isSwapping = false

const {
  data: exchangeRatesData,
  error: exchangeRateError,
  loading: isLoading,
  execute: fetchExchangeRates
} = useFetch<Record<string, number>>(import.meta.env.VITE_CURRENCY_API_URL)

const exchangeRates = computed(() => exchangeRatesData.value || {})


watch(exchangeRateError, newError => 
  apiError.value = newError ? 'Failed to load exchange rates. Please try again later.' : '')
watch(exchangeRatesData, newData => newData && convertCurrency('from'))

const getExchangeRate = (from: string, to: string): number => {
  if (from === to) return 1
  
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`
  const rate = exchangeRates.value[key]
  if (rate) return rate
  
  const inverseKey = `${to.toLowerCase()}-${from.toLowerCase()}`
  const inverseRate = exchangeRates.value[inverseKey]
  return inverseRate ? 1 / inverseRate : 1
}

const convertCurrency = (direction: 'from' | 'to') => {
  if (isConverting || isSwapping) return
  isConverting = true
  
  try {
    const isFromDirection = direction === 'from'
    const sourceValue = isFromDirection ? fromValue : toValue
    const sourceCurrency = isFromDirection ? fromCurrency : toCurrency
    const targetCurrency = isFromDirection ? toCurrency : fromCurrency
    const errorRef = isFromDirection ? fromValueError : toValueError
    const targetValueRef = isFromDirection ? toValue : fromValue
    
    errorRef.value = ''

    if (!sourceValue.value?.trim()) {
      targetValueRef.value = ''
      return
    }
    
    const value = parseFloat(sourceValue.value)
    targetValueRef.value = (value * getExchangeRate(sourceCurrency.value, targetCurrency.value)).toFixed(2)
  } finally {
    nextTick(() => isConverting = false)
  }
}

const handleInput = (event: Event, isFromInput: boolean) => {
  const value = (event.target as HTMLInputElement).value
  if (isFromInput) {
    fromValue.value = value
    convertCurrency('from')
  } else {
    toValue.value = value
    convertCurrency('to')
  }
}

watch([fromCurrency, toCurrency], () => {
  if (!isSwapping) convertCurrency('from')
})

const swapCurrencies = () => {
  isSwapping = true
  try {
    const tempCurrency = fromCurrency.value
    fromCurrency.value = toCurrency.value
    toCurrency.value = tempCurrency
    
    const tempValue = fromValue.value
    fromValue.value = toValue.value
    toValue.value = tempValue
  } finally {
    nextTick(() => isSwapping = false)
  }
}
</script>

<template>
  <form class="converter" @submit.prevent>
    <div v-if="apiError" class="converter__error converter__error--global">
      {{ apiError }}
      <button type="button" @click="fetchExchangeRates" class="converter__button converter__button--retry">Retry</button>
    </div>
    
    <div v-if="isLoading" class="converter__loading">
      <div class="converter__loading-spinner"></div>
      <span>Loading exchange rates...</span>
    </div>
    
    <div v-else class="converter__content">
      <div class="converter__row">
        <select class="converter__select" v-model="fromCurrency">
          <option v-for="currency in currencies" :key="currency" :value="currency">{{ currency }}</option>
        </select>
        
        <div class="converter__input-group">
          <input
            type="number"
            class="converter__input"
            :value="fromValue"
            @input="(e: Event) => handleInput(e, true)"
            placeholder="0.00"
            :class="{ 'converter__input--error': fromValueError }"
            step="any"
            min="0"
          />
          <div v-if="fromValueError" class="converter__error-text">{{ fromValueError }}</div>
        </div>
      </div>
      
      <button type="button" class="converter__button converter__button--swap" @click="swapCurrencies">
        <span class="converter__swap-icon">↑↓</span>
      </button>
      
      <div class="converter__row">
        <select class="converter__select" v-model="toCurrency">
          <option v-for="currency in currencies" :key="currency" :value="currency">{{ currency }}</option>
        </select>
        
        <div class="converter__input-group">
          <input
            type="number"
            class="converter__input"
            :value="toValue"
            @input="(e: Event) => handleInput(e, false)"
            placeholder="0.00"
            :class="{ 'converter__input--error': toValueError }"
            step="any"
            min="0"
          />
          <div v-if="toValueError" class="converter__error-text">{{ toValueError }}</div>
        </div>
      </div>
      
      <div class="converter__rate-info" v-if="fromValue && toValue && !fromValueError && !toValueError">
        <p>{{ 1 }} {{ fromCurrency }} = {{ getExchangeRate(fromCurrency, toCurrency).toFixed(4) }} {{ toCurrency }}</p>
        <p class="converter__source">Data from exchange rate API</p>
      </div>
    </div>
  </form>
</template>

<style scoped>
.converter {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px var(--shadow-color);
  padding: var(--spacing-xl);
  transition: all 0.3s ease;
  width: 100%;
}


.converter__row {
  display: flex;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
  animation: fadeIn 0.5s ease-out;
}

.converter__select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid rgba(221, 221, 221, 0.5);
  border-radius: var(--border-radius-md);
  font-size: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  width: 100px;
  transition: all 0.2s ease;
}

.converter__select:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(74, 137, 220, 0.5);
}

.converter__input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.converter__input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  text-align: right;
  width: 100%;
  transition: all 0.2s ease;
}

.converter__input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 137, 220, 0.2);
  outline: none;
}

.converter__input--error {
  border-color: var(--error-color);
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

.converter__error-text {
  color: var(--error-color);
  font-size: 12px;
  margin-top: var(--spacing-xs);
  animation: fadeIn 0.3s ease;
}

.converter__error--global {
  padding: var(--spacing-md);
  background: var(--error-bg-color);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid var(--error-border-color);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.5s ease;
}

.converter__button--retry {
  background-color: var(--error-color);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.converter__button--retry:hover {
  background-color: var(--error-color);
  transform: scale(1.05);
}

.converter__loading {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.converter__loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(74, 137, 220, 0.3);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.converter__button--swap {
  width: 50px;
  height: 50px;
  margin: 0 auto var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: var(--text-light);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px var(--shadow-color);
}

.converter__button--swap:hover {
  background: var(--primary-color-dark);
  transform: rotate(180deg);
  box-shadow: 0 6px 12px var(--shadow-color);
}

.converter__swap-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.converter__rate-info {
  margin-top: var(--spacing-lg);
  text-align: center;
  color: var(--text-dark);
  font-size: 14px;
  animation: fadeIn 0.5s ease;
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.converter__source {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
}

.converter__content {
  width: 100%;
}

@media (max-width: 768px) {
  .converter {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .converter {
    padding: var(--spacing-md);
    box-shadow: 0 4px 16px var(--shadow-color);
  }
  
  .converter__row {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .converter__select {
    width: 100%;
    margin-bottom: var(--spacing-xs);
  }
  
  .converter__button--swap {
    margin: var(--spacing-sm) auto;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .converter__error--global {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .converter__button--retry {
    width: 100%;
    padding: var(--spacing-sm);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-3px); }
  40%, 60% { transform: translateX(3px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>