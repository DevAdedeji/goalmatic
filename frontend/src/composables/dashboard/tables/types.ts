// Define table-related types

export interface Field {
	id: string;
	name: string;
	type: string;
	description?: string;
	required?: boolean;
  // If true, disallow duplicate values for this field across all records
  preventDuplicates?: boolean;
	options?: string[];
}

export interface Record {
	id: string;
	[key: string]: any;
}

export interface TableData {
	fields?: Field[];
	records?: Record[];
	[key: string]: any;
}

// Additional table types used across the application
export interface Table {
	id: string;
	name: string;
	description?: string;
	type: string;
	fields: Field[];
	records?: Record[];
	creator_id: string;
	creator_name?: string;
	creator_avatar?: string;
	created_at: any;
	updated_at: any;
	visibility?: string;
	allowed_users?: string[];
}

export interface TableField extends Field {
	required: boolean;
	default?: any;
	optionsText?: string; // For UI handling of select field options
	[key: string]: any; // Allow for additional properties
}
