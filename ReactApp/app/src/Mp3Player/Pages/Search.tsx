import HorizontalScroller from "../Components/HorizontalScroller"
import React, { Component } from 'react'
import VerticalSongs from '../Components/VerticalSongs';
import * as Types from "../Types";

let CachedQuery = "";
export default class Search extends Component {
	state: { Songs: Types.Song[], Albums: Types.Album[] } = { Songs: [], Albums: [] };
	componentDidMount() {
		this.Search(CachedQuery);

		const Search = document.getElementById("search-page-search");
		if (Search) {
			(Search as HTMLInputElement).value = CachedQuery;
		}
	}
	OnInput(Event: React.FormEvent<HTMLInputElement>) {
		let Query = (Event.target as HTMLInputElement).value;
		this.Search(Query);
		CachedQuery = Query;
	}
	Search(Query: string) {
		window.API.post("/search/songs", undefined, {
			params: {
				Query: Query.trim()
			}
		}).then(Response => {
			this.setState({ Songs: Response.data });
		});
		window.API.post("/search/albums", undefined, {
			params: {
				Query: Query.trim()
			}
		}).then(Response => {
			this.setState({ Albums: Response.data });
		});
	}
	render() {
		return (
			<div className="page-padding">
				<h1>Search your music</h1>
				<div className="search"><input id="search-page-search" placeholder="Search..." onInput={(Event) => this.OnInput(Event)} /></div>
				<HorizontalScroller style={{ padding: 0 }} Items={this.state.Albums} />
				<VerticalSongs songStyle={{ marginLeft: -15, width: `calc(100% + 5px)` }} style={{ padding: 0 }} Items={this.state.Songs} />
			</div>
		)
	}
}
