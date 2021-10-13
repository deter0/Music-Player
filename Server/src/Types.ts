import sha256 from "sha256";
import * as Ratings_ from "./Handlers/Song/Rating/Rating";

export class Song {
	Artist: string;
	Title: string;
	Album: string;

	Liked?: boolean;

	Duration: number;
	Codec?: string;
	Id: string;
	Identifier: string;

	ImageFormat?: string;
	ImageData?: string;
	CoverIndex: string;
	AlbumId: string;
	constructor(Artist: string, Title: string, Identifier: string, CoverIndex: string, Duration?: number, Album?: string, ImageFormat?: string, ImageData?: string) {
		this.Artist = Artist;
		this.Title = Title;
		this.Identifier = Identifier;
		this.CoverIndex = CoverIndex;
		this.Duration = Duration;
		this.Album = Album || this.Title;
		this.ImageFormat = ImageFormat;
		this.ImageData = ImageData;
		this.Id = Ratings_.GetUniqueId(this);
		this.AlbumId = sha256(this.Album + this.Artist);
	}

	async Update() {
		this.Liked = (await Ratings_.GetSongRating(this)).UserLiked;
	}
}

export type SongT = typeof Song;
export interface Album {
	Artist: string;
	Title: string;
	Songs: Song[];
	Cover: string;
	Id: string;
}

export type SongArray = Song[];
export type SongLookup = { [index: string]: Song };
export type SongImages = { [index: string]: string };
export type AlbumLookup = { [index: string]: Album };
export type AlbumArray = Album[];

export class RatingT {
	UserLiked: boolean = false;
	GeneratedRating?: number = undefined;
};
export type Ratings = { [index: string]: RatingT };
export type GetSongRating = (Song: Song) => (RatingT);