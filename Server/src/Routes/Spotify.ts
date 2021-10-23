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

			Response.redirect("http://localhost:3000/download/spotify");
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
				this.Spotify.Search(Query).then(SearchResponse => {
					Response.json(SearchResponse);
				}).catch(ErrorCode => {
					Response.sendStatus(ErrorCode);
				});
			}
		});
		this.Router.get("/profile", (Request, Response) => {
			this.Spotify.GetUserProfile().then(Profile => {
				Response.json(Profile);
			}).catch(ErrorCode => {
				Response.sendStatus(ErrorCode);
			});
		});
		this.Router.get("/authorized", (Request, Response) => {
			if (this.Spotify.IsAuthorized()) {
				Response.send(true);
			} else {
				Response.send(false);
			}
		})
	}
}