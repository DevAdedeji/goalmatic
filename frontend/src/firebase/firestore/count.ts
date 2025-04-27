import { onSnapshot, limit, collection, query, where, getCountFromServer } from 'firebase/firestore'
import { db } from '../init'

const FETCHLIMIT = 20

export const getFirestoreSubCollectionCountWithWhereQuery = async (
	collectionName: string,
	documentName: string,
	subCollectionName: string,
	Query: { name:string, operator:any, value:any }
) => {
	const collectionRef = collection(db, collectionName, documentName, subCollectionName)
    const q = query(collectionRef, limit(FETCHLIMIT), where(Query.name, Query.operator, Query.value))
    const snapshot = await getCountFromServer(q)
    const count = snapshot.data().count
    return count
}

export const getFirestoreSubCollectionCount = async (
	collectionName: string,
	documentName: string,
	subCollectionName: string
) => {
	const collectionRef = collection(db, collectionName, documentName, subCollectionName)
    const snapshot = await getCountFromServer(collectionRef)
    const count = snapshot.data().count
    return count
}
