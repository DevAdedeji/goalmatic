import { onSnapshot, limit, collection, query, orderBy } from 'firebase/firestore'
import { db } from '../init'

const FETCHLIMIT = 250

const toSortableValue = (val: any): number | string => {
  if (!val) return 0
  // Firestore Timestamp
  if (typeof val === 'object' && val.seconds !== undefined && val.nanoseconds !== undefined) {
    return val.seconds * 1000 + Math.floor(val.nanoseconds / 1e6)
  }
  // Date string
  if (typeof val === 'string') {
    const ts = Date.parse(val)
    if (!Number.isNaN(ts)) return ts
    return val
  }
  // JS Date
  if (val instanceof Date) return val.getTime()
  // number or fallback
  return typeof val === 'number' ? val : String(val)
}

const sortArrayInPlace = (arr: Array<any>, field: string, order: 'asc' | 'desc') => {
  arr.sort((a, b) => {
    const av = toSortableValue(a?.[field])
    const bv = toSortableValue(b?.[field])
    if (av === bv) return 0
    const cmp = av < bv ? -1 : 1
    return order === 'asc' ? cmp : -cmp
  })
}

export const getFirestoreCollectionWithSort = async (
	collectionName: string,
	ArrayRef: Ref<Array<any>>,
	Sort: { name: string, order: any }
) => {
	const collectionRef = collection(db, collectionName)
	const q = query(collectionRef, limit(FETCHLIMIT), orderBy(Sort.name, Sort.order))

	return new Promise((resolve) => {
		const unsub = onSnapshot(q, (snapshot) => {
			snapshot.docChanges().forEach((change) => {
				const changeData = change.doc.data()

				if (change.type === 'added') {
					// Check if the item already exists in the array to prevent duplicates
					const existingItem = ArrayRef.value.find((item) => item.id === changeData.id)
					if (!existingItem) {
						ArrayRef.value.push(changeData)
					}
				}
				if (change.type === 'modified') {
					const changedArray = ArrayRef.value.filter(
						(item) => item.id !== changeData.id
					)
					ArrayRef.value = [...changedArray, changeData]
				}
				if (change.type === 'removed') {
					const changedArray = ArrayRef.value.filter(
						(item) => item.id !== changeData.id
					)
					ArrayRef.value = changedArray
				}
			})
            // Ensure client-side order is enforced consistently (latest first when desc)
            sortArrayInPlace(ArrayRef.value, Sort.name, Sort.order)
            resolve(ArrayRef.value)
		})
	})
}
export const getFirestoreSubCollectionWithSort = async (
	collectionName: string,
	documentName: string,
	subCollectionName: string,
	ArrayRef: Ref<Array<any>>,
	Sort: { name: string, order: any }
) => {
	const collectionRef = collection(db, collectionName, documentName, subCollectionName)
	const q = query(collectionRef, limit(FETCHLIMIT), orderBy(Sort.name, Sort.order))

	return new Promise((resolve) => {
		const unsub = onSnapshot(q, (snapshot) => {
			snapshot.docChanges().forEach((change) => {
				const changeData = change.doc.data()

				if (change.type === 'added') {
					// Check if the item already exists in the array to prevent duplicates
					const existingItem = ArrayRef.value.find((item) => item.id === changeData.id)
					if (!existingItem) {
						ArrayRef.value.push(changeData)
					}
				}
				if (change.type === 'modified') {
					const changedArray = ArrayRef.value.filter(
						(item) => item.id !== changeData.id
					)
					ArrayRef.value = [...changedArray, changeData]
				}
				if (change.type === 'removed') {
					const changedArray = ArrayRef.value.filter(
						(item) => item.id !== changeData.id
					)
					ArrayRef.value = changedArray
				}
			})
            // Ensure client-side order is enforced consistently (latest first when desc)
            sortArrayInPlace(ArrayRef.value, Sort.name, Sort.order)
            resolve(ArrayRef.value)
		})
	})
}
