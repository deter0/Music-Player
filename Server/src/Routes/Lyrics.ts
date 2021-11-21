import { Router } from "express";
import Lyrics from "../Handlers/Lyrics";
export default class LyricsRouter {
	Router: Router = Router();
	LyricCache: { [key: string]: string } = {};
	constructor() {
		this.Router.get("/", (Request, Response) => {
			const Artist = Request.query.Artist as string;
			const Title = Request.query.Title as string;
			if (this.LyricCache[Artist + Title]) {
				Response.send(this.LyricCache[Artist + Title]);
				return;
			}
			if (Artist && Title) {
				Lyrics(Artist, Title).then((Lyrics) => {
					this.LyricCache[Artist + Title] = Lyrics;
					Response.send(Lyrics);
				}).catch((Error) => {
					if (Error.response.status === 404) {
						Response.status(404).send("No lyrics found");
					} else {
						Response.status(500).send("Internal Server Error");
					}
				});
			} else {
				Response.status(400).send("Invalid Request");
			}
		});
	}
}