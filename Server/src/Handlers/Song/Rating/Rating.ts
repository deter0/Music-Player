import fs from "fs";
import path from "path";
import * as Types from "../../../Types";
import sha256 from "sha256";

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
	constructor(Path?: string) {
		this.Path = path.join(__dirname, "Data/Ratings.json");
		this.LoadRatings();
		RatingsClass = this;
	}
	async LoadRatings() {
		let Ratings;
		try {
			const RatingsBuffer = await fs.readFileSync(path.join(__dirname, "../../../../Data/Ratings.json"), 'utf8');
			Ratings = JSON.parse(RatingsBuffer);
		} catch (error) {
			Ratings = {};
		}

		this.Ratings = Ratings;
	}
	GetUniqueId = GetUniqueId;
	async SetRating(Id: string, Liked: boolean) {
		if (!this.Ratings[Id])
			this.Ratings[Id] = new Rating()

		this.Ratings[Id].UserLiked = Liked;
		console.log("SetRating", Id, Liked);
		await this.SaveRatings();
	}
	async SaveRatings() {
		for (const RatingKey in this.Ratings) {
			if (this.Ratings[RatingKey]) {
				if (this.Ratings[RatingKey].GeneratedRating === DefaultRating.GeneratedRating && this.Ratings[RatingKey].UserLiked === DefaultRating.UserLiked) {
					this.Ratings[RatingKey] = undefined;
				}
			} else {
				this.Ratings[RatingKey] = undefined; // Null cases
			}
		}
		console.log("saving", JSON.stringify(this.Ratings), this.Ratings);
		await fs.writeFileSync(path.join(__dirname, "../../../../Data/Ratings.json"), JSON.stringify(this.Ratings), 'utf-8');
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
		return this.Ratings[GetUniqueId(Song)] || new Rating();
	}
}