import { FlowNode } from '../../types'

export const emailTriggerNodes: FlowNode[] = [
  {
    node_id: 'EMAIL_TRIGGER',
    icon: '/icons/mail.svg',
    name: 'Email Trigger',
    description: 'Trigger a flow when an email is received at a unique address',
    type: 'trigger',
    provider: 'GOALMATIC',
    category: 'MESSAGING',
    props: [
      {
        name: 'Unique Email Address',
        key: 'unique_email',
        type: 'email_display',
        required: false,
        disabled: true,
        copyable: true,
        description: 'Auto-generated unique email address for this trigger',
        placeholder: 'Generating...',
        cloneable: false,
        auto_generate: true
      }

    ],
    expectedOutput: [
      {
        key: 'from_email',
        name: 'Sender Email',
        type: 'text',
        description: 'Email address of the sender'
      },
      {
        key: 'from_name',
        name: 'Sender Name',
        type: 'text',
        description: 'Name of the sender'
      },
      {
        key: 'to_email',
        name: 'Recipient Email',
        type: 'text',
        description: 'The trigger email address that received the message'
      },
      {
        key: 'subject',
        name: 'Email Subject',
        type: 'text',
        description: 'Subject line of the email'
      },
      {
        key: 'body_text',
        name: 'Email Body (Text)',
        type: 'textarea',
        description: 'Plain text content of the email (preview only from webhook)'
      },
      {
        key: 'body_html',
        name: 'Email Body (HTML)',
        type: 'textarea',
        description: 'HTML content of the email (not available from webhook)'
      },
      {
        key: 'received_at',
        name: 'Received Date',
        type: 'text',
        description: 'When the email was received'
      },
      {
        key: 'message_id',
        name: 'Message ID',
        type: 'text',
        description: 'Unique identifier for the email message'
      },
      {
        key: 'sender',
        name: 'Sender (Alias)',
        type: 'text',
        description: 'Sender email address (convenience field)'
      },
      {
        key: 'sender_name',
        name: 'Sender Name (Alias)',
        type: 'text',
        description: 'Sender name or email (convenience field)'
      },
      {
        key: 'email_subject',
        name: 'Subject (Alias)',
        type: 'text',
        description: 'Email subject (convenience field)'
      },
      {
        key: 'email_body',
        name: 'Body (Alias)',
        type: 'textarea',
        description: 'Email body content (convenience field)'
      },
      {
        key: 'received_date',
        name: 'Date (Alias)',
        type: 'text',
        description: 'Received date (convenience field)'
      },
      {
        key: 'attachments',
        name: 'Attachments',
        type: 'array',
        description: 'Array of email attachments (if enabled)'
      },
      {
        key: 'trigger_email',
        name: 'Trigger Email',
        type: 'text',
        description: 'The unique trigger email address that received this message'
      }
    ]
  }
]
