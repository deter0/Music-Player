import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import GetUTC from '../Helpers/GetUTC';
import * as Types from "../Types";
import HorizontalScroller from "../Components/HorizontalScroller";

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

declare type SpotifySearchResults = Types.SpotifySearchResults;
class SpotifySearch extends Component {
	state: { Results: Types.Album[] } = { Results: [] }

	LastSearch = 0;
	UpdateResults(Event: React.FormEvent<HTMLInputElement>, Callbacked?: boolean) {
		if ((GetUTC() - this.LastSearch) > 1) {
			this.LastSearch = GetUTC();
			let Target = Event.target as HTMLInputElement;
			let Query = Target.value;

			window.API.post("/spotify/search", {}, {
				params: {
					Query: Query.trim().substr(0, 200)
				}
			}).then(((Response: AxiosResponse<any>) => { // Typescript bug? Cant put type gives weird error
				this.setState({
					Results: Response.data.Albums.map((Data: Types.SpotifyAlbum): Types.Album => {
						return {
							Artist: Data.Artists[0]?.Name,
							Title: Data.Name,
							Songs: [],
							Cover: Data.Images[0]?.Url,
							Id: Data.Id
						};
					})
				});
				console.log(this.state.Results);
			})).catch(Error => {
				console.error(Error);
			})
			if (!Callbacked)
				setTimeout(() => {
					this.UpdateResults(Event, true);
				}, 1100);
		};
	}
	render() {
		return <div>
			<div className="spotify-search-container search">
				<input onInput={(Event) => this.UpdateResults(Event)} className="search" placeholder="Search Spotify..." />
			</div>
			{/* <h1>{this.state.Results}</h1> */}
			<HorizontalScroller Items={this.state.Results} />
		</div>
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
			<SpotifySearch />
		</div>// : <Redirect to="/download/spotify-config?e=true" />
	}
}
