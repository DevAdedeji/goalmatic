import axios from 'axios'

type msgType = {
     to: {email: string, name: string}[],
    from: {email: string, name: string},
      subject: string,
      message_body: {
        type: string,
        value: string,
      },
}

export const notifyUser = async (msg: msgType) => {
    // We'll use the API key from environment variables
    const ZEPTOMAIL_AUTH = process.env.ZEPTOMAIL_AUTH
    
    // Format request according to ZeptoMail's SendGrid transition API
    const config = {
      from: {
        email: msg.from.email,
        name: msg.from.name
      },
      subject: msg.subject,
      personalizations: [
        {
          to: msg.to
        },
      ],
      content: [
        {
          type: msg.message_body.type || "text/html",
          value: msg.message_body.value
        }
      ],
      tracking_settings: {
        click_tracking: {
          enable: false,
          enable_text: false,
        },
        open_tracking: {
          enable: true,
        },
      },
    }
    
    try {
        // Using SendGrid transition API endpoint
   await axios.post('https://api.zeptomail.com/v1.1/sg/email', config, {
            headers: {
                'Authorization': ZEPTOMAIL_AUTH, 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        return true;
    } catch (e: any) {
        console.error('Failed to send email:', e.response ? e.response.data : e.message);
        return false;
    }
}

