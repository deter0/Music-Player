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
	ExternalMedia?: boolean;
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

export type SpotifyProfile = {
	ProfilePicture: string;
	DisplayName: string;
	ExplicitContentFilter: boolean;
	Id: string;
	Country: string;
};

export type SpotifyAlbum = {
	Artists: {
		Id: string;
		Name: string;
	}[];
	Id: string;
	Images: {
		Width: number;
		Height: number;
		Url: string;
	}[];
	Name: string;
	ReleaseDate: string;
	TotalTracks: number;
};

export type SpotifySong = {
	Artists: {
		Id: string;
		Name: string;
	}[];
	Id: string;
	Images: {
		Width: number;
		Height: number;
		Url: string;
	}[];
	Name: string;
	ReleaseDate: string;
	Album: string;
	Duration: number;
};

export type SpotifySearchResults = {
	Query: string;
	Albums: SpotifyAlbum[];
	Songs: SpotifySong[];
}

export interface Artist {
	Name: string;
	AlbumsId: string[];
	Banner?: string;
	Cover?: string;
}

export type ArtistLookup = { [key: string]: Artist };
export type ArtistArray = Artist[];