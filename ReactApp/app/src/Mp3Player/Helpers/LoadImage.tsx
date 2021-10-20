// const B64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
// 	const byteCharacters = atob(b64Data);
// 	const byteArrays = [];

// 	for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
// 		const slice = byteCharacters.slice(offset, offset + sliceSize);

// 		const byteNumbers = new Array(slice.length);
// 		for (let i = 0; i < slice.length; i++) {
// 			byteNumbers[i] = slice.charCodeAt(i);
// 		}

// 		const byteArray = new Uint8Array(byteNumbers);
// 		byteArrays.push(byteArray);
// 	}

// 	const blob = new Blob(byteArrays, { type: contentType });
// 	return blob;
// }

const Load = async (Url: string) => {
	return new Promise<string>(async (Resolve, Reject) => {
		try {
			const Response = await window.API.get(Url);
			// Blobs are slow for some reason
			// const Blob = B64toBlob(Response.data);
			// const BlobUrl = URL.createObjectURL(Blob);
			console.log(Response.data);
			Resolve(`data:image/jpeg;base64,${Response.data}`);
		} catch (error) {
			console.error(error);
			Reject(error);
		}
	});
}

export default Load;