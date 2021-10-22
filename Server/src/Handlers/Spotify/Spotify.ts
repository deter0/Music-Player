import axios from "axios";
import FormData from "form-data";
import QueryString from "querystring";

const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-read-currently-playing user-top-read user-follow-read user-library-read';
const REDIRECT_URL = 'http://localhost:8080/spotify/callback';
export default class Spotify {
	// TODO(deter): Save
	ClientId?: string;
	ClientSecret?: string;
	SetClientInfo(ClientId: string, ClientSecret: string) {
		this.ClientId = ClientId;
		this.ClientSecret = ClientSecret;
	}
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
		}).then(Response => {
			console.log("Sucess!");
			console.log(Response.data);
		}).catch(error => {
			console.log(error);
		})
	}
}