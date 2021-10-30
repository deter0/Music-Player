import HorizontalScroller from "../Components/HorizontalScroller"
import React, { Component } from 'react'
import VerticalSongs from '../Components/VerticalSongs';
import * as Types from "../Types";

export default class Search extends Component {
	state: { Songs: Types.Song[], Albums: Types.Album[] } = { Songs: [], Albums: [] };
	OnInput(Event: React.FormEvent<HTMLInputElement>) {
		let Query = (Event.target as HTMLInputElement).value;
		window.API.post("/search/songs", undefined, {
			params: {
				Query: Query.trim()
			}
		}).then(Response => {
			if (Query === (Event.target as HTMLInputElement).value) {
				this.setState({ Songs: Response.data });
			}
		});
		window.API.post("/search/albums", undefined, {
			params: {
				Query: (Event.target as HTMLInputElement).value.trim()
			}
		}).then(Response => {
			if (Query === (Event.target as HTMLInputElement).value) {
				this.setState({ Albums: Response.data });
			}
		});
	}
	render() {
		return (
			<div className="page-padding">
				<h1>Search your music</h1>
				<div className="search"><input placeholder="Search..." onInput={(Event) => this.OnInput(Event)} /></div>
				<HorizontalScroller style={{ padding: 0 }} Items={this.state.Albums} />
				<VerticalSongs songStyle={{ marginLeft: -15, width: `calc(100% + 5px)` }} style={{ padding: 0 }} Items={this.state.Songs} />
			</div>
		)
	}
}
