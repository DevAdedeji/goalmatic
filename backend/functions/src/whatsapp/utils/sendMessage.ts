
import axios from 'axios'

export const send_WA_Message = (data, phone_number_id?: string) => {
  phone_number_id = '479033418637760'
  const config = {
    method: 'post',
    url: `https://graph.facebook.com/v22.0/${phone_number_id || process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: data,
  }

  return axios(config)
}


export const get_WA_TextMessageInput = (recipient, text)=> {
  return JSON.stringify({
    'messaging_product': 'whatsapp',
    'preview_url': false,
    'recipient_type': 'individual',
    'to': recipient,
    'type': 'text',
    'text': {
      'preview_url': true,
        'body': text,
    },
  })
}
