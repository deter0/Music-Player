import { Router } from "express";
import Spotify from "../Handlers/Spotify/Spotify";

export default class SpotifyRouter {
	Router = Router();
	Spotify = new Spotify();
	constructor() {
		this.Router.post("/set", (Request, Response) => {
			let ClientId = Request.body.ClientId as string;
			let ClientSecret = Request.body.ClientSecret as string;
			console.log("got set request", ClientId, ClientSecret);

			if (ClientId && ClientSecret) {
				try {
					this.Spotify.SetClientInfo(ClientId, ClientSecret);
					Response.sendStatus(200);
				} catch (error) {
					Response.status(500).send(error);
				}
			} else {
				Response.sendStatus(400);
			}
		});
		this.Router.get('/callback', (Request, Response) => {
			let Error = Request.query.error as string;
			let State = Request.query.state as string;
			let Code = Request.query.code as string;

			if (Error && !Code) {
				Response.status(500).send(Error);
			} else {
				this.Spotify.Callback(Code, State);
				Response.status(200);
			}

			Response.redirect("http://192.168.2.13:3000/download");
			// Response.sendStatus(200);
		});
		this.Router.get('/info', (Request, Response) => {
			Response.json({
				ClientId: this.Spotify.ClientId,
				ClientSecret: this.Spotify.ClientSecret
			});
		});
		this.Router.get('/search', async (Request, Response) => {
			let Query = Request.query.Query as string;
			if (Query) {
				let SearchResponse = await this.Spotify.Search(Query);
				if (typeof (SearchResponse) === "number") {
					Response.sendStatus(401);
				} else {
					Response.json(SearchResponse);
				}
			}
		})
	}
}