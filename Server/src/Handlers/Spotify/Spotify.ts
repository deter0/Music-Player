import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import QueryString from "querystring";

import fs from "fs";
import path from "path";

import * as Types from "../../Types";

const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-read-currently-playing user-top-read user-follow-read user-library-read';
const REDIRECT_URL = 'http://localhost:8080/spotify/callback';

declare type SearchResults = Types.SpotifySearchResults;
export default class Spotify {
	// TODO(deter): Save
	ClientId?: string;
	ClientSecret?: string;
	//?(deter):Auth
	SetClientInfo(ClientId: string, ClientSecret: string) {
		this.ClientId = ClientId;
		this.ClientSecret = ClientSecret;

		this.SaveClientInfo();
	}
	Auth?: { access_token: string; token_type: string; expires_in: number; refresh_token: string; scope: string };
	async Callback(Code: string, State: string) { // Use router
		let Data = {
			grant_type: "authorization_code",
			code: Code,
			redirect_uri: REDIRECT_URL
		};

		axios({
			method: "post",
			url: "https://accounts.spotify.com/api/token",
			headers: {
				'Authorization': 'Basic ' + (Buffer.from(this.ClientId + ':' + this.ClientSecret).toString('base64')),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			data: QueryString.stringify(Data)//TODO(deter): Fix deprecation
		}).then((Response: AxiosResponse<typeof this.Auth>) => {
			this.Auth = Response.data;
			console.log("Authorized", this.Auth);
		}).catch(error => {
			console.log(error);
		})
	}
	constructor() {
		this.ReadClientInfo();
	}

	private async ReadClientInfo() {
		let ClientInfo;
		try {
			const ClientInfoBuffer = await fs.readFileSync(path.join(__dirname, "../../../Data/Info.json"), 'utf8');
			ClientInfo = JSON.parse(ClientInfoBuffer);
		} catch (error) {
			ClientInfo = {
				ClientId: "",
				ClientSecret: ""
			};
		}

		this.ClientId = ClientInfo.ClientId;
		this.ClientSecret = ClientInfo.ClientSecret;
	}

	private async SaveClientInfo() {
		let Data = {
			ClientId: this.ClientId,
			ClientSecret: this.ClientSecret
		};
		console.log("saving", JSON.stringify(Data));
		await fs.writeFileSync(path.join(__dirname, "../../../Data/Info.json"), JSON.stringify(Data), 'utf-8');
		console.log("Saved Info!");
	}
	//?(deter):API
	IsAuthorized() {
		return this.Auth;
	}

	async Search(Query: string) {
		return new Promise<Types.SpotifySearchResults>(async (Resolve, Reject) => {
			if (this.IsAuthorized()) {
				try {
					console.log("Sending");
					const Response: AxiosResponse<any> = await axios.get("https://api.spotify.com/v1/search", {
						headers: {
							Authorization: `${this.Auth.token_type} ${this.Auth.access_token}`
						},
						params: {
							q: Query,
							type: "album,artist,playlist,track"
						}
					});
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
								};
							})
					};
					Resolve(Results);
				} catch (error) {
					console.error(error);
					Reject(500);
				}
			} else {
				console.log("Couldn't verify", this.IsAuthorized());
				Reject(401);
			}
		});
	}

	GetUserProfile() {
		return new Promise<Types.SpotifyProfile>(async (Resolve, Reject) => {
			if (this.IsAuthorized()) {
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
					Resolve(Profile);
				} catch (Error) {
					console.error(Error);
					Reject(500);
				}
			} else {
				Reject(401);
			}
		})
	}
}