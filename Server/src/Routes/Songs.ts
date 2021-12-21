import { Router } from "express";
import Songs from "../Handlers/Song/Songs";
import Ratings from "../Handlers/Song/Rating/Rating";
import * as Types from "../Types";
import path from "path";
import fs from "fs";
import GetUTC from "../GetUTC";

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
		this.Ratings = new Ratings(SongLookup, Path);
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
			const Identifier = Request.body.Identifier as string;
			const Liked = Request.body.Liked as boolean;
			if (!Identifier) {
				Response.status(400).send("Missing identifier");
				return;
			}
			this.Ratings.SetRating(Identifier, Liked).then(() => {
				Response.sendStatus(200);
			}).catch(error => {
				console.log(error);
				Response.sendStatus(500);
			});
		});

		this.Router.get("/raw", async (Request, Response) => {
			console.log("Set headers");
			Response.header('Access-Control-Allow-Origin', Request.get('Origin') || '*');
			Response.header('Access-Control-Allow-Credentials', 'true');
			Response.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
			Response.header('Access-Control-Expose-Headers', 'Content-Length');
			Response.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
			if (Request.method === 'OPTIONS') {
				console.log("Sent options");
				Response.sendStatus(200);
				return;
			}
			let Identifier = Request.query.Identifier as string;
			if (!Identifier) {
				Response.sendStatus(400);
				return;
			}
			Response.sendFile(path.join(this.Songs.Path, Identifier), (Error) => {
				console.error(Error);
			});
		})

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

		this.Router.get("/liked", (Request, Response) => {
			let From = Request.query.From as string;
			let To = Request.query.To as string;
			console.log(From, To);
			if (From && To) {
				this.Ratings.GetSongs(parseInt(From), parseInt(To)).then(Songs => {
					console.log("!");
					Response.json(Songs);
				}).catch(error => {
					console.log("x");
					console.error(error);
					Response.sendStatus(500);
				});
			} else {
				Response.sendStatus(400);
			}
		});

		this.Router.delete("/", (Request, Response) => {
			const Identifier = Request.query.Identifier as string;
			if (Identifier) {
				this.Songs.DeleteSong(Identifier).then(() => {
					Response.sendStatus(200);
				}).catch(error => {
					Response.sendStatus(500);
				})
			} else {
				Response.sendStatus(400);
			}
		});

		this.Router.get("/image", async (Request, Response) => {
			let Identfier = Request.query.Identifier as string;
			if (Identfier) {
				this.Songs.CacheAndGetSongImage(Identfier).then(Image => {
					if (Image !== "") {
						if (!Request.aborted) {
							Response.sendFile(Image, (error) => {
								if (error) {
									console.error(error);
									if (error.toString().includes("ENOENT")) {
										Response.sendStatus(404);
									}
								}
							});
						}
					} else {
						Response.sendStatus(404);
					}
				}).catch(error => {
					console.error(error);
					if (error.toString().includes("ENOENT")) {
						Response.sendStatus(404);
					} else {
						Response.sendStatus(500);
					}
				});
			} else {
				Response.sendStatus(400);
			}
		})
	}
}