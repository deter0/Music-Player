export interface Song {
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
}

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