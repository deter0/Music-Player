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

// There is a memory leak with loading images so this is a fix
var ImageId = 0;
const MAX_SIZE = 60;
interface Data {
	Image: string;
	Id: number;
	OnUnload?: () => (void),
	ClearImage: (Id: number) => (void)
};
const Images: Data[] = [];
const ImagesLookup: { [index: string]: number } = {}; // number is image's index
const PushData = (Data: Data) => {
	Images.push(Data);
	ImagesLookup[Data.Id] = Images.length - 1;
}
setInterval(() => {
	let Amount = Images.length - MAX_SIZE;
	if (Images.length >= MAX_SIZE) {
		for (let i = 0; i < Amount; i++) {
			console.log("Clearing image");
			if (Images[0]) {
				if (Images[0].OnUnload)
					Images[0].OnUnload();
				delete ImagesLookup[Images[0].Id];
				Images.splice(0, 1);
			}
		}
	}
}, 16);
export const ClearImage = (Id: number) => {
	if (ImagesLookup[Id]) {
		// Since this function is not called here we don't need to fire this function
		// if (Images[0].OnUnload)
		// 	Images[0].OnUnload();
		Images.splice(ImagesLookup[Id], 1);
		delete ImagesLookup[Images[0].Id];
		console.log("Cleared image");
	}
}
export function GetImageFromId(Id: number): (Data | undefined) {
	return Images[ImagesLookup[Id]];
}
const Load = async (Url: string) => {
	return new Promise<number>(async (Resolve, Reject) => {
		try {
			ImageId++; // Ensure no duplicate ids
			const Id = ImageId + 1;
			if (Url.indexOf("/songs/thumbnail") === -1) {
				PushData({ Image: Url, Id: Id, ClearImage: ClearImage });
				Resolve(Id);
				return;
			}
			console.log(Url);
			const Response = await window.API.get(Url);
			const ImageData = (`data:image/jpeg;base64,${Response.data}`);
			PushData({ Image: ImageData, Id: Id, ClearImage: ClearImage });
			Resolve(Id);
		} catch (error) {
			console.error(error);
			Reject(error);
		}
	});
}

export default Load;