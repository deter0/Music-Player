import { Router } from "express";
import Lyrics from "../Handlers/Lyrics";
import * as Types from "../Types";

export default class LyricsRouter {
	Router: Router = Router();
	constructor() {
		this.Router.get("/", (Request, Response) => {
			const SongIdentifier = Request.query.SongIdentifier as string;
			if (SongIdentifier) {
				const _global = global as any;
				_global.GetSong(SongIdentifier).then((Song: Types.Song) => {
					Lyrics(Song).then((Lyrics) => {
						Response.send(Lyrics);
					}).catch((Error) => {
						if (Error.response.status === 404) {
							Response.status(404).send("No lyrics found");
						} else {
							Response.status(500).send("Internal Server Error");
						}
					});
				});
			} else {
				Response.status(400).send("Invalid Request");
			}
		});
	}
}