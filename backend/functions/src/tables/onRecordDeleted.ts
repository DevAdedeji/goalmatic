import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { goals_db, goals_db_string } from '../init';

// Normalize and key helpers must match create/update logic
const normalizeUnique = (val: any): string => {
    if (val === undefined || val === null) return '';
    return String(val)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const buildUniqueDocId = (fieldId: string, normalized: string) => `${fieldId}::${normalized}`;

// When a record is deleted under tables/{tableId}/records/{recordId},
// remove any corresponding unique index docs under tables/{tableId}/unique/
export const onTableRecordDeleted = onDocumentDeleted({
    document: 'tables/{tableId}/records/{recordId}',
    database: goals_db_string,
    region: 'us-central1',
    retry: false,
}, async (event) => {
    try {
        const tableId = event.params.tableId as string;
        // For onDocumentDeleted, event.data is the deleted document snapshot (no before/after)
        const before = event.data?.data() as Record<string, any> | undefined;
        if (!before) return;

        // We don't know which fields are unique here without reading table doc,
        // so we conservatively attempt deletes for all string/number values present.
        // If the doc doesn't exist, delete is a no-op.
        const uniqueCol = goals_db.collection('tables').doc(tableId).collection('unique');

        const batch = goals_db.batch();
        for (const [key, value] of Object.entries(before)) {
            if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'creator_id') continue;
            if (value === undefined || value === null || value === '') continue;
            const norm = normalizeUnique(value);
            if (!norm) continue;
            const ref = uniqueCol.doc(buildUniqueDocId(key, norm));
            batch.delete(ref);
        }
        await batch.commit();
    } catch (err) {
        console.error('onTableRecordDeleted cleanup failed:', err);
    }
});

