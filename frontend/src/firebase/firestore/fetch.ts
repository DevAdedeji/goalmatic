import { doc, onSnapshot, getDoc, limit, collection, query, FirestoreError, QuerySnapshot } from 'firebase/firestore'
import { db } from '../init'




const FETCHLIMIT = 300

export const getSingleFirestoreDocument = async (
	collectionName: string,
	id: string,
	DocumentRef: Ref<any>
) => {
	return new Promise((resolve, reject) => {
		try {
			const singleDocumentRef = doc(db, collectionName, id)
			const unsub = onSnapshot(singleDocumentRef, (docSnap) => {
				try {
					if (docSnap.exists()) {
						DocumentRef.value = docSnap.data()
						resolve(DocumentRef.value)
					} else {
						DocumentRef.value = null
						reject(new Error(`Document "${id}" does not exist in collection "${collectionName}"`))
					}
				} catch (error) {
					console.error('Error processing document snapshot:', error)
					reject(error)
				}
			}, (error: FirestoreError) => {
				console.error(`Error fetching document ${collectionName}/${id}:`, error)
				DocumentRef.value = null
				reject(error)
			})
		} catch (error) {
			console.error(`Error setting up listener for document ${collectionName}/${id}:`, error)
			DocumentRef.value = null
			reject(error)
		}
	})
}

export const getSingleFirestoreSubDocument = async (
	collectionName: string,
	documentName: string,
	subCollectionName: string,
	id: string,
	DocumentRef: Ref<any>
) => {
	const path = `${collectionName}/${documentName}/${subCollectionName}/${id}`
	return new Promise((resolve, reject) => {
		try {
			const singleDocumentRef = doc(db, collectionName, documentName, subCollectionName, id)
			const unsub = onSnapshot(singleDocumentRef, (docSnap) => {
				try {
					if (docSnap.exists()) {
						DocumentRef.value = docSnap.data()
						resolve(DocumentRef.value)
					} else {
						DocumentRef.value = null
						resolve(DocumentRef.value)
					}
				} catch (error) {
					console.error(`Error processing subdocument snapshot for path "${path}":`, error)
					reject(error)
				}
			}, (error: FirestoreError) => {
				console.error(`Error fetching subdocument at path "${path}":`, error)
				DocumentRef.value = null
				reject(error)
			})
		} catch (error) {
			console.error(`Error setting up listener for subdocument at path "${path}":`, error)
			DocumentRef.value = null
			reject(error)
		}
	})
}

export const getFirestoreCollection = async (
	collectionName: string,
	ArrayRef: Ref<Array<any>>,
	findFn = (item: any, change: any) => item.id === change.id
) => {
	const collectionRef = collection(db, collectionName)
	const q = query(collectionRef, limit(FETCHLIMIT))

	return new Promise((resolve, reject) => {
		try {
			onDataRefChange(resolve, q, ArrayRef, findFn, collectionName)
		} catch (error) {
			console.error(`Failed to initiate listener for collection "${collectionName}":`, error)
			reject(error)
		}
	})
}

export const getFirestoreSubCollection = async (
	collectionName: string,
	documentName: string,
	subCollectionName: string,
	ArrayRef: Ref<Array<any>>,
	findFn = (item: any, change: any) => item.id === change.id
) => {
	const path = `${collectionName}/${documentName}/${subCollectionName}`
	const collectionRef = collection(db, collectionName, documentName, subCollectionName)
	const q = query(collectionRef, limit(FETCHLIMIT))

	return new Promise((resolve, reject) => {
		try {
			onDataRefChange(resolve, q, ArrayRef, findFn, path)
		} catch (error) {
			console.error(`Failed to initiate listener for subcollection "${path}":`, error)
			reject(error)
		}
	})
}

export const getFirestoreSubSubCollection = async (
	collectionName: string,
	documentName: string,
	subCollectionName: string,
	subDocumentName: string,
	subSubCollectionName: string,
	ArrayRef: Ref<Array<any>>,
	findFn = (item: any, change: any) => item.id === change.id
) => {
	const path = `${collectionName}/${documentName}/${subCollectionName}/${subDocumentName}/${subSubCollectionName}`
	const collectionRef = collection(db, collectionName, documentName, subCollectionName, subDocumentName, subSubCollectionName)
	const q = query(collectionRef, limit(FETCHLIMIT))

	return new Promise((resolve, reject) => {
		try {
			onDataRefChange(resolve, q, ArrayRef, findFn, path)
		} catch (error) {
			console.error(`Failed to initiate listener for sub-subcollection "${path}":`, error)
			reject(error)
		}
	})
}

const onDataRefChange = (resolve, q, ArrayRef, findFn, collectionPath: string) => {
	try {
		const unsub = onSnapshot(q, (snapshot: QuerySnapshot) => {
			try {
				snapshot.docChanges().forEach((change) => {
					const changeData = change.doc.data()
					if (change.type === 'added') {
						const existingItem = ArrayRef.value.find((item) => findFn(item, changeData))
						if (!existingItem) {
							ArrayRef.value.push(changeData)
						}
					} else if (change.type === 'modified') {
						const index = ArrayRef.value.findIndex((item) => findFn(item, changeData))
						if (index !== -1) {
							ArrayRef.value[index] = changeData
						} else {
							ArrayRef.value.push(changeData)
						}
					} else if (change.type === 'removed') {
						ArrayRef.value = ArrayRef.value.filter((item) => !findFn(item, changeData))
					}
				})
				resolve(ArrayRef.value)
			} catch (error) {
				console.error(`Error processing snapshot changes for collection "${collectionPath}":`, error)
			}
		}, (error: FirestoreError) => {
			console.error(`Error listening to collection "${collectionPath}":`, error)
			ArrayRef.value = []
		})
	} catch (error) {
		console.error(`Error setting up listener for collection "${collectionPath}":`, error)
		ArrayRef.value = []
		throw error
	}
}





