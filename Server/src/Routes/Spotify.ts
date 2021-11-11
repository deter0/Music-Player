import { Router } from "express";
import Spotify from "../Handlers/Spotify/Spotify";

import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8081 });

export default class SpotifyRouter {
	Router = Router();
	Spotify = new Spotify();
	Path: string;

	PythonVersion?: string;
	constructor(Path: string, Python?: string) {
		this.Path = Path;
		this.PythonVersion = Python;
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

			if (Error) {
				console.log("Error");
				Response.redirect(`http://localhost:3000/download/spotify?error=${Error}`);
				return;
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
		this.Router.post('/search', async (Request, Response) => {
			let Query = Request.query.Query as string;
			if (Query) {
				this.Spotify.Search(Query).then(SearchResponse => {
					Response.json(SearchResponse);
				}).catch(ErrorCode => {
					Response.sendStatus(ErrorCode);
				});
			} else {
				Response.status(400).send("No query");
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
		});
		this.Router.get("/download", (Request, Response) => {
			let Id = Request.query.Id as string;
			let Path = Request.query.Path as string;
			if (Id && Path) {
				this.Spotify.Download(Id, this.Path || Path, this.PythonVersion);
				Response.sendStatus(200);
			} else {
				Response.status(400).send("No id or path");
			}
		});
		this.Router.get("/Downloads", (Request, Response) => {
			Response.json(this.Spotify.Downloads);
		});
		let ConnectionCount = 0;
		wss.on('connection', (ws) => {
			ConnectionCount++;
			let Connected = ConnectionCount;
			ws.on('message', (message) => {
				console.log('received: %s', message);
			});

			let Callback = () => {
				if (Connected === ConnectionCount) {
					ws.send(JSON.stringify({
						Downloads: this.Spotify.Downloads
					}));
					setTimeout(Callback, 250);
				} else {
					ws.close();
				}
			}
			Callback();
		});
	}
}