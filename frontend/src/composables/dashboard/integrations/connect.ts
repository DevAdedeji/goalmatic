import { useLinkGoogleCalendar } from './googleCalendar/link'
import { useLinkWhatsapp } from './whatsapp/link'
import { useLinkGoogleSheets } from './googleSheets/link'
import { useComposioGmail } from './gmail/composio'




export const formattedIntegrationsObjectMap = () => {
    const { link: GClink, loading: GClinkLoading } = useLinkGoogleCalendar()
    const { link: whatsappLink, loading: whatsappLinkLoading } = useLinkWhatsapp()
    const { connect: gmailConnect, loading: gmailLinkLoading } = useComposioGmail()
    return [
    {
        id: 'GOOGLECALENDAR',
        link: GClink,
        loading: GClinkLoading
    },
    {
        id: 'WHATSAPP',
        link: whatsappLink,
        loading: whatsappLinkLoading
    },
    {
        id: 'GMAIL',
        link: gmailConnect,
        loading: gmailLinkLoading
    }
]
}


export const useConnectIntegration = () => {
    const connectIntegration = async (id: string) => {
        const formattedIntegrationObj = formattedIntegrationsObjectMap()
        const integration = formattedIntegrationObj.find((integration) => integration.id === id)
        if (integration) {
            integration.loading.value = true
            try {
                await integration.link()
            } catch (error) {
                integration.loading.value = false
                console.error(error)
            }
        }
    }

    return { connectIntegration }
}
