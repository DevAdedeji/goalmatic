import { onSnapshot, getDocs, limit, collection, query, where, QueryConstraint, CollectionReference } from 'firebase/firestore'
import { db } from '../init'

const FETCHLIMIT = 200

export const getFirestoreCollectionWithWhereQuery = async (
    collectionName: string,
    ArrayRef: Ref<Array<any>>,
    ...queries: { name: string, operator: any, value: any }[]
) => {
    const collectionRef: CollectionReference = collection(db, collectionName)
    const queryConstraints: QueryConstraint[] = [
        limit(FETCHLIMIT)
    ]

    queries.forEach((queryParam) => {
        queryConstraints.push(where(queryParam.name, queryParam.operator, queryParam.value))
    })

    const q = query(collectionRef, ...queryConstraints)

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
                    const index = ArrayRef.value.findIndex((item) => item.id === changeData.id)
                    if (index !== -1) {
                        ArrayRef.value[index] = changeData
                    } else {
                        // If item doesn't exist (edge case), add it
                        ArrayRef.value.push(changeData)
                    }
                }
                if (change.type === 'removed') {
                    ArrayRef.value = ArrayRef.value.filter((item) => item.id !== changeData.id)
                }
            })
            resolve(ArrayRef.value)
        })
    })
}

export const getFirestoreSubCollectionWithWhereQuery = async (
    collectionName: string,
    documentName: string,
    subCollectionName: string,
    ArrayRef: Ref<Array<any>>,
    ...queries: { name: string, operator: any, value: any }[]
) => {
    // Properly chaining to get a reference to the subcollection
    const subCollectionRef: CollectionReference = collection(db, collectionName, documentName, subCollectionName)
    const queryConstraints: QueryConstraint[] = []

    // Adding each query condition to the constraints array
    queries.forEach((queryParam) => {
        queryConstraints.push(where(queryParam.name, queryParam.operator, queryParam.value))
    })

    const q = query(subCollectionRef, ...queryConstraints)

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
                    const index = ArrayRef.value.findIndex((item) => item.id === changeData.id)
                    if (index !== -1) {
                        ArrayRef.value[index] = changeData
                    } else {
                        // If item doesn't exist (edge case), add it
                        ArrayRef.value.push(changeData)
                    }
                }
                if (change.type === 'removed') {
                    ArrayRef.value = ArrayRef.value.filter((item) => item.id !== changeData.id)
                }
            })
            resolve(ArrayRef.value)
        })
    })
}

export const getFirestoreCollectionWithWhereQueryOnce = async (
    collectionName: string,
    ...queries: { name: string, operator: any, value: any }[]
) => {
    const collectionRef: CollectionReference = collection(db, collectionName)
    const queryConstraints: QueryConstraint[] = [
        limit(FETCHLIMIT)
    ]

    queries.forEach((queryParam) => {
        queryConstraints.push(where(queryParam.name, queryParam.operator, queryParam.value))
    })

    const q = query(collectionRef, ...queryConstraints)

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => doc.data())
}
