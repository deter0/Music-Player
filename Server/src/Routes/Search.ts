import Search from "../Handlers/Search";
import { Router } from "express";
import * as Types from "../Types";

export default class SearchRouter {
	Router: Router;

	SongArray: Types.SongArray;
	SongLookup: Types.SongLookup;
	constructor(SongArray: Types.SongArray, AlbumArray: Types.AlbumArray) {
		const SearchRouter = Router();
		const Searcher = new Search(SongArray, AlbumArray);

		SearchRouter.post("/songs", ((Request, Response) => {
			const Query = Request.query.Query as string;
			if (Query && Query.trim() !== "") {
				const AlbumResults = Searcher.SearchSongs(Query);
				Response.status(200).send(AlbumResults);
			} else {
				Response.send([]);
			}
		}));
		SearchRouter.post("/albums", ((Request, Response) => {
			const Query = Request.query.Query as string;
			if (Query && Query.trim() !== "") {
				const AlbumResults = Searcher.SearchAlbums(Query);
				Response.status(200).send(AlbumResults);
			} else {
				Response.send([]);
			}
		}));

		this.Router = SearchRouter;
	}
}