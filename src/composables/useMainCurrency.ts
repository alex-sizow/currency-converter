import { ref, watch } from 'vue'

const mainCurrency = ref<string>('USD')

const storageKey = 'preferred-currency'
const isLocalStorageAvailable = () => {
    try {
        const testKey = '__test__'
        localStorage.setItem(testKey, testKey)
        localStorage.removeItem(testKey)
        return true
    } catch (e) {
        return false
    }
}

if (isLocalStorageAvailable()) {
    const storedCurrency = localStorage.getItem(storageKey)
    if (storedCurrency) {
        mainCurrency.value = storedCurrency
    }
}

watch(mainCurrency, (newValue) => {
    if (isLocalStorageAvailable()) {
        localStorage.setItem(storageKey, newValue)
    }
})

export function useMainCurrency() {
    const updateMainCurrency = (currency: string) => {
        mainCurrency.value = currency
    }

    return {
        mainCurrency,
        updateMainCurrency
    }
} 