import axios from 'axios'



export const send_WA_Message = (data) => {
  var config = {
    method: 'post',
    url: 'https://graph.facebook.com/v19.0/341827889004649/messages',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: data
  };


  return axios(config)
}