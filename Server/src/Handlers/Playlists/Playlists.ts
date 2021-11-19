import path from "path";
import * as Types from "../../Types";
import fs from "fs";

export class Playlist {
	Name: string;
	Songs: Types.Song[];
}

const PLAYLIST_PATH = path.join(__dirname, "../../../Data/Playlists.json");
export default class Playlists {
	PlaylistArray: Playlist[];
	PlaylistLookup: { [key: string]: Playlist };
	constructor(Playlists_: Playlist[], PlaylistLookup: { [key: string]: Playlist }) {
		this.PlaylistArray = Playlists_;
		this.PlaylistLookup = PlaylistLookup;

		this.LoadPlaylists();
	}
	CreatePlaylist(Name: string) {
		const VALIDATION = /[a-zA-Z0-9<>\[\]^\/.2"'`~!@#$%^&*() ]/gm;
		Name.replace(VALIDATION, "");
		Name.replace("\n", "");
		return new Promise<Playlist>((resolve, reject) => {
			if (!this.GetPlaylistByName(Name)) {
				const NewPlaylist = new Playlist();
				NewPlaylist.Name = Name;
				NewPlaylist.Songs = [];
				console.log("Created playlist", NewPlaylist);
				this.PlaylistArray.push(NewPlaylist);
				this.PlaylistLookup[Name] = NewPlaylist;
				resolve(NewPlaylist);
				this.SavePlaylists();
			} else {
				reject(403);
			}
		});
	}
	GetPlaylistByName(Name: string) {
		return this.PlaylistLookup[Name];
	}
	GetPlaylists(From: number, To: number) {
		return new Promise<Playlist[]>((resolve, reject) => {
			resolve(this.PlaylistArray.slice(From, To));
		});
	}

	private SavePlaylists() {
		fs.writeFileSync(PLAYLIST_PATH, JSON.stringify(this.PlaylistArray), "utf-8");
	}
	private LoadPlaylists() {
		try {
			const Data = fs.readFileSync(PLAYLIST_PATH, "utf-8");
			const Playlists = JSON.parse(Data) as Playlist[];
			this.PlaylistArray = Playlists;
			this.PlaylistLookup = {};
			for (const Playlist of Playlists) {
				this.PlaylistLookup[Playlist.Name] = Playlist;
			}
		} catch (error) {
			if (error.code !== "ENOENT") {
				console.error(error);
			} else {
				this.SavePlaylists();
			}
		}
	}
}