import fs from "fs";
import path from "path";
import * as Types from "../../../Types";
import sha256 from "sha256";

const DATA_PATH = "../../../../../Data/Ratings.json";

class Rating {
	UserLiked: boolean = false;
	GeneratedRating?: number = undefined;
};
const DefaultRating = new Rating();

let LastWrite = 0;
let RatingsClass: Ratings | undefined = undefined;

export const GetSongRating = (Song: Types.Song) => {
	if (RatingsClass) {
		return RatingsClass.GetSongRating(Song);
	} else {
		return new Rating();
	}
}

export const GetUniqueId = (Song: Types.Song) => {
	return sha256(`${Song.Artist},${Song.Title},${Song.Album},${Song.Duration}`);
}

export default class Ratings {
	Ratings: Types.Ratings = {};
	Path?: string;

	SongLookup: Types.SongLookup;
	SongPath?: string;
	constructor(SongLookup: Types.SongLookup, Path?: string) {
		this.SongPath = Path;
		this.Path = path.join(__dirname, "Data/Ratings.json");
		this.LoadRatings();
		this.SongLookup = SongLookup;
		RatingsClass = this;
	}
	async LoadRatings() {
		let Ratings;
		try {
			const RatingsBuffer = await fs.readFileSync(path.join(__dirname, DATA_PATH), 'utf8');
			Ratings = JSON.parse(RatingsBuffer);
		} catch (error) {
			Ratings = {};
		}

		this.Ratings = Ratings;
	}
	GetUniqueId = GetUniqueId;
	async SetRating(Identifier: string, Liked: boolean) {
		if (!this.Ratings[Identifier])
			this.Ratings[Identifier] = new Rating()

		this.Ratings[Identifier].UserLiked = Liked;
		console.log("SetRating", Identifier, Liked);
		await this.SaveRatings();
	}
	async SaveRatings() {
		for (const RatingKey in this.Ratings) {
			if (this.Ratings[RatingKey]) {
				if (this.Ratings[RatingKey].GeneratedRating === DefaultRating.GeneratedRating && this.Ratings[RatingKey].UserLiked === DefaultRating.UserLiked) {
					delete this.Ratings[RatingKey];
				}
			} else { // Null cases
				delete this.Ratings[RatingKey];
			}
		}
		console.log("saving", JSON.stringify(this.Ratings), this.Ratings);
		await fs.writeFileSync(path.join(__dirname, DATA_PATH), JSON.stringify(this.Ratings), 'utf-8');
		LastWrite = new Date().getUTCMilliseconds();
		console.log("Saved ratings!");
	}
	async SetGeneratedRating(Id: string, GeneratedRating: number) {
		if (!this.Ratings[Id])
			this.Ratings[Id] = new Rating()

		this.Ratings[Id].GeneratedRating = GeneratedRating;
		await this.SaveRatings();
	}
	GetSongRating(Song: Types.Song) {
		return this.Ratings[Song.Identifier] || new Rating();
	}

	// * Liked song library
	async GetSongs(From: number, To: number) {
		if (this.Ratings) {
			const Songs: Types.Song[] = [];
			let Index = 0;
			for (const Identifier in this.Ratings) {
				if (Index >= From && Index < To) {
					Index++;
					console.log(Index, From, To);
					if (this.Ratings[Identifier]) {
						const Song = this.SongLookup[this.SongPath + Identifier];
						if (Song) {
							let SongRating = this.GetSongRating(Song);
							if (Song && SongRating.UserLiked) {
								Song.Liked = SongRating.UserLiked;
								Songs.push(Song);
							}
						}
					}
				}
			}
			return Songs;
		} else {
			return [];
		}
	}
}