import { WorkflowContext } from '@upstash/workflow';
import { FlowNode } from '../../../type';
import { goals_db } from '../../../../../init';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { processMentionsProps } from '../../../../../utils/processMentions';
import { generateAiFlowContext } from '../../../../../utils/generateAiFlowContext';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const createRecord = async (
    context: WorkflowContext,
    step: FlowNode,
    previousStepResult: any
) => {
    try {
        // Extract user ID from the flow data
        const { userId } = context.requestPayload as { userId: string };
        if (!userId) {
            throw new Error('User ID not found in flow data');
        }

        const processedProps = processMentionsProps(step.propsData, previousStepResult);

        // Generate AI content for AI-enabled fields and get updated props
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        const {tableId, dataContext, aiInstructions = ''} = processedPropsWithAiContext;


        console.log(aiInstructions, 'aiInstructions');

        console.log(dataContext, 'dataContext');


        if (!tableId) {
            return {
                success: false,
                error: 'Table ID is required',
            };
        }

        // Validate required fields for AI mode
        if (!dataContext) {
            return {
                success: false,
                error: 'Data context is required',
            };
        }

        // Get the table document
        const tableDoc = await goals_db.collection('tables').doc(tableId).get();
        if (!tableDoc.exists) {
            return {
                success: false,
                error: 'Table not found',
            };
        }

        const tableData = tableDoc.data();

        // Check if the table belongs to the user
        if (tableData?.creator_id !== userId) {
            return {
                success: false,
                error: 'Unauthorized access to table',
            };
        }

        let record: any;
        let aiGeneratedData: any = null;


        // AI mode - generate record data using AI
        try {
            // Get table fields for AI context
            const tableFields = tableData?.fields || [];
            const schemaDescription = tableFields
                .map(
                    (field: any) =>
                        `${field.id}: ${field.type} ${field.required ? '(required)' : '(optional)'} - ${field.description || field.name || ''}`
                )
                .join('\n');


        
            // Always use array-based approach for consistency
            const systemPrompt = `You are a structured data generation assistant.

Your purpose is to analyze raw or semi-structured user data and convert it into structured records that match the schema of a database table.

## Your Task:
Given:
- A database table schema
- Optional instructions from the user
- A data context (which may be a single item or an array of items)

You must:
- Generate valid database records that strictly follow the table schema.
- Include only fields defined in the schema (ignore unrelated fields).
- Ensure each field respects its expected data type.
- Always return an array of valid records, even if only one item was provided.
- Make sure all required fields are present in each record.
- If some required values are missing in the input, use common-sense defaults or infer them if safely possible.

## Table Schema:
${schemaDescription}

## Additional Instructions:
${aiInstructions}

## Output Rules:
- Only use the field IDs as keys (not their display names).
- Return a clean, minimal array of records. Do not wrap the array in any explanation or additional data.
- Do not include extra text or metadata in the output—just the array of records.
- Output only fields that are part of the schema.
- Handle all values as best as you can based on their expected types. If a field expects a number, don't return a string.

## Examples:
If input is a single object:
→ Return: [ { ...record } ]

If input is an array:
→ Return: [ { ...record1 }, { ...record2 }, ... ]

Remember: Your job is to help users quickly convert their ideas or raw notes into clean, structured, and valid data for the database.
`;

            // Initialize Google AI
            const google = createGoogleGenerativeAI({
                apiKey: process.env.GOOGLE_API_KEY,
            });

            // Create dynamic schema based on the table's field definitions
            const tableFieldsArray = tableData?.fields || [];
            const schemaFields: Record<string, any> = {};



            // Build Zod schema from table field definitions
            tableFieldsArray.forEach((field: any) => {
                const fieldId = field.id;
                switch (field.type) {
                    case 'text':
                    case 'textarea':
                    case 'email':
                    case 'url':
                        schemaFields[fieldId] = field.required
                            ? z.string()
                            : z.string().optional();
                        break;
                    case 'number':
                        schemaFields[fieldId] = field.required
                            ? z.number()
                            : z.number().optional();
                        break;
                    case 'boolean':
                        schemaFields[fieldId] = field.required
                            ? z.boolean()
                            : z.boolean().optional();
                        break;
                    case 'date':
                    case 'time':
                        schemaFields[fieldId] = field.required
                            ? z.string()
                            : z.string().optional();
                        break;
                    case 'select':
                        schemaFields[fieldId] = field.required
                            ? z.string()
                            : z.string().optional();
                        break;
                    default:
                        // Default to optional string for unknown types
                        schemaFields[fieldId] = z.string().optional();
                }
            });

            // If no schema fields defined, create a basic schema with common fields
            let recordSchema: any;
            if (Object.keys(schemaFields).length > 0) {
                recordSchema = z.object(schemaFields).passthrough();
            } else {
                // Fallback schema with basic fields that work with Gemini
                recordSchema = z
                    .object({
                        field1: z.string().optional(),
                        field2: z.string().optional(),
                        field3: z.string().optional(),
                        field4: z.string().optional(),
                        field5: z.string().optional(),
                    })
                    .passthrough();
            }



            // Use array output strategy for generating multiple records
            const result = await generateObject({
                model: google('gemini-2.5-flash'),
                system: systemPrompt,
                prompt:
                    typeof dataContext === 'string'
                        ? dataContext
                        : JSON.stringify(dataContext, null, 2),
                output: 'array',
                schema: recordSchema,
            });

            aiGeneratedData = result.object;
            record = result.object;


        } catch (error: any) {
            return {
                success: false,
                error: `AI record generation failed: ${error.message}`,
            };
        }

        // Create records in batch
        const createdRecords: any[] = [];
        const recordIds: string[] = [];
        const now = new Date();

        // Pre-scan within the batch to detect duplicates among generated items for fields with preventDuplicates
        const tableFields: Array<any> = tableData?.fields || [];
        const fieldsRequiringUniqueness = new Set(
            tableFields.filter((f: any) => f?.preventDuplicates).map((f: any) => f.id)
        );
        if (fieldsRequiringUniqueness.size > 0) {
            const seenValues: Record<string, Set<string>> = {};
            for (const fieldId of fieldsRequiringUniqueness) {
                seenValues[fieldId] = new Set<string>();
            }
            for (const item of record) {
                for (const fieldId of fieldsRequiringUniqueness) {
                    const value = item[fieldId];
                    if (value !== undefined && value !== null && value !== '') {
                        const key = String(value);
                        if (seenValues[fieldId].has(key)) {
                            return {
                                success: false,
                                error: `Duplicate value '${value}' for unique field '${fieldId}' within batch. Values must be unique.`,
                            };
                        }
                        seenValues[fieldId].add(key);
                    }
                }
            }
        }

        for (const recordItem of record) {
            const recordId = uuidv4();
            const recordRef = goals_db
                .collection('tables')
                .doc(tableId)
                .collection('records')
                .doc(recordId);

            const recordToCreate = {
                ...recordItem,
                id: recordId,
                created_at: Timestamp.fromDate(now),
                updated_at: Timestamp.fromDate(now),
                creator_id: userId,
            };

            // Enforce uniqueness per configured fields against existing records
            if (fieldsRequiringUniqueness.size > 0) {
                for (const fieldId of fieldsRequiringUniqueness) {
                    const value = recordToCreate[fieldId];
                    if (value !== undefined && value !== null && value !== '') {
                        const dupSnap = await goals_db
                            .collection('tables')
                            .doc(tableId)
                            .collection('records')
                            .where(fieldId, '==', value)
                            .limit(1)
                            .get();
                        if (!dupSnap.empty) {
                            return {
                                success: false,
                                error: `Value for '${fieldId}' must be unique. '${value}' already exists.`,
                            };
                        }
                    }
                }
            }

            await recordRef.set(recordToCreate);

            createdRecords.push(recordToCreate);
            recordIds.push(recordId);
        }


        return {
            success: true,
            payload: {
                recordIds,
                recordId: recordIds[0], // For backward compatibility
                created_at: now.toISOString(),
                records: createdRecords,
                record: createdRecords[0], // For backward compatibility
                totalRecordsCreated: createdRecords.length,
                aiGeneratedData,
            },
        };
    } catch (error: any) {

        return {
            success: false,
            error: error?.message || error,
        };
    }
};

export const createRecordNode = {
    nodeId: 'TABLE_CREATE',
    run: createRecord,
};


