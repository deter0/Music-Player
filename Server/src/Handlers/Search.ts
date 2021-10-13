import * as Types from "../Types";
import Fuse from "fuse.js";

const AlbumSearchOptions = {
	shouldSort: true,
	threshold: 0.58,
	keys: [
		"Artist",
		"Title",
		"Song.Title",
		"Song.Album"
	]
};

const SongSearchOptions = {
	shouldSort: true,
	threshold: 0.58,
	keys: [
		"Title",
		"Album",
		"Artist"
	]
};

export default class Search {
	private AlbumArray: Types.AlbumArray;
	private SongArray: Types.SongArray;

	private SongSearch: Fuse<Types.Song>;
	private AlbumSearch: Fuse<Types.Album>;

	constructor(SongArray: Types.SongArray, AlbumArray: Types.AlbumArray) {
		this.AlbumArray = AlbumArray;
		this.SongArray = SongArray;

		this.SongSearch = new Fuse(SongArray, SongSearchOptions);
		this.AlbumSearch = new Fuse(AlbumArray, AlbumSearchOptions);
	}
	SearchSongs(Query: string, From?: number, To?: number) {
		Query = Query.trim().substr(0, 50);
		this.SongSearch.setCollection(this.SongArray);

		const SearchResults = this.SongSearch.search(Query, {
			limit: 20
		});
		for (const Result of SearchResults) {
			Result.item.Update();
		}
		const Results = SearchResults.map(Result => {
			return Result.item;
		});

		return Results;
	}
	// TODO(deter): Make from and to work for these two functions ^ and .
	SearchAlbums(Query: string, From?: number, To?: number) {
		Query = Query.trim().substr(0, 50);
		this.AlbumSearch.setCollection(this.AlbumArray);

		const SearchResults = this.AlbumSearch.search(Query, {
			limit: 20
		});
		const Results = SearchResults.map(Result => {
			return Result.item;
		});

		return Results;
	}
}