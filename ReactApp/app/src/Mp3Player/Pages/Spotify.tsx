import { Axios, AxiosResponse } from 'axios';
import React, { Component } from 'react'
import * as Types from "../Types";

import "./Spotify.scss";

class SpotifyProfile extends Component {
	state: { Profile?: Types.SpotifyProfile } = {};
	componentDidMount() {
		if (this.state.Profile)
			return;
		window.API.get("/spotify/profile").then((Response: AxiosResponse<Types.SpotifyProfile>) => {
			this.setState({ Profile: Response.data });
		});
	}
	render() {
		return <div className="spotify-profile-container">
			<p className="logged-in-as">Logged in as:</p>
			<div className="spotify-profile">
				<img className="spotify-profile-picture" src={this.state?.Profile?.ProfilePicture} alt="profile" />
				<p className="spotify-profile-name">{this.state.Profile?.DisplayName}</p>
			</div>
		</div >
	}
}

export default class Spotify extends Component {
	state: { Authorized: boolean } = { Authorized: false };
	componentDidMount() {
		window.API.get("/spotify/authorized").then(Response => {
			if (!Response.data) {
				window.location.pathname = "/download/spotify-config"
			}
		});
	}
	render() {
		return <div className="page-padding-top">
			<p className="context-title-container">
				<span className="context-title">Spotify</span>
				<span className="context-title-icon material-icons">music_note</span>
				{/* TODO(deter): Add spotify svg's */}
			</p>
			<SpotifyProfile />
		</div>// : <Redirect to="/download/spotify-config?e=true" />
	}
}
