import React, { Component } from 'react'
import * as Types from "../Types";
import "./Search2.scss";

enum ResultType {
	Song,
	Album,
	Page
}

class SearchResultsSongRenderer extends Component<{ Data: Types.Song[] }> {
	render() {
		return <div className='mini-songs-container'>
			{this.props.Data.slice(0, 6).map(Song => {
				return <div className='mini-song-container'>
					<img className="mini-song-cover" src={`http://localhost:9091${Song.ImageData}`} alt="album-cover" />
					<div className='mini-song-info'>
						<h1 className='mini-song-title'>{Song.Title}</h1>
						<h2 className='mini-song-artist'>{Song.Artist}</h2>
					</div>
				</div>
			})}
		</div>
	}
}

class SearchResult extends Component<{
	ResultType: ResultType,
	SongData?: Types.Song[],
	Title: string
}> {
	render() {
		return <div className='search-results-container'>
			<h1 className='search-results-title'>{this.props.Title}</h1>
			{(
				this.props.ResultType
				=== ResultType.Song
				&& this.props.SongData) &&
				<SearchResultsSongRenderer Data={this.props.SongData} />
			}
		</div>
	}
}

export default class Search2 extends Component {
	state: {
		Searching: boolean,
		SongResults: Types.Song[]
	} = {
			Searching: false,
			SongResults: []
		};
	componentDidMount() {
		window.Shortcuts.On("Search").connect((Event) => {
			this.setState({ Searching: !this.state.Searching });
		});
	}
	Search(Event: React.FormEvent<HTMLInputElement>) {
		const Query = (Event.target as HTMLInputElement).value.trim();
		if (Query !== "") {
			this.SearchSongs(Query);
		} else {
			this.setState({ SongResults: [] });
		}
	}
	private SearchSongs(Query: string) {
		window.API.post("/search/songs", undefined, {
			params: {
				Query: Query
			}
		}).then(Response => {
			this.setState({ SongResults: Response.data });
		})
	}
	render() {
		return <div className={`${this.state.Searching ? "" : "search2-invisible"} search2-container`}>
			<div className="search2-search-container search">
				<input onInput={(Event) => this.Search(Event)} id="search2-search search-page-search" placeholder="Search..." />
			</div>
			<SearchResult
				ResultType={ResultType.Song}
				SongData={this.state.SongResults}
				Title="Songs" />
			<SearchResult
				ResultType={ResultType.Page}
				Title="Links" />
			<SearchResult
				ResultType={ResultType.Album}
				Title="Album" />
		</div>
	}
}
