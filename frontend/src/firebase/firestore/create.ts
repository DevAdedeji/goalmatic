import { v4 as uuidv4 } from 'uuid'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../init'

export const setFirestoreDocument = async (
	collection: string,
	id: string = uuidv4(),
	data: any
) => {
	await setDoc(doc(db, collection, id), data)
}

export const setFirestoreSubDocument = async (
	collectionName: string,
	documentName: string,
	subCollectionName: string,
	id: string = uuidv4(),
	data: any
) => {
	await setDoc(doc(db, collectionName, documentName, subCollectionName, id), data)
}

/**
 * Creates a document in a nested subcollection (3 levels deep)
 * @param collectionName The top-level collection name
 * @param documentName The document ID in the top-level collection
 * @param subCollectionName The subcollection name
 * @param subDocumentName The document ID in the subcollection
 * @param subSubCollectionName The sub-subcollection name
 * @param id The document ID in the sub-subcollection (defaults to a new UUID)
 * @param data The document data
 */
export const setFirestoreSubSubDocument = async (
	collectionName: string,
	documentName: string,
	subCollectionName: string,
	subDocumentName: string,
	subSubCollectionName: string,
	id: string = uuidv4(),
	data: any
) => {
	const docRef = doc(
		db,
		collectionName,
		documentName,
		subCollectionName,
		subDocumentName,
		subSubCollectionName,
		id
	)
	await setDoc(docRef, data)
}
