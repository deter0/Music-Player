import React, { Component } from 'react'
import VerticalSongs from '../../Components/VerticalSongs';
import * as Types from "../../Types";

import "../Album.scss";

export default class Playlist extends Component {
	state: { Playlist?: Types.Playlist, FallbackAlbumCover: boolean } = { FallbackAlbumCover: false };
	constructor(props: {}) {
		super(props);

		let oldHref = document.location.href;
		const bodyList = document.querySelector("body") as HTMLBodyElement;
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (oldHref !== document.location.href) {
					oldHref = document.location.href;

					if (this.Mounted) {
						this.componentDidMount();
					}
				}
			});
		});

		const config = {
			childList: true,
			subtree: true
		};

		observer.observe(bodyList, config);
	}

	Mounted = false;
	componentWillUnmount() {
		this.Mounted = false;
	}

	componentDidMount() {
		this.Mounted = true;
		// Get playlist name from query params
		let Params = new URLSearchParams(window.location.search);
		let PlaylistName = Params.get('Name');
		if (PlaylistName) {
			window.API.get("/playlists", {
				params: {
					Name: PlaylistName
				}
			}).then(Response => {
				this.setState({ Playlist: Response.data as Types.Playlist }, () => {
					setTimeout(() => {
						if (this.state.Playlist) {
							const Seen = new Array<string>();
							const UniqueAlbums = this.state.Playlist.Songs.filter(Song => {
								if (Seen.indexOf(Song.AlbumId) === -1) {
									Seen.push(Song.AlbumId);
									return true;
								}
								return false;
							});
							if (UniqueAlbums.length < 3) {
								this.setState({ FallbackAlbumCover: true });
								return;
							}
							console.log(Seen);
							const Images = UniqueAlbums.map(Song => Song.ImageData);
							// let AllImages = this.state.Playlist.Songs.map(Song => Song.ImageData);
							const Canvas = this.Canvas.current;
							console.log(Canvas);
							if (Canvas) {
								if (!this.Context) {
									if (Canvas) {
										this.Context = Canvas.getContext("2d");
									}
								}
								const [CanvasWidth, CanvasHeight] = [Canvas.width, Canvas.height];
								let i = 0;
								for (const ImageUrl of Images) {
									console.log(`Putting ${ImageUrl}`);
									const ImageElement = new Image();
									ImageElement.src = `http://localhost:9091${ImageUrl}`;
									i++;
									let [x, y] = [0, 0];
									switch (i) {
										case (0):
											break;
										case (1):
											x = CanvasWidth / 2;
											break;
										case (3):
											y = CanvasHeight / 2;
											break;
										case (4):
											x = CanvasWidth / 2;
											y = CanvasHeight / 2;
									}
									ImageElement.onload = () => {
										this.Context?.drawImage(ImageElement, x, y, CanvasWidth / 2, CanvasHeight / 2);
									}
								}
								// this.Context?.drawImage()
								// this.Context?.clearRect();
							}
						}
					}, 16);
				});
			})
		}
	}
	Context: CanvasRenderingContext2D | null = null;
	Canvas = React.createRef<HTMLCanvasElement>();
	render() {
		return (
			<div className="page-padding-top">
				<div className="info-container">
					{this.state.FallbackAlbumCover ? <rect width={300} height={300} className='album-img-fallback album-img'><span className='material-icons'>queue_music</span></rect> :
						<canvas width={300} height={300} ref={this.Canvas} draggable={false} className="album-img" />
					}
					<div className="album-info">
						<h1 className="album-page-title">{this.state.Playlist?.Name}</h1>
						<h1 className="album-page-artist"><span className="material-icons">person</span>Made by you</h1>
						<span className="song-count">{this.state.Playlist?.Songs?.length} Songs</span>
						<div className="button-container">
							<button className="album-icon material-icons">delete_outline</button>
						</div>
					</div >
				</div>
				<VerticalSongs Items={this.state.Playlist ? this.state.Playlist.Songs : []} NoPages={true} />
			</div>
		)
	}
}
