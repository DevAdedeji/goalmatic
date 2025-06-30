type dataType = {
  username: string;
  recipientNumber: string;
}

export const goalmatic_whatsapp_signup_flow_template = (data: dataType) => {
  return JSON.stringify({
    'messaging_product': 'whatsapp',
    'recipient_type': 'individual',
    'to': data.recipientNumber,
    'type': 'template',
    'template': {
      'name': 'sign_up_flow',
      'language': {
        'code': 'en',
      },
      'components': [
        {
          'type': 'header',
          'parameters': [
            {
              'type': 'image',
              'image': {
                'link': 'https://goalmatic.io/hero/signup-flow.png',
              },
            },
          ],
        },
        {
          'type': 'body',
          'parameters': [
            {
              'type': 'text',
              'text': data.username,
            },

          ],
        },
        {
          'type': 'button',
          "index": "0",
          "sub_type": "flow",
          'parameters': [
            {
              "type": "action",
              "action": {
                "flow_token": data.recipientNumber
              }
            }
          ]
        },
    
      ],
    },
  })
}