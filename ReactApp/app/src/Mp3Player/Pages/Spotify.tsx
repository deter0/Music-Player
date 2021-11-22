import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import GetUTC from '../Helpers/GetUTC';
import * as Types from "../Types";
import HorizontalScroller from "../Components/HorizontalScroller";

import "./Spotify.scss";
import VerticalSongs from '../Components/VerticalSongs';

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

class SpotifySearch extends Component {
	state: { Albums: Types.Album[], Songs: Types.Song[] } = { Albums: [], Songs: [] }

	LastSearch = 0;
	UpdateResults(Event: React.FormEvent<HTMLInputElement>, Callbacked?: boolean) {
		console.log("Updating!");
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
					Albums: Response.data.Albums.map((Data: Types.SpotifyAlbum): Types.Album => {
						return {
							Artist: Data.Artists[0]?.Name,
							Title: Data.Name,
							Songs: [],
							Cover: Data.Images[0]?.Url,
							Id: Data.Id
						};
					}),
					Songs: Response.data.Songs.map((Data: Types.SpotifySong): Types.Song => {
						return {
							Artist: Data.Artists[0]?.Name,
							Title: Data.Name,
							ImageData: Data.Images[1]?.Url,
							Id: Data.Id,
							Duration: Data.Duration || 60,
							ImageFormat: "",
							Identifier: "",
							Album: Data.Album,
							CoverIndex: "",
							AlbumId: "0",
							ExternalMedia: true,
							Features: Data.Artists.splice(1).map((Artist: any) => Artist.Name)
						};
					})
				});
				console.log(this.state.Songs);
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
			<HorizontalScroller Items={this.state.Albums} />
			<VerticalSongs OptionsCallback={(Index, Props) => {
				let Id = Props.Item.Id;
				window.API.get("/spotify/download", {
					params: {
						Id: Id,
						Path: "/home/deter/Music/Liked"
					}
				}) //TODO(deter): Change to POST
			}} Options={[
				{
					Icon: "download",
					Label: "Download"
				}
			]} Items={this.state.Songs} NoPages={true} />
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
			<p className="context-title-container">
				<span style={{ paddingLeft: 24, marginBottom: 24 }}>Slow Downloads? I can't do anything about that because it's on youtube's end.</span>
			</p>
			<SpotifyProfile />
			<button onClick={() => {
				window.API.get("/spotify/download-liked").then(Response => {
					console.log("downloading all liked songs");
				})
			}}>Download all like songs (ALL! be careful)</button>
			<SpotifySearch />
		</div>// : <Redirect to="/download/spotify-config?e=true" />
	}
}
