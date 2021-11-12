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
			<div className="page-padding">
				<img src={`http://localhost:${App.Port[0]}${this.state.Album?.Cover}`} alt="album-cover" />
				<h1>{this.state.Album?.Title}</h1>
				<VerticalSongs NoPages={true} Items={this.state.Album ? this.state.Album.Songs : []} />
			</div>
		)
	}
}
