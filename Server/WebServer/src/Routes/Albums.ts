import { Router } from "express";
import Albums from "../Handlers/Albums";
import * as Types from "../Types";

export default class AlbumsRouter {
	Router: Router;
	Albums: Albums;
	constructor(AlbumsArray: Types.AlbumArray, AlbumsLookup: Types.AlbumLookup) {
		this.Router = Router();
		this.Albums = new Albums(AlbumsArray, AlbumsLookup);

		this.Router.get("/range", (Request, Response) => {
			const From = parseInt(Request.query.From as string);
			const To = parseInt(Request.query.To as string);

			if (From !== NaN && To !== NaN) {
				const Albums = this.Albums.GetAlbums(From, To);
				Response.json(Albums);
			}
		});
		this.Router.get("/song", (Request, Response) => {
			let SongTitle = Request.query.SongTitle as string;
			let GetSongAlbum = Request.query.GetSongAlbum as string;
			if (SongTitle && GetSongAlbum) {
				const Album = this.Albums.GetSongAlbum(SongTitle, GetSongAlbum);
				Response.json(Album);
			} else {
				Response.sendStatus(400);
			}
		});
		this.Router.get("/:Id", (Request, Response) => {
			const Id = Request.params.Id as string;
			if (Id) {
				Response.json(this.Albums.GetAlbum(Id));
			} else {
				Response.sendStatus(400);
			}
		});
	}
}