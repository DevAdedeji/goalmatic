import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

/**
 * Generates a field ID from a field name by converting to lowercase, trimming, and replacing spaces with underscores
 * @param name The field name
 * @returns A normalized field ID
 */
const generateFieldId = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return crypto.randomUUID();
  }

  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, ''); // Remove any non-alphanumeric characters except underscores

  // If after normalization we have an empty string, fallback to UUID
  if (!normalized) {
    return crypto.randomUUID();
  }

  return normalized;
};

/**
 * Ensures field ID uniqueness within a list of fields
 * @param name The field name
 * @param existingFields Array of existing fields
 * @returns A unique field ID
 */
const generateUniqueFieldId = (name: string, existingFields: { id: string }[] = []): string => {
  const baseId = generateFieldId(name);
  const existingIds = existingFields.map((field) => field.id);
  
  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  // If base ID exists, append a number
  let counter = 1;
  let uniqueId = `${baseId}_${counter}`;
  
  while (existingIds.includes(uniqueId)) {
    counter++;
    uniqueId = `${baseId}_${counter}`;
  }
  
  return uniqueId;
};

/**
 * Firebase callable function to generate table fields from natural language description.
 * Expects { description: string }
 * Returns { fields: TableField[] }
 */
export const generateTableFields = onCall({ cors: true, region: 'us-central1' }, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Unauthorized');
    }
    
    const { description } = request.data;
    if (!description || typeof description !== 'string') {
      throw new HttpsError('invalid-argument', 'Missing or invalid description');
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Define the field schema
    const fieldSchema = z.object({
      id: z.string().optional().describe('A unique identifier for the field (will be generated from name)'),
      name: z.string().describe('The field name (user-friendly label)'),
      type: z.enum(['text', 'number', 'date', 'time', 'boolean', 'select', 'email', 'url', 'textarea']).describe('The field type'),
      description: z.string().optional().describe('Optional description of what this field is for'),
      required: z.boolean().describe('Whether this field is required'),
      options: z.array(z.string()).optional().describe('Options for select type fields (only include if type is "select")')
    });

    // Define the output schema
    const tableSchema = z.object({
      name: z.string().describe('A concise, descriptive name for the table (2-4 words)'),
      description: z.string().describe('A brief description of what this table stores and its purpose'),
      fields: z.array(fieldSchema).describe('Array of generated table fields based on the description')
    });

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `Generate a table with fields for: ${description}`,
      schema: tableSchema,
    });

    if (!result.object) {
      throw new HttpsError('internal', 'AI did not return a valid result');
    }
    
    // Validate that we have at least one field
    if (!result.object.fields || result.object.fields.length === 0) {
      throw new HttpsError('internal', 'AI did not generate any fields');
    }

    // Generate fields with name-based IDs for consistency
    const processedFields = result.object.fields.map((field: any, index: number) => {
      // Generate field ID from name, ensuring uniqueness
      const previousFields = result.object.fields.slice(0, index).map((f: any) => ({ id: generateFieldId(f.name) }));
      field.id = generateUniqueFieldId(field.name, previousFields);
      
      // Ensure options array exists for select fields
      if (field.type === 'select' && !field.options) {
        field.options = [];
      }
      
      // Remove options for non-select fields
      if (field.type !== 'select' && field.options) {
        delete field.options;
      }
      
      return field;
    });
    
    return { 
      name: result.object.name,
      description: result.object.description,
      fields: processedFields 
    };
  } catch (error: any) {
    console.error('Error in generateTableFields:', error);
    throw new HttpsError('internal', error.message || 'Unknown error');
  }
});

const systemPrompt = `
You are an expert database designer tasked with generating complete table structures (name, description, and fields) based on natural language descriptions.

OUTPUT REQUIREMENTS:
1. NAME: Generate a concise, descriptive table name (2-4 words, lowercase with underscores if needed)
2. DESCRIPTION: Write a clear description of what this table stores and its purpose
3. FIELDS: Generate 3-8 relevant fields based on the description

FIELD TYPES AVAILABLE:
- text: Short text input (names, titles, etc.)
- textarea: Long text input (descriptions, notes, etc.)
- number: Numeric values (age, count, price, etc.)
- date: Date values (birthdate, deadline, etc.)
- time: Time values (meeting time, etc.)
- boolean: True/false values (active, completed, etc.)
- select: Dropdown with predefined options (status, category, etc.)
- email: Email addresses
- url: Website URLs

GUIDELINES:
1. Generate 3-8 relevant fields based on the description
2. ID field is automatically handled, don't create one
3. Choose appropriate field types based on the data being stored
4. For select fields, provide 3-5 relevant options
5. Mark essential fields as required
6. Use clear, descriptive field names
7. Add helpful descriptions for complex fields
8. Consider common use cases for the described table

EXAMPLES:

For "Employee management table":
NAME: "employees"
DESCRIPTION: "Manages employee information including personal details, department assignments, and employment status"
FIELDS:
- name (text, required): Employee's full name
- email (email, required): Work email address
- department (select, required): Employee's department [HR, Engineering, Marketing, Sales, Finance]
- hire_date (date, required): Date of hiring
- salary (number): Annual salary
- active (boolean, required): Employment status

For "Project tracking table":
NAME: "projects"
DESCRIPTION: "Tracks project progress, deadlines, and resource allocation for team management"
FIELDS:
- title (text, required): Project name
- description (textarea): Project details
- status (select, required): Current status [Planning, In Progress, Review, Completed, On Hold]
- priority (select, required): Priority level [Low, Medium, High, Critical]
- start_date (date): Project start date
- due_date (date): Project deadline
- budget (number): Project budget

Generate a complete table structure that makes practical sense for the given description.
`;
