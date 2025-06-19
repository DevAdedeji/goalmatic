type dataType = {
    otp: string;
    recipientNumber: string;
}

export const goalmatic_whatsapp_integration_otp = (data: dataType) => {
  return JSON.stringify({
    'messaging_product': 'whatsapp',
    'recipient_type': 'individual',
    'to': data.recipientNumber,
    'type': 'template',
    'template': {
      'name': 'goalmatic_whatsapp_integration_otp',
      'language': {
        'code': 'en_US',
      },
      'components': [
        {
          'type': 'body',
          'parameters': [
            {
              'type': 'text',
              'text': data.otp,
            },        
          ],
          },
            {
          'type': 'button',
          'sub_type': 'url',
          'index': '0',
          'parameters': [
            {
              'type': 'text',
              'text': data.otp,
            },
          ],
        },
      ],
    },
  })
}