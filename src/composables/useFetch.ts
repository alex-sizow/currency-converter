import { ref, unref, watchEffect, nextTick } from 'vue'
import type { Ref } from 'vue'

export interface UseFetchOptions {
    immediate?: boolean
    headers?: HeadersInit
    timeout?: number
}

export function useFetch<T>(
    url: string | Ref<string>,
    options: UseFetchOptions = {}
) {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    const loading = ref(false)

    const execute = async () => {
        loading.value = true
        await nextTick()

        data.value = null
        error.value = null

        const urlValue = unref(url)

        try {
            const controller = new AbortController();
            let timeoutId: number | undefined;

            if (options.timeout) {
                timeoutId = window.setTimeout(() => {
                    controller.abort();
                }, options.timeout);
            }

            const response = await fetch(urlValue, {
                headers: options.headers,
                signal: controller.signal
            });

            if (timeoutId) clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`API error: ${response.status}`)

            data.value = await response.json()
        } catch (e) {
            error.value = (e as any)?.name === 'AbortError'
                ? new Error('Request timed out')
                : e instanceof Error ? e : new Error(String(e))
        } finally {
            await nextTick()
            loading.value = false
        }
    }

    if (options.immediate !== false) execute()

    if (typeof url !== 'string' && options.immediate === false) {
        watchEffect(() => execute())
    }

    return { data, error, loading, execute }
}