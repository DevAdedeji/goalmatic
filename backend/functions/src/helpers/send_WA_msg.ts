import axios from 'axios'



export const send_WA_Message = (data, phone_number_id?: string) => {
  // Use the phone_number_id from the webhook payload (the number that received the message)
  // Fallback to environment variable if not provided
  const actualPhoneNumberId = phone_number_id || process.env.PHONE_NUMBER_ID || '341827889004649'
  
  var config = {
    method: 'post',
    url: `https://graph.facebook.com/v19.0/${actualPhoneNumberId}/messages`,
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: data
  };


  return axios(config)
}