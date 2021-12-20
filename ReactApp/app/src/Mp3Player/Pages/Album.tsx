import React, { Component } from 'react'
import "./Album.scss";
import * as Types from "../Types";
import * as App from "../App";
import VerticalSongs from '../Components/VerticalSongs';

export default class Album extends Component {
	state: {
		AlbumId: string,
		Album?: Types.Album,
		HighlightedSongId?: string
	} = {
			AlbumId: ""
		};
	componentDidMount() {
		let Params = new URLSearchParams(window.location.search);
		let HighlightedSong = Params.get('song');
		if (HighlightedSong) {
			this.setState({ HighlightedSongId: HighlightedSong });
		}
		const Id = window.location.pathname.split("/")[2];
		this.setState({
			AlbumId: Id
		}, () => {
			window.API.get(`/albums/${Id}`).then(Response => {
				const Album = Response.data as Types.Album;
				this.setState({
					Album: Album
				});
				console.log(Album.Songs);
			});
		})
	}
	render() {
		return (
			<div className="page-padding-top">
				<div className="info-container">
					<img draggable={false} className="album-img" src={`http://localhost:${App.Port[0]}${this.state.Album?.Cover}`} alt="album-cover" />
					<div className="album-info">
						<h1 className="album-page-title">{this.state.Album?.Title}</h1>
						<h1 className="album-page-artist"><span className="material-icons">person</span>{this.state.Album?.Artist}</h1>
						<span className="song-count">{this.state.Album?.Songs.length} Songs</span>
						<div className="button-container">
							<button className="album-icon button-highlight material-icons">favorite_border</button>
							<button className="album-icon material-icons">delete_outline</button>
						</div>
					</div >
				</div>
				<h1 className="songs-text">Songs</h1>
				<VerticalSongs HighlightId={this.state.HighlightedSongId} style={{ paddingTop: 0 }} NoPages={true} Items={this.state.Album ? this.state.Album.Songs : []} />
			</div>
		)
	}
}
