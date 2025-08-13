export const useAuthLoading = () => {
    const authLoading = useState('authLoading', () => false)
    const message = useState('authLoadingMessage', () => 'Signing you in...')

    const start = (msg?: string) => {
        if (msg) message.value = msg
        authLoading.value = true
    }

    const stop = () => {
        authLoading.value = false
        message.value = 'Signing you in...'
    }

    return { authLoading, message, start, stop }
}

