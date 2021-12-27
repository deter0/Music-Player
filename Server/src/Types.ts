import sha256 from "sha256";
import { AreLyricsExplicit } from "./Handlers/Lyrics";
import * as Ratings_ from "./Handlers/Song/Rating/Rating";

export class Song {
	Artist: string;
	Features: string[] = [];
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
	ExternalMedia: boolean;
	Lyrics?:string;
	ExplicitLikely?: boolean = undefined;
	constructor(Artist: string, Title: string, Identifier: string, CoverIndex: string, Duration?: number, Album?: string, ImageFormat?: string, ImageData?: string, ExternalMedia?: boolean) {
		const Artists = Artist.split(", ");
		this.Artist = Artists[0];
		this.Features = Artists.slice(1);
		this.Title = Title;
		this.Identifier = Identifier;
		this.CoverIndex = CoverIndex;
		this.Duration = Duration;
		this.Album = Album || this.Title;
		this.ImageFormat = ImageFormat;
		this.ImageData = ImageData;
		this.Id = Ratings_.GetUniqueId(this);
		this.AlbumId = sha256(this.Album + this.Artist);
		this.ExternalMedia = ExternalMedia || false;
	}

	async Update() {
		this.Liked = (await Ratings_.GetSongRating(this)).UserLiked;
		if (this.ExplicitLikely === undefined) {
			if (this.Lyrics) {
				this.ExplicitLikely = AreLyricsExplicit(this.Lyrics);
			} else {
				this.ExplicitLikely = undefined;
			}
		}
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
	ExternalMedia: boolean;
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

export type Download = { Status: string, Percentage: number, Rate: number, Song: SpotifySong, ETA: number };