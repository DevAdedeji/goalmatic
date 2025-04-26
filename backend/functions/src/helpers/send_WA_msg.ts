import axios from 'axios'



export const send_WA_Message = (data) => {
  var config = {
    method: 'post',
    url: 'https://graph.facebook.com/v19.0/341827889004649/messages',
    headers: {
      'Authorization': 'Bearer EAAKv99qiXRgBO6xBZC76PHy2TT7FAX0KwIuD5qIQZCG0jJNBiCLFNR1tQJ07YMZCSTgHEqBavE0snLHTLZAZAXBRhpluOMEb5YkbQXhfcl3BJsMZA6ZB9tXSgYmE7Hvzpf49w26AdyVZBXsbaLZB8Ah7pmzsh6ZAtzQrYYcJIXqYLHtKGdMdTsfI48A7FPMZAlACRQf',
      'Content-Type': 'application/json'
    },
    data: data
  };


  return axios(config)
}