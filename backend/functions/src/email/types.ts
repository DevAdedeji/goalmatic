import { Timestamp } from 'firebase-admin/firestore';

// Email trigger specific types
export interface EmailTrigger {
  id: string;
  flow_id: string;
  creator_id: string;
  email: string; // e.g., "trigger-abc123@goalmatic.io"
  trigger_id: string; // unique identifier for the trigger
  status: 0 | 1 | 2; // 0: inactive, 1: active, 2: suspended
  created_at: Timestamp;
  updated_at: Timestamp;
  last_triggered?: Timestamp;
  trigger_count: number;
  settings: EmailTriggerSettings;
}

export interface EmailTriggerSettings {
  // Email processing options (simplified with defaults)
  include_attachments: boolean;
  max_attachment_size_mb: number;
  allowed_attachment_types?: string[]; // e.g., ['pdf', 'jpg', 'png']

  // Rate limiting (simplified with defaults)
  max_triggers_per_hour?: number;
  max_triggers_per_day?: number;

  // Auto-reply settings (simplified with defaults)
  send_auto_reply: boolean;
}

// Incoming email data structure
export interface IncomingEmail {
  id: string; // unique message ID
  trigger_id: string; // links to EmailTrigger
  flow_id: string;

  // Email metadata
  message_id: string; // original email message ID
  received_at: Timestamp;
  processed_at?: Timestamp;
  processing_status: 'pending' | 'processed' | 'failed' | 'filtered';

  // Email content
  from: {
    email: string;
    name?: string;
  };
  to: {
    email: string; // the unique trigger email
    name?: string;
  };
  cc?: Array<{
    email: string;
    name?: string;
  }>;
  bcc?: Array<{
    email: string;
    name?: string;
  }>;

  subject: string;
  body: {
    text?: string; // plain text version
    html?: string; // HTML version
  };

  // Attachments
  attachments?: EmailAttachment[];

  // Headers and metadata
  headers: Record<string, string>;
  spam_score?: number;
  virus_scan_result?: 'clean' | 'infected' | 'unknown';

  // Processing results
  execution_id?: string; // links to flow execution log
  error_message?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  storage_path?: string; // path to stored file (e.g., in Firebase Storage)
  checksum: string; // for integrity verification
}

// Email trigger node properties (simplified)
export interface EmailTriggerProps {
  // Unique email address (auto-generated, read-only)
  email?: string;
}

// Email data that flows receive as input
export interface EmailFlowInput {
  // Basic email info
  from_email: string;
  from_name?: string;
  to_email: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  received_at: string; // ISO string

  // Metadata
  message_id: string;
  headers: Record<string, string>;

  // Attachments (if enabled)
  attachments?: Array<{
    filename: string;
    content_type: string;
    size_bytes: number;
    download_url?: string; // temporary signed URL for downloading
  }>;

  // Processing info
  trigger_email: string;
  trigger_id: string;
  spam_score?: number;
}

// Webhook payload from email service (AWS SES format)
export interface SESWebhookPayload {
  eventType: 'Receive';
  mail: {
    timestamp: string;
    source: string;
    messageId: string;
    destination: string[];
    headersTruncated: boolean;
    headers: Array<{
      name: string;
      value: string;
    }>;
    commonHeaders: {
      from: string[];
      to: string[];
      cc?: string[];
      subject: string;
    };
  };
  receipt: {
    timestamp: string;
    processingTimeMillis: number;
    recipients: string[];
    spamVerdict: {
      status: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED';
    };
    virusVerdict: {
      status: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED';
    };
    spfVerdict: {
      status: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED';
    };
    dkimVerdict: {
      status: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED';
    };
    dmarcVerdict: {
      status: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED';
    };
    action: {
      type: 'SNS' | 'S3' | 'Lambda' | 'Stop' | 'Bounce' | 'WorkMail';
      topicArn?: string;
      bucketName?: string;
      objectKey?: string;
    };
  };
  content?: string; // Base64 encoded email content
}

// Error types for email processing
export enum EmailProcessingError {
  TRIGGER_NOT_FOUND = 'TRIGGER_NOT_FOUND',
  FLOW_NOT_FOUND = 'FLOW_NOT_FOUND',
  FLOW_INACTIVE = 'FLOW_INACTIVE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SENDER_BLOCKED = 'SENDER_BLOCKED',
  SUBJECT_FILTERED = 'SUBJECT_FILTERED',
  ATTACHMENT_TOO_LARGE = 'ATTACHMENT_TOO_LARGE',
  ATTACHMENT_TYPE_BLOCKED = 'ATTACHMENT_TYPE_BLOCKED',
  VIRUS_DETECTED = 'VIRUS_DETECTED',
  SPAM_DETECTED = 'SPAM_DETECTED',
  PARSING_ERROR = 'PARSING_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR'
}
