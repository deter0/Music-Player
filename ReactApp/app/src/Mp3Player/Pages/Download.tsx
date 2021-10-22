import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import { Link, Route } from 'react-router-dom';

import "./Download.scss";
class Main extends Component {
	render() {
		return <div>
			<p className="context-title-container">
				<span className="context-title">Downloads</span>
				<span className="context-title-icon material-icons">file_downloads</span>
			</p>

			<div className="buttons">
				<Link to="/download/spotify-config" className="button-highlight button">Configure Spotify application</Link>
				<button>Youtube search</button>
			</div>
		</div>
	}
}
class ConfigureSpotify extends Component {
	state = {
		IsVisible: false,
		ClientId: "",
		ClientSecret: ""
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
					const REDIRECT_URL = 'http://localhost:8080/spotify/callback';

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
	}
	render() {
		return <div className="page-padding">
			<h1>Spotify login</h1>
			<form onSubmit={(event) => this.OnSubmit(event)} autoCorrect="off" autoComplete="off" spellCheck={false}>
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
			</>
		)
	}
}
