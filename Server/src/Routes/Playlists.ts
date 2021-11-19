import { Router } from "express";
import WSS from "../WSS";
import Playlists, { Playlist } from "../Handlers/Playlists/Playlists";

export default class PlaylistsRouter {
	Router: Router;
	Playlists: Playlists;
	constructor(PlaylistArray: Playlist[], PlaylistLookup: { [key: string]: Playlist }, WebServer: WSS) {
		this.Playlists = new Playlists(PlaylistArray, PlaylistLookup);
		this.Router = Router();
		this.Router.get("/", (Request, Response) => {
			try {
				if (Request.query.Name) {
					const Name = (Request.query.Name as string).trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
					const Playlist = this.Playlists.GetPlaylistByName(Name as string);
					if (Playlist) {
						Response.json(Playlist);
						return;
					} else {
						Response.sendStatus(404);
						return;
					}
				} else if (Request.query.From && Request.query.To) {
					const From = parseInt(Request.query.From as string, 10);
					const To = parseInt(Request.query.To as string, 10);
					if (From >= 0 && To >= 0 && To >= From) {
						return Response.json(this.Playlists.GetPlaylists(From, To));
					} else {
						Response.sendStatus(400);
						return;
					}
				}
				Response.sendStatus(400);
			} catch (Error) {
				console.error(Error);
				Response.sendStatus(500);
			}
		});
		type T = {
			Name?: string,
			From?: number,
			To?: number
		};
		WebServer.AppendRequestHandler<T>("Playlists", async (Client, Message) => {
			const MessageData = Message.Prase().Data;
			const Playlists = await this.Playlists.GetPlaylists(MessageData.From, MessageData.To);
			return Playlists;
		});
		this.Router.post("/create", (Request, Response) => {
			const PlaylistName = Request.body.Name as string;
			if (PlaylistName) {
				console.log("Creating playlist");
				this.Playlists.CreatePlaylist(PlaylistName).then((Playlist: Playlist) => {
					Response.json(Playlist);
				}).catch((Error) => {
					if (typeof Error === "number") {
						Response.sendStatus(Error as number);
					} else {
						Response.sendStatus(500);
					}
				});
			} else {
				Response.sendStatus(400);
			}
		});
	}
}