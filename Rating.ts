// import fs from "fs";
// import path from "path";
// import * as LoadData from "./Server/src/LoadData";
// import sha256 from "sha256";

// import * as Types from "./Server/src/Types";

// const Path = path.join(__dirname, '../Data/Ratings.json');

// class Rating extends Types.RatingT { };

// const DefaultRating = new Rating();
// interface Ratings { [key: string]: Rating };

// let LastWrite: number = 0;
// let Data: Ratings;
// (async () => {
// 	const RatingsBuffer = await fs.readFileSync(Path, 'utf8');
// 	const Ratings: Ratings = JSON.parse(RatingsBuffer);

// 	Data = Ratings;
// })();

// export const ReadRatingsData = async () => {
// 	return Data;
// }

// declare type Song = Types.Song;
// export const GetSongRating = async (Song: Song): Promise<Rating> => {
// 	const SongId = Song.Id;
// 	if (Data[SongId]) {
// 		return Data[SongId];
// 	} else {
// 		return new Rating();
// 	}
// }

// export const GetUniqueId = (song: Song) => {
// 	return sha256(`${song.Artist},${song.Title},${song.Album},${song.Duration}`);
// }

// export const SetRating = async (Id: string, Liked: boolean) => {
// 	const Ratings = await ReadRatingsData();
// 	if (!Ratings[Id])
// 		Ratings[Id] = new Rating()


// 	Ratings[Id].UserLiked = Liked;
// 	console.log("SetRating", Id, Liked);
// 	console.log(Ratings);
// 	await SetRatings(Ratings);
// }

// export const SetGeneratedRating = async (Id: string, NewRating: number) => {
// 	const Ratings = await ReadRatingsData();
// 	if (!Ratings[Id])
// 		Ratings[Id] = new Rating()

// 	Ratings[Id].GeneratedRating = NewRating;
// 	await SetRatings(Ratings);
// }

// export const SetRatings = async (Ratings: Ratings) => {
// 	for (const RatingKey in Ratings) {
// 		if (Ratings[RatingKey]) {
// 			if (Ratings[RatingKey].GeneratedRating === DefaultRating.GeneratedRating && Ratings[RatingKey].UserLiked === DefaultRating.UserLiked) {
// 				Ratings[RatingKey] = undefined;
// 			}
// 		} else {
// 			Ratings[RatingKey] = undefined; // Null cases
// 		}
// 	}
// 	await fs.writeFileSync(Path, JSON.stringify(Ratings), 'utf-8');
// 	Data = Ratings;
// 	LastWrite = new Date().getUTCMilliseconds();
// 	console.log("Done!");
// }