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
        name: 'Email Address',
        key: 'email',
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
        description: 'Name of the sender (if available)'
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
        description: 'Plain text content of the email'
      },
      {
        key: 'body_html',
        name: 'Email Body (HTML)',
        type: 'textarea',
        description: 'HTML content of the email (if available)'
      },
      {
        key: 'received_at',
        name: 'Received Date',
        type: 'text',
        description: 'When the email was received (ISO format)'
      },
      {
        key: 'message_id',
        name: 'Message ID',
        type: 'text',
        description: 'Unique identifier for the email message'
      },
      {
        key: 'headers',
        name: 'Email Headers',
        type: 'object',
        description: 'Email headers object containing metadata'
      },
      {
        key: 'attachments',
        name: 'Attachments',
        type: 'array',
        description: 'Array of email attachments (if any)'
      },
      {
        key: 'trigger_email',
        name: 'Trigger Email',
        type: 'text',
        description: 'The unique trigger email address that received this message'
      },
      {
        key: 'account_id',
        name: 'Account ID',
        type: 'text',
        description: 'Account identifier associated with the email'
      },
      {
        key: 'trigger_type',
        name: 'Trigger Type',
        type: 'text',
        description: 'Type of trigger (always "email" for email triggers)'
      },
      {
        key: 'raw_payload',
        name: 'Raw Payload',
        type: 'object',
        description: 'Complete raw payload from the webhook for debugging'
      }
    ]
  }
]


