import { z } from 'zod';

export const normalizeUnique = (val: any): string => {
    if (val === undefined || val === null) return '';
    return String(val)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

export const buildUniqueDocId = (fieldId: string, normalized: string) => `${fieldId}::${normalized}`;


export const buildRecordSchema = (tableFieldsArray: Array<any>) => {
    const schemaFields: Record<string, any> = {};

    tableFieldsArray.forEach((field: any) => {
        const fieldId = field.id;
        switch (field.type) {
            case 'text':
            case 'textarea':
            case 'email':
            case 'url':
                schemaFields[fieldId] = field.required ? z.string() : z.string().optional();
                break;
            case 'number':
                schemaFields[fieldId] = field.required ? z.number() : z.number().optional();
                break;
            case 'boolean':
                schemaFields[fieldId] = field.required ? z.boolean() : z.boolean().optional();
                break;
            case 'date':
            case 'time':
                schemaFields[fieldId] = field.required ? z.string() : z.string().optional();
                break;
            case 'select':
                schemaFields[fieldId] = field.required ? z.string() : z.string().optional();
                break;
            default:
                // Default to optional string for unknown types
                schemaFields[fieldId] = z.string().optional();
        }
    });

    if (Object.keys(schemaFields).length > 0) {
        return z.object(schemaFields).passthrough();
    }

    // Fallback schema with basic fields that work with Gemini
    return z
        .object({
            field1: z.string().optional(),
            field2: z.string().optional(),
            field3: z.string().optional(),
            field4: z.string().optional(),
            field5: z.string().optional(),
        })
        .passthrough();
};


