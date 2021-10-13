import { Router } from "express";
import Songs from "../Handlers/Song/Songs";
import Ratings from "../Handlers/Song/Rating/Rating";
import * as Types from "../Types";

export default class SongsRouter {
	Songs: Songs;
	Router: Router;
	Ratings: Ratings;
	constructor(
		SongArray: Types.SongArray,
		SongLookup: Types.SongLookup,
		SongImages: Types.SongImages,
		AlbumArray: Types.AlbumArray,
		AlbumLookup: Types.AlbumLookup,
		Path?: string
	) {
		this.Ratings = new Ratings();
		this.Songs = new Songs(SongArray, SongLookup, SongImages, this.Ratings, AlbumArray, AlbumLookup, Path);
		this.Router = Router();

		this.Router.get("/", async (Request, Response) => {
			const Identifier = Request.query.Identifier as string;
			if (Identifier) {
				const Song = await this.Songs.GetSong(Identifier, null, true);
				if (Song) {
					Response.json(
						Song
					);
				} else {
					Response.sendStatus(500);
				}
			} else {
				Response.status(400).send("Missing identifier");
			}
		});

		this.Router.get("/range", async (Request, Response) => {
			const From = parseInt(Request.query.From as string);
			const To = parseInt(Request.query.To as string);
			if (From !== NaN && To !== NaN) {
				const Songs = await this.Songs.GetSongs(From, To, Path);
				if (Songs) {
					Response.json(Songs);
				}
			} else {
				Response.sendStatus(400);
			}
		});

		this.Router.post("/like", (Request, Response) => {
			const Id = Request.body.Id as string;
			const Liked = Request.body.Liked as boolean;
			this.Ratings.SetRating(Id, Liked).then(() => {
				Response.sendStatus(200);
			}).catch(error => {
				console.log(error);
				Response.sendStatus(500);
			});
		});

		this.Router.get("/thumbnail", async (Request, Response) => {
			const Identifier = Request.query.Identifier as string;
			if (Identifier) {
				try {
					const Image = await this.Songs.GetSongImage(Identifier);
					Response.send(Image);
				} catch (error) {
					console.log(error);
					Response.sendStatus(404);
				}
			} else {
				Response.sendStatus(400);
			}
		});
	}
}