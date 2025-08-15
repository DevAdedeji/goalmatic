import { ref, shallowReactive } from 'vue'

export const modalType = ref()
export const closeModalType = () => {
    modalType.value = null
    payloads.value = {}
    try {
        if (stack.value.length === 0) {
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
            document.body.style.touchAction = ''
        }
    } catch {}
}

const capitalize = (text: string) => (text[0] ?? '').toUpperCase() + text.slice(1)
const merge = (type: string, key: string) => type + key

function spreadModals<T>(type: string, modals: Record<string, T>) {
    return Object.fromEntries(Object.entries(modals).map(([key, val]) => [merge(type, key), val]))
}
const stack = ref<string[]>([])
const payloads = ref<Record<string, any>>({})

export const closeAllExtremes = () => {
    stack.value = []
    payloads.value = {}
    modalType.value = null
    try {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
    } catch {}
}

export const useModal = () => {
    const modals = shallowReactive({})

    const open = (id: string, payload: any = null) => {
        close(id)
        if (Object.keys(modals).includes(id)) {
            stack.value.push(id)
            try {
                // lock background scroll when any modal opens
                document.documentElement.style.overflow = 'hidden'
                document.body.style.overflow = 'hidden'
                document.body.style.touchAction = 'none'
            } catch {}
            if (payload !== null) {
                payloads.value[id] = payload
            }
        } else {
            console.warn(`Modal with id "${id}" not registered.`)
        }
    }

    const close = (id: string) => {
        const index = stack.value.findIndex((i) => i === id)
        if (index > -1) {
            stack.value.splice(index, 1)
            delete payloads.value[id]
            try {
                // restore scroll if no more modals open
                if (stack.value.length === 0) {
                    document.documentElement.style.overflow = ''
                    document.body.style.overflow = ''
                    document.body.style.touchAction = ''
                }
            } catch {}
        }
    }

    const toggle = (id: string, payload: any = null) => {
        if (stack.value.includes(id)) {
            close(id)
            closeModalType()
        } else {
            open(id, payload)
        }
    }

    function register<Key extends string>(type: string, modalObject: Record<Key, any>) {
        Object.assign(modals, spreadModals(type, modalObject))
        const helpers = Object.fromEntries(
            Object.keys(modalObject)
                .map((key) => ({ capitalizedKey: capitalize(key), originalKey: key }))
                .flatMap(({ capitalizedKey, originalKey }) => [
                    [`open${capitalizedKey}`, (payload: any = null) => open(merge(type, originalKey), payload)],
                    [`close${capitalizedKey}`, () => close(merge(type, originalKey))],
                    [`toggle${capitalizedKey}`, (payload: any = null) => toggle(merge(type, originalKey), payload)]
                ])
        ) as Record<`open${Capitalize<Key>}` | `close${Capitalize<Key>}` | `toggle${Capitalize<Key>}`, (payload?: any) => void>

        const closeAll = () => {
            Object.keys(modalObject).forEach((key) => {
                const fullId = merge(type, key)
                close(fullId)
            })
        }
        return { ...helpers, closeAll }
    }

    return { stack, modals, open, close, register, closeAllExtremes, payloads }
}

export const modal = useModal()
