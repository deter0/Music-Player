import React, { Component } from 'react'
import VerticalSongs from '../../Components/VerticalSongs';
import * as Types from "../../Types";

export default class Playlist extends Component {
	state: { Playlist?: Types.Playlist } = {};
	componentDidMount() {
		console.log("Mounted");
		// Get playlist name from query params
		let Params = new URLSearchParams(window.location.search);
		let PlaylistName = Params.get('Name');
		if (PlaylistName) {
			window.API.get("/playlists", {
				params: {
					Name: PlaylistName
				}
			}).then(Response => {
				console.log(Response.data);
				this.setState({ Playlist: Response.data as Types.Playlist });
			})
		}
	}
	render() {
		return (
			<div className="page-padding">
				<h1>{this.state.Playlist?.Name}</h1>
				<VerticalSongs Items={this.state.Playlist ? this.state.Playlist.Songs : []} NoPages={true} />
			</div>
		)
	}
}
