import { WorkflowContext } from '@upstash/workflow';
import { FlowNode } from '../../../type';
import { goals_db } from '../../../../../init';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { processMentionsProps } from '../../../../../utils/processMentions';
import { generateAiFlowContext } from '../../../../../utils/generateAiFlowContext';
// centralized AI helpers used via node/utils
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { normalizeUnique, buildUniqueDocId, buildRecordSchema } from './utils';
import { generateStructuredData } from '../utils';
import { createRecordChecks } from './utils/checks';
import { createRecordPrompt } from './utils/prompts';

// Normalize field names so variations like "Activity Name", "activity_name",
// "activity-name" or "activityName" can be matched consistently
const normalizeFieldName = (val: any): string => {
    if (val === undefined || val === null) return '';
    return String(val)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
};

const createRecord = async (
    context: WorkflowContext,
    step: FlowNode,
    previousStepResult: any
) => {
    try {
        const { userId } = context.requestPayload as { userId: string };
        const processedProps = processMentionsProps(step.propsData, previousStepResult);
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);
        const { tableId, dataContext, aiInstructions = '' } = processedPropsWithAiContext;
        const { tableData, error } = await createRecordChecks(userId, tableId, dataContext);

        if (error || !tableData) { return { success: false, error: error }; }

        let record: any;
        let aiGeneratedData: any = null;

        console.log(dataContext, 'dataContext');
        try {
            // Build a lightweight current date/time context for better date handling
            const nowDate = new Date();
            const isoNow = nowDate.toISOString();
            const humanDate = nowDate.toLocaleDateString('en-US'); // YYYY-MM-DD
            const humanTime = nowDate.toTimeString().slice(0, 8);   // HH:mm:ss
            const systemPrompt = createRecordPrompt(tableData, aiInstructions, {
                isoNow,
                humanDate,
                humanTime,
            });


            // Build schema using helper
            const tableFieldsArray = tableData?.fields || [];
            const recordSchema = buildRecordSchema(tableFieldsArray);

            // Use centralized helper for array output
            record = await generateStructuredData<any[]>({
                system: systemPrompt,
                prompt: dataContext,
                schema: recordSchema,
                output: 'array',
            });
            aiGeneratedData = record;

        } catch (error: any) {
            return {
                success: false,
                error: `AI record generation failed: ${error.message}`,
            };
        }

        console.log(record, 'record');
        // Create records in batch
        const createdRecords: any[] = [];
        const failedRecords: Array<{ item: any; error: string }> = [];
        const recordIds: string[] = [];
        const now = new Date();

        // Pre-scan within the batch to detect duplicates among generated items for fields with preventDuplicates
        const tableFields: Array<any> = tableData?.fields || [];
        const fieldsRequiringUniqueness = new Set(
            tableFields.filter((f: any) => f?.preventDuplicates).map((f: any) => f.id)
        );


        // Identify duplicates within the incoming batch and mark them as failures instead of aborting the whole batch
        let internalDuplicateErrors: Record<number, string[]> = {};
        if (fieldsRequiringUniqueness.size > 0) {
            const seenValues: Record<string, Map<string, number>> = {};
            for (const fieldId of fieldsRequiringUniqueness) {
                seenValues[fieldId] = new Map<string, number>();
            }
            record.forEach((item: any, index: number) => {
                for (const fieldId of fieldsRequiringUniqueness) {
                    const value = item[fieldId];
                    if (value !== undefined && value !== null && value !== '') {
                        const key = String(value);
                        const firstIndex = seenValues[fieldId].get(key);
                        if (firstIndex !== undefined) {
                            if (!internalDuplicateErrors[index]) internalDuplicateErrors[index] = [];
                            internalDuplicateErrors[index].push(
                                `Duplicate value '${value}' for unique field '${fieldId}' within batch (first seen at index ${firstIndex}).`
                            );
                        } else {
                            seenValues[fieldId].set(key, index);
                        }
                    }
                }
            });
        }

        // Write records with transactional unique index enforcement per record


        for (const [recordIndex, recordItem] of record.entries()) {
            // Skip items that violate uniqueness within the batch and collect as failures
            if (internalDuplicateErrors[recordIndex] && internalDuplicateErrors[recordIndex].length > 0) {
                failedRecords.push({
                    item: recordItem,
                    error: internalDuplicateErrors[recordIndex].join(' '),
                });
                continue;
            }
            const recordId = uuidv4();
            const recordRef = goals_db
                .collection('tables')
                .doc(tableId)
                .collection('records')
                .doc(recordId);

            // Map incoming item keys to field IDs (LLM may output names or case/format variants)
            const mapped: Record<string, any> = {};
            for (const f of tableFields) {
                const id = f.id;
                let val = recordItem[id];
                if (val === undefined) {
                    // try by exact name
                    val = recordItem[f.name];
                }
                if (val === undefined) {
                    // case-insensitive name match
                    const key = Object.keys(recordItem).find(k => k.toLowerCase() === String(f.name || '').toLowerCase());
                    if (key) val = recordItem[key];
                }
                if (val === undefined) {
                    // normalized name match (ignore spaces/underscores/hyphens and casing)
                    const target = normalizeFieldName(f.name);
                    const normKey = Object.keys(recordItem).find(k => normalizeFieldName(k) === target);
                    if (normKey) val = recordItem[normKey];
                }
                if (val !== undefined) mapped[id] = val;
            }

            const recordToCreate = {
                ...mapped,
                id: recordId,
                created_at: Timestamp.fromDate(now),
                updated_at: Timestamp.fromDate(now),
                creator_id: userId,
            };

            try {
                await goals_db.runTransaction(async (tx) => {
                    const tableRef = goals_db.collection('tables').doc(tableId);
                    const uniqueCol = tableRef.collection('unique');
                    for (const fieldId of fieldsRequiringUniqueness) {
                        const value = recordToCreate[fieldId];
                        if (value !== undefined && value !== null && value !== '') {
                            const norm = normalizeUnique(value);
                            const uRef = uniqueCol.doc(buildUniqueDocId(fieldId, norm));
                            const existing = await tx.get(uRef);
                            if (existing.exists) {
                                throw new Error(`Value for '${fieldId}' must be unique. '${value}' already exists.`);
                            }
                            tx.set(uRef, {
                                fieldId,
                                value,
                                normalizedValue: norm,
                                recordId,
                                created_at: AdminTimestamp.fromDate(now),
                                creator_id: userId,
                            });
                        }
                    }
                    tx.set(recordRef, recordToCreate);
                    tx.update(tableRef, { updated_at: AdminTimestamp.fromDate(now) });
                });
                createdRecords.push(recordToCreate);
                recordIds.push(recordId);
            } catch (e: any) {
                failedRecords.push({ item: recordItem, error: e?.message || String(e) });
            }
        }

        console.log(createdRecords, 'createdRecords');
        console.log(createdRecords.length, 'totalRecordsCreated');

        if (createdRecords.length === 0) {
            // Do not fail the entire step if nothing was created; surface failures to downstream nodes
            return {
                success: true,
                payload: {
                    recordIds: [],
                    created_at: now.toISOString(),
                    records: [],
                    totalRecordsCreated: 0,
                    failedRecords,
                    totalRecordsFailed: failedRecords.length,
                    aiGeneratedData,
                    note: failedRecords.length > 0
                        ? `No records created. First failure: ${failedRecords[0].error}`
                        : 'No records to create.'
                }
            };
        }

        return {
            success: true,
            payload: {
                recordIds,
                created_at: now.toISOString(),
                records: createdRecords,
                totalRecordsCreated: createdRecords.length,
                failedRecords,
                totalRecordsFailed: failedRecords.length,
                aiGeneratedData,
            },
        };
    } catch (error: any) {
        console.log(error, 'error');
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


