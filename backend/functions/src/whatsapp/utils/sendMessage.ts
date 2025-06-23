import axios from 'axios'

export const send_WA_Message = (data, phone_number_id?: string) => {
  phone_number_id = '613700238502517'
  // phone_number_id = '479033418637760'
  const config = {
    method: 'post',
    url: `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID || phone_number_id}/messages`,
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

export const send_WA_ImageMessageInput = (recipient, caption, imageUrl = 'https://goalmatic.io/hero/workflow.png')=> {
  return JSON.stringify({
    'messaging_product': 'whatsapp',
    'preview_url': false,
    'recipient_type': 'individual',
    'to': recipient,
    'type': 'image',
    "image": {
      "link": imageUrl,
      "caption": caption
    }
  })
}

/**
 * Sends a request to WhatsApp Cloud API to mark a message as read and show typing indicator.
 * @param phone_number_id WhatsApp business phone number ID
 * @param message_id WhatsApp message ID to mark as read
 */
export const sendWAReadAndTypingIndicator = async (
  phone_number_id: string,
  message_id: string
) => {
  const url = `https://graph.facebook.com/v23.0/${phone_number_id}/messages`;
  const data = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: message_id,
    typing_indicator: {
      type: 'text',
    },
  };
  const config = {
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  };
  return axios(config);
};
