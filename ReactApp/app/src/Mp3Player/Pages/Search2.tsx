import React, { Component } from 'react'
import * as Types from "../Types";
import "./Search2.scss";
import { AxiosResponse } from 'axios';

enum ResultType {
	Song,
	Album,
	Page
}

class SearchResultsSongRenderer extends Component<{ Data: Types.Song[] }> {
	private Download(Song: Types.Song) {
		// ! FIXME: Should be post
		window.API.get("/spotify/download", {
			params: {
				Id: Song.Id,
				Path: "~/Music"
			}
		});
	}
	render() {
		return <div className='mini-songs-container'>
			{this.props.Data.slice(0, 6).map(Song => {
				return <div className='mini-song-container'>
					<img draggable={false} className="mini-song-cover" src={Song.ImageData?.charAt(0) === "/" ? `http://localhost:9091${Song.ImageData}` : Song.ImageData} alt="album-cover" />
					<div className='mini-song-info'>
						<h1 className='mini-song-title'>{Song.Title}</h1>
						<h2 className='mini-song-artist'>{Song.Artist}</h2>
					</div>
					<div className='mini-right'>
						{Song.ImageData?.charAt(0) !== "/" ?
							<button onClick={(event) => {
								this.Download(Song);
								(event.target as HTMLButtonElement).disabled = true;
							}} className="mini-icon material-icons">download</button> : <></>}
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
		SongResults: Types.Song[],
		SpotifyResults: Types.Song[]
	} = {
			Searching: false,
			SongResults: [],
			SpotifyResults: []
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
			this.SearchSpotify(Query);
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
	private SearchSpotify(Query: string) {
		window.API.post("/spotify/search", {}, {
			params: {
				Query: Query.trim().substr(0, 200)
			}
		}).then(((Response: AxiosResponse<any>) => { // Typescript bug? Cant put type gives weird error
			this.setState({
				SpotifyResults: Response.data.Songs.map((Data: Types.SpotifySong): Types.Song => {
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
		})).catch(Error => {
			console.error(Error);
		})
	}
	render() {
		return <div className={`${this.state.Searching ? "" : "search2-invisible"} search2-container`}>
			<input onInput={(Event) => this.Search(Event)} className="search2-search-container" placeholder="Search..." />
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
			<SearchResult
				ResultType={ResultType.Song}
				SongData={this.state.SpotifyResults}
				Title="Spotify" />
		</div >
	}
}
