export const useAuthReady = () => {
    const authReady = useState('authReady', () => false)
    const setAuthReady = (ready: boolean) => {
        authReady.value = ready
    }
    return { authReady, setAuthReady }
}

