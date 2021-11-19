import { Router } from "express";
import Lyrics from "../Handlers/Lyrics";
export default class LyricsRouter {
	Router: Router = Router();
	constructor() {
		this.Router.get("/", (Request, Response) => {
			const Artist = Request.query.Artist as string;
			const Title = Request.query.Title as string;
			if (Artist && Title) {
				Lyrics(Artist, Title).then((Lyrics) => {
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