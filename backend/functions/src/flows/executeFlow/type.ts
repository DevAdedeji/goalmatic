export type FlowNode = {
  position: number;
  node_id: string; // Or potentially a more specific literal type like 'SEND_EMAIL'
  icon: string;
  name: string;
  description: string;
  type: string; // Or potentially a more specific literal type like 'action'
  provider: string; // Or potentially a more specific literal type like 'GOALMATIC'
  category: string; // Or potentially a more specific literal type like 'MESSAGING'
  propsData: Record<string, any>;
  aiEnabledFields?: string[]; // Array of field keys that should be processed by AI
};

