import React, { Component } from 'react'
import "./Album.scss";
import * as Types from "../Types";
import * as App from "../App";
import VerticalSongs from '../Components/VerticalSongs';

export default class Album extends Component {
	state: {
		AlbumId: string,
		Album?: Types.Album
	} = {
			AlbumId: ""
		};
	componentDidMount() {
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
						<h1 className="album-title">{this.state.Album?.Title}</h1>
						<h1 className="album-artist"><span className="material-icons">person</span>{this.state.Album?.Artist}</h1>
						<div className="button-container">
							<button className="button-highlight">Add to library</button>
							<button>Delete</button>
						</div>
					</div >
				</div>
				<h1 className="songs-text">Songs</h1>
				<VerticalSongs style={{ paddingTop: 0 }} NoPages={true} Items={this.state.Album ? this.state.Album.Songs : []} />
			</div>
		)
	}
}
