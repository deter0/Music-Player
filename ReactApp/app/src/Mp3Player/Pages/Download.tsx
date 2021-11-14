import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import { Link, Route } from 'react-router-dom';
import Spotify from "./Spotify";
import * as Types from "../Types";
import "./Download.scss";
import SecondsToHMS from '../Helpers/SecondsToHMS';

import * as App from "../App";

type SongDownload = { Status: string, Percentage: number, Rate: number, Song: Types.SpotifySong, ETA: number };

class SongDownloadC extends Component<{ Data: SongDownload }> {
	render() {
		return <div className={`${this.props.Data.Status.indexOf("Error") !== -1 ? "download-container-errored" : ""} download-container`}>
			<div className="download-info-container">
				<img src={this.props.Data.Song.Images[1] ? this.props.Data.Song.Images[1].Url : this.props.Data.Song.Images[0].Url} alt="thumbnail" className="song-info-img" />
				<div>
					<h1 className="song-info-main">{this.props.Data.Song.Name}</h1>
					<h1 className="song-info-alt">{this.props.Data.Song.Artists[0].Name}</h1>
				</div>
			</div>
			<div className="download-status-container">
				<h1 className="download-status">{this.props.Data.Status} {this.props.Data.Status !== "Completed" ? ` • ETA: ${SecondsToHMS(this.props.Data.ETA)}` : ""}</h1>
				<h2 className="download-percentage">{this.props.Data.Status !== "Completed" ? `${this.props.Data.ETA} KB/S • ` : ""} {this.props.Data.Percentage}%</h2>
			</div>
			<div className="download-progress-outer"><div style={{ width: `${this.props.Data.Percentage}%` }} className="download-progress-inner"></div></div>
		</div>
	}
}

