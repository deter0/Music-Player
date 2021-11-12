import * as Types from "../Types";
import sha256 from "sha256";

export default class Albums {
	private AlbumArray: Types.AlbumArray;
	private AlbumLookup: Types.AlbumLookup;
	constructor(AlbumArray: Types.AlbumArray, AlbumLookup: Types.AlbumLookup) {
		this.AlbumArray = AlbumArray;
		this.AlbumLookup = AlbumLookup;
	}
	GetAlbums(From: number, To: number) {
		From = Math.max(From, 0);
		To = Math.min(To, this.AlbumArray.length);

		const RangeAlbums: Types.Album[] = [];
		for (let i = From; i < To; i++) {
			RangeAlbums.push(this.AlbumArray[i]);
		}

		return RangeAlbums;
	}
	GetAlbum(AlbumId: string) {
		return this.AlbumLookup[AlbumId];
	}
	GetSongAlbum(Title: string, Album: string) {
		const Id = sha256(Title + Album);
		return this.GetAlbum(Id);
	}
}