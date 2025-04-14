import { defineStore } from 'pinia'

interface CurrencyState {
    mainCurrency: string
}

export const useCurrencyStore = defineStore('currency', {
    state: (): CurrencyState => ({
        mainCurrency: 'USD'
    }),

    actions: {
        setMainCurrency(currency: string) {
            this.mainCurrency = currency

            try {
                localStorage.setItem('preferred-currency', currency)
            } catch (error) {
                console.error('Failed to save currency preference:', error)
            }
        },

        initFromStorage() {
            try {
                const storedCurrency = localStorage.getItem('preferred-currency')
                if (storedCurrency) {
                    this.mainCurrency = storedCurrency
                }
            } catch (error) {
                console.error('Failed to load currency preference:', error)
            }
        }
    }
}) 