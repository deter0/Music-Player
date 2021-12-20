import React, { Component } from 'react'
import * as Types from "../Types";
import "./Search2.scss";
import { AxiosResponse } from 'axios';
import { Redirect } from 'react-router-dom';
import GetUTC from '../Helpers/GetUTC';
import HorizontalScroller from '../Components/HorizontalScroller';

enum ResultType {
	Song,
	Album,
	Page
}

class SearchResultsSongRenderer extends Component<{ Data: Types.Song[], Close: () => void }> {
	state: { Redirect?: string } = {};
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
		return this.state.Redirect ? <Redirect to={this.state.Redirect} /> : <div className='mini-songs-container'>
			{this.props.Data.slice(0, 6).map(Song => {
				return <button onClick={() => {
					if (Song.ImageData?.charAt(0) === "/") {
						this.setState({ Redirect: `/album/${Song.AlbumId}?song=${Song.Id}` });
						setTimeout(() => {
							this.setState({ Redirect: undefined });
						}, 50); // Weird ass fix
					}
					setTimeout(() => {
						this.props.Close();
					}, 50);
				}} className='mini-song-container'>
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
				</button>
			})}
		</div>
	}
}

class SearchResult extends Component<{
	ResultType: ResultType,
	SongData?: Types.Song[],
	AlbumData?: Types.Album[],
	Title: string,
	Close: () => void
}> {
	render() {
		return <div className='search-results-container'>
			<h1 className='search-results-title'>{this.props.Title}</h1>
			{(this.props.ResultType === ResultType.Song && this.props.SongData) &&
				<SearchResultsSongRenderer Close={this.props.Close} Data={this.props.SongData} />}
			{(this.props.ResultType === ResultType.Album && this.props.AlbumData && this.props.AlbumData.length > 0) &&
				<HorizontalScroller Items={this.props.AlbumData} />}
		</div>
	}
}

export default class Search2 extends Component {
	state: {
		Searching: boolean,
		SongResults: Types.Song[],
		SpotifyResults: Types.Song[],
		AlbumResults: Types.Album[]
	} = {
			Searching: false,
			SongResults: [],
			SpotifyResults: [],
			AlbumResults: []
		};
	componentDidMount() {
		window.Shortcuts.On("Quit").connect((Event) => {
			if (this.state.Searching) {
				this.setState({ Searching: false });
				Event.preventDefault();
			}
		})
		window.Shortcuts.On("Search").connect((Event) => {
			this.setState({ Searching: !this.state.Searching }, () => {
				if (this.state.Searching) {
					const Search2Input = document.getElementById("search2-input");
					if (Search2Input) {
						(Search2Input as HTMLInputElement).focus();
						Search2Input.parentElement?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
					}
				}
			});
		});
	}
	private LastSearch: number = 0;
	private ScheduledSearch?: string;
	private QueueSpotifySearch(Query: string) {
		if (GetUTC() - this.LastSearch < 1) {
			this.ScheduledSearch = Query;
			this.WatchForSearch();
		} else {
			this.SearchSpotify(Query);
			this.LastSearch = GetUTC();
		}
	}
	private WatchForSearch() {
		const QueryAtTimeOfCall = this.ScheduledSearch;
		if (QueryAtTimeOfCall) {
			setTimeout(() => {
				if (QueryAtTimeOfCall === this.ScheduledSearch) {
					this.SearchSpotify(this.ScheduledSearch);
					this.LastSearch = GetUTC();
				}
			}, 1000);
		}
	}
	Search(Event: React.FormEvent<HTMLInputElement>) {
		const Query = (Event.target as HTMLInputElement).value.trim();
		if (Query !== "") {
			this.SearchSongs(Query);
			this.QueueSpotifySearch(Query);
			this.SearchAlbums(Query);
		} else {
			this.setState({ SongResults: [], SpotifyResults: [], AlbumResults: [] });
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
	private SearchAlbums(Query: string) {
		window.API.post("/search/albums", undefined, {
			params: {
				Query: Query
			}
		}).then(Response => {
			console.log(Response.data);
			this.setState({
				AlbumResults: Response.data
			});
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
	private Close() {
		this.setState({ Searching: false });
	}
	render() {
		return <div className={`${this.state.Searching ? "" : "search2-invisible"} search2-container`}>
			<input id="search2-input" onInput={(Event) => this.Search(Event)} className="search2-search-container" placeholder="Search..." />
			<SearchResult
				Close={() => this.Close()}
				ResultType={ResultType.Song}
				SongData={this.state.SongResults}
				Title="Songs" />
			<SearchResult
				Close={() => this.Close()}
				ResultType={ResultType.Page}
				Title="Links" />
			<SearchResult
				Close={() => this.Close()}
				ResultType={ResultType.Album}
				AlbumData={this.state.AlbumResults}
				Title="Albums" />
			<SearchResult
				Close={() => this.Close()}
				ResultType={ResultType.Song}
				SongData={this.state.SpotifyResults}
				Title="Spotify" />
		</div >
	}
}
