export async function findAsync<T>(arr: Array<T>, asyncCallback: (item: T) => Promise<any>): Promise<T | undefined> {
	const results = await Promise.all(arr.map(asyncCallback))
	const index = results.findIndex(result => result)
	return arr[index]
}
