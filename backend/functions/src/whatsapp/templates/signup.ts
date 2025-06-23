type dataType = {
  username: string;
  recipientNumber: string;
  uniqueTemplateMessageId: string;
}

export const goalmatic_whatsapp_workflow_template = (data: dataType) => {
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
                'link': 'https://goalmatic.io/hero/workflow.png',
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
    
      ],
    },
  })
}