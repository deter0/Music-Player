import HorizontalScroller from "../Components/HorizontalScroller"
import React, { Component } from 'react'
import VerticalSongs from '../Components/VerticalSongs';
import * as Types from "../Types";

export default class Search extends Component {
	state: { Songs: Types.Song[], Albums: Types.Album[] } = { Songs: [], Albums: [] };
	OnInput(Event: React.FormEvent<HTMLInputElement>) {
		window.API.post("/search/songs", undefined, {
			params: {
				Query: (Event.target as HTMLInputElement).value.trim()
			}
		}).then(Response => {
			this.setState({ Songs: Response.data });
		});
		window.API.post("/search/albums", undefined, {
			params: {
				Query: (Event.target as HTMLInputElement).value.trim()
			}
		}).then(Response => {
			this.setState({ Albums: Response.data });
		});
	}
	render() {
		return (
			<div className="page-padding">
				<h1>Search your music</h1>
				<div className="search"><input placeholder="Search..." onInput={(Event) => this.OnInput(Event)} /></div>
				<HorizontalScroller Items={this.state.Albums} />
				<VerticalSongs Items={this.state.Songs} />
			</div>
		)
	}
}
