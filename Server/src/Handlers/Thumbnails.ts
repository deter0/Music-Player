import * as Types from "../Types";

export default class Thumbnails {
	async GetSongThumbnail(Identifier: string, Id?: string) {
		let Image;
		if (Id)
			Image = this.SongImages[Id];
		if (!Image) {

		}
	}

	SongImages: Types.SongImages;
	constructor(SongImages: Types.SongImages) {
		this.SongImages = SongImages;
	}
}