import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const createRecord = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Extract user ID from the flow data
        const { userId } = context.requestPayload as { userId: string };
        if (!userId) {
            throw new Error('User ID not found in flow data');
        }

        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);

        // Generate AI content for AI-enabled fields and get updated props
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        const {
            tableId,
            dataContext,
            aiInstructions = ''
        } = processedPropsWithAiContext;

        // Special handling for dataContext - check if it's a mention that should be raw data
        let actualDataContext = dataContext;
        if (typeof dataContext === 'string' && dataContext.includes('[object Object]')) {
            // This indicates the mention was stringified incorrectly, let's get the raw data
            const mentionRegex = /<span[^>]*data-type="mention"[^>]*data-id="([^"]+)"[^>]*>.*?<\/span>/g;
            const match = step.propsData.dataContext?.match(mentionRegex);

            if (match && match[0]) {
                const dataIdMatch = match[0].match(/data-id="([^"]+)"/);
                if (dataIdMatch) {
                    const dataId = dataIdMatch[1];
                    const parts = dataId.match(/^([^[]+)\[([^\]]+)\]$/);
                    if (parts) {
                        const stepId = parts[1];
                        const payloadKey = parts[2];

                        // Get the raw data directly without string conversion
                        const rawData = previousStepResult?.[stepId]?.payload?.[payloadKey];
                        if (rawData) {
                            actualDataContext = rawData;
                            console.log('Using raw data context:', JSON.stringify(rawData, null, 2));
                        }
                    }
                }
            }
        }

        console.log(processedPropsWithAiContext);

        if (!tableId) {
            return {
                success: false,
                error: 'Table ID is required'
            };
        }

        // Validate required fields for AI mode
        if (!actualDataContext) {
            return {
                success: false,
                error: 'Data context is required'
            };
        }

        // Get the table document
        const tableDoc = await goals_db.collection('tables').doc(tableId).get();
        if (!tableDoc.exists) {
            return {
                success: false,
                error: 'Table not found'
            };
        }

        const tableData = tableDoc.data();

        // Check if the table belongs to the user
        if (tableData?.creator_id !== userId) {
            return {
                success: false,
                error: 'Unauthorized access to table'
            };
        }

        let record: any;
        let aiGeneratedData: any = null;

        console.log('called');
        // AI mode - generate record data using AI
        try {
                // Get table fields for AI context
                const tableFields = tableData?.fields || [];
                const schemaDescription = tableFields.map((field: any) =>
                    `${field.id}: ${field.type} ${field.required ? '(required)' : '(optional)'} - ${field.description || field.name || ''}`
                ).join('\n');

                // Analyze the actual data context to determine if it's an array of items
                let parsedDataContext: any;
                try {
                    parsedDataContext = typeof actualDataContext === 'string' ? JSON.parse(actualDataContext) : actualDataContext;
                } catch {
                    parsedDataContext = actualDataContext;
                }

                console.log('Original Data Context Type:', typeof dataContext);
                console.log('Actual Data Context Type:', typeof actualDataContext);
                console.log('Parsed Data Context:', JSON.stringify(parsedDataContext, null, 2));
                console.log('Is Array:', Array.isArray(parsedDataContext));

                const isArrayData = Array.isArray(parsedDataContext) && parsedDataContext.length > 0;
                console.log('Is Array Data:', isArrayData);

                // Always use array-based approach for consistency
                const systemPrompt = `You are a helpful assistant that generates structured data for database records.

Table Schema:
${schemaDescription}

Instructions: ${aiInstructions}

Transform the input data into database records that match the table schema.
- If the input is an array of items, create one record for each item
- If the input is a single item, create one record for that item
- Only include fields that are defined in the schema
- Ensure required fields are included and data types match the schema
- Always return an array of record objects, even if there's only one record`;

                // Initialize Google AI
                const google = createGoogleGenerativeAI({
                    apiKey: process.env.GOOGLE_API_KEY,
                });

                // Create dynamic schema based on the table's field definitions
                const tableFieldsArray = tableData?.fields || [];
                const schemaFields: Record<string, any> = {};

                console.log('Table fields array:', JSON.stringify(tableFieldsArray, null, 2));

                // Build Zod schema from table field definitions
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

                // If no schema fields defined, create a basic schema with common fields
                let recordSchema: any;
                if (Object.keys(schemaFields).length > 0) {
                    recordSchema = z.object(schemaFields).passthrough();
                } else {
                    // Fallback schema with basic fields that work with Gemini
                    recordSchema = z.object({
                        field1: z.string().optional(),
                        field2: z.string().optional(),
                        field3: z.string().optional(),
                        field4: z.string().optional(),
                        field5: z.string().optional(),
                    }).passthrough();
                }

                console.log('Using schema fields:', Object.keys(schemaFields));
                console.log('Schema has fields:', Object.keys(schemaFields).length > 0);

                // Use array output strategy for generating multiple records
                const result = await generateObject({
                    model: google("gemini-2.5-flash"),
                    system: systemPrompt,
                    prompt: typeof actualDataContext === 'string' ? actualDataContext : JSON.stringify(actualDataContext, null, 2),
                    output: 'array',
                    schema: recordSchema
                });

                aiGeneratedData = result.object;
                record = result.object;

                console.log('AI Generated Data:', JSON.stringify(aiGeneratedData, null, 2));
        } catch (error: any) {
            console.log('error22', error);
            return {
                success: false,
                error: `AI record generation failed: ${error.message}`
            };
        }

        // Create records in batch
        const createdRecords: any[] = [];
        const recordIds: string[] = [];
        const now = new Date();

        for (const recordItem of record) {
            const recordId = uuidv4();
            const recordRef = goals_db.collection('tables').doc(tableId).collection('records').doc(recordId);

            const recordToCreate = {
                ...recordItem,
                id: recordId,
                created_at: Timestamp.fromDate(now),
                updated_at: Timestamp.fromDate(now),
                creator_id: userId
            };

            await recordRef.set(recordToCreate);

            createdRecords.push(recordToCreate);
            recordIds.push(recordId);
        }

        console.log(JSON.stringify(createdRecords, null, 2));

        return {
            success: true,
            payload: {
                recordIds,
                recordId: recordIds[0], // For backward compatibility
                created_at: now.toISOString(),
                records: createdRecords,
                record: createdRecords[0], // For backward compatibility
                totalRecordsCreated: createdRecords.length,
                aiGeneratedData
            }
        };
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            error: error?.message || error,
        };
    }
};

export const createRecordNode = {
    nodeId: 'TABLE_CREATE',
    run: createRecord
};
