import axios, { AxiosResponse } from "axios";
import { spawn } from "child_process";

import fs from "fs";
import path from "path";

import * as Types from "../../Types";
import GetUTC from "../../GetUTC";
import * as index from "../../index";
import Signal from "../../Signal";

const DATA_PATH = "../../../../Data/Info.json";

const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-read-currently-playing user-top-read user-follow-read user-library-read';
const REDIRECT_URL = `http://localhost:${index.PORT || 9091}/spotify/callback`;

declare type Download = Types.Download;

console.log("REDIRECT URL: " + REDIRECT_URL)
export default class Spotify {
	// TODO(deter): Save
	ClientId?: string;
	ClientSecret?: string;

	DownloadsChanged: Signal<void> = new Signal<void>();
	// * (deter):Auth
	SetClientInfo(ClientId: string, ClientSecret: string) {
		this.ClientId = ClientId;
		this.ClientSecret = ClientSecret;

		this.SaveClientInfo();
	}
	Auth?: { access_token: string; token_type: string; expires_in: number; refresh_token: string; scope: string, recieved_at: number };
	async Callback(Code: string, State: string) { // Use router
		let Data = {
			grant_type: "authorization_code",
			code: Code,
			redirect_uri: REDIRECT_URL
		};
		let UrlParams = new URLSearchParams(Data);

		axios({
			method: "post",
			url: "https://accounts.spotify.com/api/token",
			headers: {
				'Authorization': 'Basic ' + (Buffer.from(this.ClientId + ':' + this.ClientSecret).toString('base64')),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			data: UrlParams.toString()
		}).then((Response: AxiosResponse<typeof this.Auth>) => {
			let Auth = Response.data;
			Auth.recieved_at = GetUTC();
			this.Auth = Auth as typeof this.Auth;
			this.SaveClientInfo();
			console.log("Authorized", this.Auth);
		}).catch(error => {
			console.log(error);
		})
	}
	Path: string = "../../../Songs";
	PythonVersion: string = "python3";
	constructor(Path?: string, PythonVersion?: string) {
		this.Path = Path;
		this.PythonVersion = PythonVersion;
		this.ReadClientInfo();
		// TODO(load saved token);
		setInterval(() => {
			this.ValidateTokenExpiration();
		}, 1000);
	}

	ValidateTokenExpiration() {
		if (this.IsAuthorized()) {
			let ElapsedTime = GetUTC() - this.Auth.recieved_at;
			if (ElapsedTime >= (this.Auth.expires_in - 60)) { // Margin
				this.RefreshToken();
			}
		}
	}

	RefreshToken() {
		if (!this.Auth || !this.Auth.refresh_token) {
			return;
		}
		let Params = {
			grant_type: "refresh_token",
			refresh_token: this.Auth.refresh_token
		};
		let UrlParams = new URLSearchParams(Params);
		axios({
			method: 'post',
			url: "https://accounts.spotify.com/api/token",
			headers: {
				"Authorization": 'Basic ' + (Buffer.from(this.ClientId + ':' + this.ClientSecret).toString('base64')),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			data: UrlParams.toString()/*QueryString.stringify({
				grant_type: "refresh_token",
				refresh_token: this.Auth.refresh_token
			})*/
		}).then(Response => {
			console.log("refreshed token");
			const RefreshToken = this.Auth.refresh_token;
			let Auth = Response.data as typeof this.Auth;
			Auth.recieved_at = GetUTC();
			this.Auth = Auth;
			if (!this.Auth.refresh_token) {
				this.Auth.refresh_token = RefreshToken;
			}
			this.SaveClientInfo();
		}).catch(Error => {
			this.Auth = null;
			console.log("Error refreshing token");
			console.error(Error);
		});
	}

	private async ReadClientInfo() {
		let ClientInfo;
		try {
			const ClientInfoBuffer = await fs.readFileSync(path.join(__dirname, DATA_PATH), 'utf8');
			ClientInfo = JSON.parse(ClientInfoBuffer);
		} catch (error) {
			ClientInfo = {
				ClientId: "",
				ClientSecret: ""
			};
		}

		this.ClientId = ClientInfo.ClientId;
		this.ClientSecret = ClientInfo.ClientSecret;
		if (ClientInfo.Auth as typeof this.Auth) {
			this.Auth = ClientInfo.Auth as typeof this.Auth;
			console.log("BF", this.Auth);
			this.RefreshToken();
			console.log("AF", this.Auth);
		}
	}

	private async SaveClientInfo() {
		let Data = {
			ClientId: this.ClientId,
			ClientSecret: this.ClientSecret,
			Auth: this.Auth
		};
		console.log("saving", JSON.stringify(Data));
		await fs.writeFileSync(path.join(__dirname, DATA_PATH), JSON.stringify(Data), 'utf-8');
		console.log("Saved Info!");
	}
	//?(deter):API
	IsAuthorized() {
		return this.Auth !== undefined && this.Auth !== null;
	}

	async Search(Query: string) {
		return new Promise<Types.SpotifySearchResults>(async (Resolve, Reject) => {
			if (this.IsAuthorized()) {
				try {
					const Response: AxiosResponse<any> = await axios.get("https://api.spotify.com/v1/search", {
						headers: {
							Authorization: `${this.Auth.token_type} ${this.Auth.access_token}`
						},
						params: {
							q: Query,
							type: "album,artist,playlist,track"
						}
					})
					console.log(Response.data.tracks.items[0]);
					let Results: Types.SpotifySearchResults = {
						Query: Query,
						Albums: Response.data.albums.items.map(
							function (Item: any): Types.SpotifyAlbum {
								return {
									Artists: Item.artists.map((Artist: any) => {
										return {
											Id: Artist.id,
											Name: Artist.name
										};
									}),
									Id: Item.id,
									Images: Item.images ? Item.images.map((image: any) => {
										return {
											Width: image.width,
											Height: image.height,
											Url: image.url
										};
									}) : [],
									Name: Item.name,
									ReleaseDate: Item.release_date,
									TotalTracks: Item.total_tracks
								};
							}),
						Songs: Response.data.tracks.items.map(
							function (Item: any): Types.SpotifySong {
								if (!Item.album.images) {
									console.log("NO IMAGE");
									console.log(Item);
								}
								return {
									Artists: Item.artists.map((Artist: any) => {
										return {
											Id: Artist.id,
											Name: Artist.name
										};
									}),
									Id: Item.id,
									Images: Item.album ? Item.album.images.map((image: any) => {
										return {
											Width: image.width,
											Height: image.height,
											Url: image.url
										};
									}) : [],
									Name: Item.name,
									ReleaseDate: Item.release_date,
									Album: Item.album.name,
									Duration: Item.duration_ms / 1000,
									ExternalMedia: true
								};
							})
					};
					Resolve(Results);
				} catch (error) {
					if (error.toString().includes("Unauthorized")) {
						this.RefreshToken();
						this.Search(Query).then(Resolve, Reject).catch(error => console.error(error));
					} else {
						Reject(500);
					}
				}
			} else {
				console.log("Couldn't verify", this.IsAuthorized());
				Reject(401);
			}
		});
	}

	UserProfileCache?: {
		ClientId: string,
		Data: Types.SpotifyProfile
	};
	GetUserProfile() {
		return new Promise<Types.SpotifyProfile>(async (Resolve, Reject) => {
			if (this.IsAuthorized()) {
				if (this.UserProfileCache && this.UserProfileCache.ClientId === this.ClientId) {
					console.log("Using profile cache");
					Resolve(this.UserProfileCache.Data);
				} else {
					try {
						let Response: AxiosResponse<any> = await axios.get("https://api.spotify.com/v1/me", {
							headers: {
								Authorization: `${this.Auth.token_type} ${this.Auth.access_token}`
							},
						});
						let Profile: Types.SpotifyProfile = {
							DisplayName: Response.data.display_name as string,
							Country: Response.data.ca as string,
							ExplicitContentFilter: Response.data.explicit_content.filter_enabled as boolean,
							Id: Response.data.id as string,
							ProfilePicture: Response.data.images[0].url as string
						};
						this.UserProfileCache = {
							ClientId: this.ClientId,
							Data: Profile
						};
						Resolve(Profile);
					} catch (Error) {
						console.error(Error);
						Reject(500);
					}
				}
			} else {
				Reject(401);
			}
		})
	}

	GetSong(Id: string) {
		return new Promise<Types.SpotifySong>(async (Resolve, Reject) => {
			if (this.IsAuthorized()) {
				try {
					let Response: AxiosResponse<any> = await axios.get(`https://api.spotify.com/v1/tracks/${Id}`, {
						headers: {
							Authorization: `${this.Auth.token_type} ${this.Auth.access_token}`
						}
					});
					let Song: Types.SpotifySong = {
						Artists: Response.data.artists.map((Artist: any) => {
							return {
								Id: Artist.id,
								Name: Artist.name
							};
						}),
						Id: Response.data.id,
						Images: Response.data.album ? Response.data.album.images.map((image: any) => {
							return {
								Width: image.width,
								Height: image.height,
								Url: image.url
							};
						}) : [],
						Name: Response.data.name,
						ReleaseDate: Response.data.release_date,
						Album: Response.data.album.name,
						Duration: Response.data.duration_ms / 1000,
						ExternalMedia: true
					};
					Resolve(Song);
				} catch (Error) {
					console.error(Error);
					Reject(Error);
				}
			}
		});
	}

	MAX_CONCURRENT_DOWNLOADS = 15;
	Queue: Types.SpotifySong[] = [];
	private AddToQueue(Song: Types.SpotifySong) {
		if (this.ConcurrentlyDownload < this.MAX_CONCURRENT_DOWNLOADS) {
			this.DownloadTrack(Song, this.Path, this.PythonVersion);
		} else {
			console.log("Enqueued");;
			this.Queue.push(Song);
			this.StartQueue();
		}
	}
	private isQueueRunning: boolean;
	private StartQueue() {
		if (!this.isQueueRunning) {
			this.isQueueRunning = true;
			const Callback = () => {
				if (this.Queue.length > 0) {
					const ToGo = Math.min(this.MAX_CONCURRENT_DOWNLOADS - this.ConcurrentlyDownload, this.MAX_CONCURRENT_DOWNLOADS);
					if (ToGo > 0) {
						for (let i = 0; i < ToGo; i++) {
							if (this.Queue[0]) {
								this.DownloadTrack(this.Queue[0], this.Path, this.PythonVersion);
								console.log("Downloding", this.Queue[0].Name);
								this.Queue.shift();
							} else {
								break;
							}
						}
					}
					setTimeout(Callback, 1000);
				} else {
					this.isQueueRunning = false;
				}
			}
			Callback();
		}
	}
	private MapLikedSongs(LikedSongs: unknown[]): Types.SpotifySong[] {
		return LikedSongs.map((Track: any): Types.SpotifySong => {
			Track = Track.track;
			return {
				Id: Track.id,
				Artists: Track.artists.map((Artist: any) => {
					return {
						Id: Artist.id,
						Name: Artist.name
					}
				}),
				Images: Track.album ? Track.album.images.map((image: any) => {
					return {
						Width: image.width,
						Height: image.height,
						Url: image.url
					}
				}) : [],
				Name: Track.name,
				ReleaseDate: Track.release_date,
				Album: Track.album.name,
				ExternalMedia: true,
				Duration: Track.duration_ms / 1000
			};
		});
	}

	CancelledLikedSongs = false;
	DownloadingLikedSongs = false;
	CancelDownloadLikedSongs() {
		this.CancelledLikedSongs = true;
		this.Queue = [];
		this.DownloadingLikedSongs = false;
	}
	DownloadsRemoved = new Signal<Types.Download>();
	async DownloadLikedSongs() {
		return new Promise<boolean>(async (Resolve, Reject) => {
			this.DownloadingLikedSongs = true;
			const Recurse = async (Offset: number) => {
				if (this.CancelledLikedSongs) {
					return;
				}
				return new Promise<boolean>(async (Resolve, Reject) => {
					axios.get(`https://api.spotify.com/v1/me/tracks?offset=${Offset}&limit=50`, {
						headers: {
							Authorization: `${this.Auth.token_type} ${this.Auth.access_token}`
						}
					}).then(Response => {
						if (this.CancelledLikedSongs) {
							return;
						}
						const ResponseData: any = Response.data;
						const Tracks = this.MapLikedSongs(ResponseData.items);
						Tracks.forEach(Track => {
							this.AddToQueue(Track);
						});
						const AmountDone = (ResponseData.offset as number) + (ResponseData.limit as number);
						if (AmountDone < ResponseData.total) {
							setTimeout(() => {
								if (!this.CancelDownloadLikedSongs) {
									Recurse(Offset + 50);
								}
							}, 500);
						} else {
							this.DownloadingLikedSongs = false;
						}
						console.log(ResponseData);
					}).catch(err => console.error(err));
				});
			}
			Recurse(0).then(() => {
				Resolve(true);
			}).catch(error => console.error(error))
		});
	}
	Downloads: Download[] = [];
	async Download(Id: string, Path: string, PythonV?: string) {
		this.GetSong(Id).then(Song => {
			this.DownloadTrack(Song, Path, PythonV);
		}).catch(Error => {
			console.error(Error);
		});
	}
	private Exists(Song: Types.SpotifySong): boolean {
		const INVALID = /[#<%>&\*\{\?\}/\\$+!`'\|\"=@\.\[\]:]/g;
		const Name = `${Song.Artists[0].Name} ${Song.Name}`;
		if (fs.existsSync(path.join(this.Path, `${Name}.m4a`))) {
			return true;
		}
		return false;
	}
	ConcurrentlyDownload: number = 0;
	DownloadTrack(Song: Types.SpotifySong, Path: string, PythonV?: string) {
		return new Promise<void>((resolve, reject) => {
			if (this.Exists(Song)) {
				console.log("Exists");
				const Download = {
					Status: "Completed",
					Percentage: 100,
					Rate: 0,
					Song: Song,
					ETA: 0
				};
				this.Downloads.push(Download);
				this.DownloadsChanged.dispatch();
				resolve();
				return;
			}
			const Download = {
				Status: "Queued",
				Percentage: 0,
				Rate: 0,
				Song: Song,
				ETA: 0
			};
			this.Downloads.push(Download);
			this.DownloadsChanged.dispatch();
			this.ConcurrentlyDownload++;
			const Id = Song.Id;
			try {
				// If you're getting spawn errors change this to `python` or `python3` depending on what you have installed
				const PythonProcess = spawn(PythonV || "python3", [path.join(__dirname, "../../../SpotifyDownloader/main.py"), "song", Id, Path, this.Auth.access_token]);
				PythonProcess.on("error", (Error: any) => {
					console.error(Error);
				});
				const _global = global as any;
				PythonProcess.stdout.on("data", (Data: any) => {
					let Line = Data.toString() as string;
					if (Line.indexOf("ETA") !== -1) {
						let Data = {
							Percentage: 0,
							Speed: 0,
							Eta: 0
						}
						let Split = Line.split("[");
						for (let i = 0; i < Split.length; i++) {
							let Input = Split[i];
							let NumStr = Input.match(/[\d.,]+/);
							if (NumStr && NumStr[0]) {
								let Num = parseFloat(NumStr[0]);
								if (Input.indexOf("%") !== -1) {
									Data.Percentage = Num;
								} else if (Input.indexOf("KB/s") !== -1) {
									Data.Speed = Num;
								} else if (Input.indexOf("secs") !== -1) {
									Data.Eta = Num;
								}
							}
						}
						if (Data.Percentage) {
							Download.Percentage = Data.Percentage;
							Download.Rate = Data.Speed;
							Download.ETA = Data.Eta;
						}
					} else if (Line.indexOf("Downloading") !== -1) {
						this.Downloads[this.Downloads.indexOf(Download)].Status = "Downloading";
						this.DownloadsChanged.dispatch();
					}
				});
				PythonProcess.on("exit", (Code: number) => {
					if (Code === 0) {
						const Artist = Song.Artists.map((Artist: any) => Artist.Name).join(", ");
						const SongName =
							`${Artist} ${Song.Name}`.replace(/[#<%>&\*\{\?\}/\\$+!`'\|\"=@\.\[\]:]*/g, "");
						_global.CacheSong(`${SongName}.m4a`, Path);
						console.log("Downloaded", Song.Name + ".m4a", Path);
						this.Downloads[this.Downloads.indexOf(Download)].Status = "Completed";
						this.Downloads[this.Downloads.indexOf(Download)].Percentage = 100;
						this.DownloadsChanged.dispatch();
						this.ConcurrentlyDownload--;
						resolve();
					} else {
						console.error("Error code dowloading", Code);
						this.Downloads[this.Downloads.indexOf(Download)].Status = `Error: Code ${Code}`;
						this.DownloadsChanged.dispatch();
						this.ConcurrentlyDownload--;
						reject(Code);
					}
				});
			} catch (error) {
				console.error("Error dowloading", error);
				this.Downloads[this.Downloads.indexOf(Download)].Status = `Error: ${error}`;
				this.DownloadsChanged.dispatch();
				this.ConcurrentlyDownload--;
				reject(error);
			}
		});
	}
}