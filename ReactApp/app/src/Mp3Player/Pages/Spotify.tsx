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
						Path: "~/Music"
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
				<svg style={{ width: '2rem', height: '2rem' }} className='spotify-svg' xmlns="http://www.w3.org/2000/svg" height="168px" width="168px" version="1.1" viewBox="0 0 168 168">
					<path fill="#1ED760" d="m83.996 0.277c-46.249 0-83.743 37.493-83.743 83.742 0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l0.001-0.004zm38.404 120.78c-1.5 2.46-4.72 3.24-7.18 1.73-19.662-12.01-44.414-14.73-73.564-8.07-2.809 0.64-5.609-1.12-6.249-3.93-0.643-2.81 1.11-5.61 3.926-6.25 31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-0.903-8.148-4.35-1.04-3.453 0.907-7.093 4.354-8.143 30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-0.001zm0.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219-1.254-4.14 1.08-8.513 5.221-9.771 29.581-8.98 78.756-7.245 109.83 11.202 3.73 2.209 4.95 7.016 2.74 10.733-2.2 3.722-7.02 4.949-10.73 2.739z" />
				</svg>
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
