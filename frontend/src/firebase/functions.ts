import { httpsCallable } from 'firebase/functions'
import { functions } from './init'

export const callFirebaseFunction = async (
	functionName: string,
	details: Record<string, any>
) => {
	const call = httpsCallable(functions, functionName)
	return new Promise((resolve, reject) => {
		try {
			call(details)
				.then((res) => {
					resolve(res.data)
				})
				.catch((error) => {
					console.error(`Firebase function ${functionName} error:`, error)
					reject(error)
				})
		} catch (e) {
			console.error(`Error calling Firebase function ${functionName}:`, e)
			reject(e)
		}
	})
}
