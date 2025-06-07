// Define the flow interface
export interface FlowStep {
	id: string;
	name: string;
	description: string;
	type: string;
	time?: string;
	duration?: number;
	isActive: boolean;
	[key: string]: any; // Allow for additional properties
}

export interface Flow {
	id: string;
	name: string;
	description?: string;
	status: FlowStatus | string; // Allow string for 'archived' or other potential statuses
	type: string;
	steps: FlowStep[];
	creator_id: string;
	created_at: any;
	updated_at: any;
	isValid: boolean;
	cloned_from?: {
		id: string;
		creator_id: string;
		name: string;
	};
}

export interface FlowNode {
	node_id: string;
	icon: string;
	name: string;
	description: string;
	type: string;
	provider: string;
	category: string;
	props?: FlowNodeProp[];
	children?: {
		node_id: string;
		name: string;
		description: string;
		props?: FlowNodeProp[];
	}[];
}

export interface FlowNodeProp {
	name: string;
	key: string;
	type: string;
	description?: string;
	options?: Array<string | { name: string, value: string }>;
	disabled?: boolean;
	required: boolean;
	value?: string | (() => string | undefined);
	validate?: (value: any, formValues: Record<string, any>) => { valid: boolean; message?: string };
	ai_enabled?: boolean;
	cloneable?: boolean;
}

export type FlowStatus = 0 | 1 | 'archived' // 0: draft, 1: active
export type FlowType = 'standard' | 'automated'