// var Connection = new WebSocket('ws://localhost:8081', ['soap', 'xmpp']);
class Main extends Component {
	state = { Authorized: false, Downloads: [] };
	Mounted = false;
	componentDidMount() {
		window.API.get("/spotify/authorized").then(Response => {
			this.setState({ Authorized: Response.data });
			console.log(Response.data, typeof (Response.data));
		});

		window.WS.SubscribeEvent<SongDownload[]>("DownloadsChanged").connect((Data) => {
			if (!this.Mounted) return;
			this.setState({
				Downloads: Data.map(Download => {
					return <SongDownloadC Data={Download} />
				})
			});
		});

		this.Mounted = true;
		// setInterval(() => {
		// 	if (this.Mounted) {
		// 		this.UpdateDownloads();
		// 	}
		// }, 1000);
		// Connection.onmessage = (Message) => {
		// 	let Data = JSON.parse(Message.data);
		// 	if (Data.Downloads) {
		// 		if (this.Mounted)
		// 			this.setState({
		// 				Downloads: (Data.Downloads as SongDownload[]).map((Download) => {
		// 					return <SongDownloadC Data={Download} />
		// 				})
		// 			});
		// 	}
		// };
	}
	componentWillUnmount() {
		this.Mounted = false;
	}
	render() {
		return <div className="page-padding-top">
			<p className="context-title-container">
				<span className="context-title">Downloads</span>
				<span className="context-title-icon material-icons">file_downloads</span>
			</p>

			<div className="buttons">
				<Link to={this.state.Authorized ? "/download/spotify" : "/download/spotify-config"} className="button-highlight button">{this.state.Authorized ? "Go to spotify" : "Configure spotify settings"}</Link>
				<button>Youtube search</button>
			</div>

			<div className="downloads-container">
				{this.state.Downloads}
			</div>
		</div>
	}
}
class ConfigureSpotify extends Component {
	state: {
		IsVisible: boolean,
		ClientId: string,
		ClientSecret: string,
		Error?: string
	} = {
			IsVisible: false,
			ClientId: "",
			ClientSecret: "",
		};
	OnSubmit(Event: React.FormEvent<HTMLFormElement>) {
		Event.preventDefault();
		let ClientId = document.getElementById("client-id") as HTMLInputElement;
		let ClientSecret = document.getElementById("client-secret") as HTMLInputElement;
		if (ClientId && ClientSecret) {
			console.log(ClientId.value, ClientSecret.value);
			if (ClientId.value.trim() !== "" && ClientSecret.value.trim() !== "") {
				console.log("Sending")
				window.API.post("/spotify/set", {
					ClientId: ClientId.value.trim(),
					ClientSecret: ClientSecret.value.trim()
				}).then(() => {
					const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-read-currently-playing user-top-read user-follow-read user-library-read';
					const REDIRECT_URL = `http://localhost:${App.Port || 9091}/spotify/callback`;

					let Params = new URLSearchParams({
						response_type: 'code', // ?
						client_id: ClientId.value.trim(),
						scope: SCOPES,
						redirect_uri: REDIRECT_URL
					});
					window.location.href = ('https://accounts.spotify.com/authorize?' + Params.toString());
				}).catch(error => {
					console.error(error);
				});
			}
		}
	}
	componentDidMount() {
		window.API.get("/spotify/info").then((Response: AxiosResponse<{ ClientId: string, ClientSecret: string }>) => {
			this.setState({
				ClientId: Response.data.ClientId,
				ClientSecret: Response.data.ClientSecret,
			});
			let ClientId = document.getElementById("client-id") as HTMLInputElement;
			let ClientSecret = document.getElementById("client-secret") as HTMLInputElement;
			if (ClientId) {
				ClientId.value = this.state.ClientId;
			}
			if (ClientSecret) {
				ClientSecret.value = this.state.ClientSecret;
			}
		});

		const UrlParams = new URLSearchParams(window.location.search);
		let Error = UrlParams.get("error");
		if (Error) {
			this.setState({ Error: Error });
		}
	}
	render() {
		return <div className="page-padding">
			<h1>Spotify login</h1>
			<form onSubmit={(event) => this.OnSubmit(event)} autoCorrect="off" autoComplete="off" spellCheck={false}>
				{this.state.Error && <p>{this.state.Error}</p>}
				<h1 className="label">Client ID: </h1>
				<input maxLength={60} spellCheck={false} placeholder={`Client ID: ${this.state.ClientId}`} id="client-id"></input>
				<h1 className="label">Client Secret: </h1>
				<input maxLength={60} placeholder={
					`Client Secret: ${this.state.IsVisible ? this.state.ClientSecret : "•".repeat(this.state.ClientSecret.length)}`
				} id="client-secret" type={this.state.IsVisible ? "text" : "password"} />
				<p className="checkbox-label">
					Show Client Secret
					<input onClick={() => this.setState({ IsVisible: !this.state.IsVisible })} type="checkbox" />
				</p>
				{/* <Link to="/why?w=spotify&s=client-secret" className="info-link">Why?</Link> */}
				<div className="form-buttons">
					<Link className="button" to="/download">Cancel</Link>
					<button className="button-highlight">Save</button>
				</div>
			</form >
			<h1>How to</h1>
			<h3>Overview</h3>
			<p>
				You need to head over to
				<a href="https://developer.spotify.com/dashboard/applications">Spotify applications page</a>
				and create and application. Then you will see it's Client ID and Client Secret. (Note: You need a spotify account which you can access)
			</p>
			<img loading="lazy" className="help-image" draggable={false} src="https://i.imgur.com/K6Aiajk.png" style={{ border: "1px solid rgba(255, 255, 255, 0.5)", borderRadius: "6px" }} alt="Application details with Client ID and Client Secret. (Don't worry it's blurred)" />
			<h3>Step by step</h3>
			<p>
				Head over to
				<a href="https://developer.spotify.com/dashboard/applications">Spotify applications page</a>
				and login!
			</p >
			<p>
				Once you're logged in, if you're not at the dashboard simply navigate to it. You should see this if you've never created an application before. Click the "<b>Create an app</b>" button.
			</p>
			<img className="help-image" loading="lazy" draggable={false} style={{ marginTop: 16 }} src="https://i.imgur.com/MmPNJHt.png" alt="Spotify dashboard page. Mouse hovering over create app button."></img>
			<p>
				You can set the name and description for whatever you want, or just copy mine if you're not creative.
			</p>
			<img loading="lazy" className="help-image" draggable={false} style={{ marginTop: 16 }} src="https://i.imgur.com/W1RHG9F.png" alt="Spotify create application menu with the following information: App name: 'Music Player App', Description: 'Music Player App, Github: https://github.com/deter0/Music-Player'"></img>
			<p>After that you should be able to see the Client ID and the Client Secret if you press this "<b>Show Client Secret</b>" button.</p>
			<img loading="lazy" className="help-image" draggable={false} src="https://i.imgur.com/K6Aiajk.png" style={{ border: "1px solid rgba(255, 255, 255, 0.5)", borderRadius: "6px" }} alt="Application details with Client ID and Client Secret. (Don't worry it's blurred)" />
			{/* <img className="help-image" loading="lazy" draggable={false} style={{ marginTop: 16 }} src="https://i.imgur.com/6GuVwpQ.png"
				alt="Spotify application that we've created. Mouse hovering over create client ID."></img> */}
			<a style={{ display: "block" }} className="info" target="_blank" rel="noreferrer" href="https://imgur.com/">Images hosted on imgur.</a>
		</div >
	}
}
export default class Download extends Component {
	render() {
		return (
			<>
				<Route path="/download" component={Main} exact={true}></Route>
				<Route path="/download/spotify-config" component={ConfigureSpotify} exact={true}></Route>
				<Route path="/download/spotify" component={Spotify} />
			</>
		)
	}
}
