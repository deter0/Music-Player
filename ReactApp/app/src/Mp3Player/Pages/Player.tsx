import React, { Component } from 'react'
import "./Player.scss";
import * as Types from "../Types";
import * as LoadImage from "../Helpers/LoadImage";

declare global {
	interface Window {
		PlaySong: (Song: Types.Song) => (void)
	}
}

export default class Player extends Component {
	state: {
		Song?: Types.Song,
		Image: string,
		Percentage: number,
		AudioSrc: string,
		Paused: boolean
	} = {
			Image: "",
			Percentage: 0,
			AudioSrc: "",
			Paused: false
		};

	Audio = React.createRef<HTMLAudioElement>();
	componentDidMount() {
		window.PlaySong = (Song) => {
			this.setState({ Song: Song, AudioSrc: `http://192.168.2.12:8080/songs/raw?Identifier=${Song.Identifier}` });
			if (this.Audio.current) {
				try {
					this.Audio.current.play();
				} catch (error) {
					console.warn(error); // IOS Error for some reason, but it still works
				}
			}
			window.API.post("/playback", {
				Data: { Song: Song },
				Method: "Play"
			}).then(Response => {
				console.log("Set playback state");
			});
			this.LoadImage(true);
		}

		setInterval(() => {
			if (this.Audio.current) {
				let Percentage = this.Audio.current.currentTime / this.Audio.current.duration;
				this.setState({ Percentage: Percentage * 100 });
			}
		}, 500);

		window.addEventListener("mouseup", () => {
			this.MouseUp = true;
		});

		window.API.get("/playback").then((Response: any) => {
			const Song = Response.data.Song as Types.Song;
			if (!Song)
				return;
			const Callback = () => {
				if (this.Audio.current) {
					this.Audio.current.currentTime = Response.data.CurrentTime
					this.setState({ Song: Song, AudioSrc: `http://192.168.2.12:8080/songs/raw?Identifier=${Song.Identifier}` });
					this.Audio.current.play();
					this.Pause(true);
					this.LoadImage();
				} else {
					setTimeout(Callback, 200);
				}
			}
			Callback();
		})
	}

	MouseUp = false;
	OnMouseDown(Event: React.MouseEvent) {
		let Target = Event.target as HTMLDivElement;
		if (Target) {
			if (this.Audio.current) {
				this.MouseUp = false;
				let Callback = () => {
					if (this.Audio.current) {
						let MouseX = window.MouseLocation.x;
						let Rect = Target.getBoundingClientRect();
						let Offset = 1 - ((Rect.right - MouseX) / Rect.width);
						if (this.Audio.current && this.Audio.current.duration) {
							this.setState({ Percentage: Offset * 100 });
						}
						if (!this.MouseUp) {
							requestAnimationFrame(() => Callback());
						} else {
							this.Audio.current.currentTime = this.Audio.current.duration * Offset;
						}
					}
				}
				requestAnimationFrame(() => Callback());
			}
		}
	}

	ImageId?: number;
	async LoadImage(NewImage?: boolean) {
		if (!this.state.Song)
			return;
		let RequestedImage = this.state.Song.ImageData;
		if (this.state.Song && this.state.Song.ImageData && !this.state.Song.ImageData.startsWith("/")) {
			this.setState({ Image: this.state.Song.ImageData });
			return;
		}
		if (NewImage && this.ImageId) {
			LoadImage.ClearImage(this.ImageId);
			this.setState({ Image: "" });
		}
		if (this.state.Song.ImageData) {
			if (!this.ImageId) {
				this.ImageId = await LoadImage.default(this.state.Song.ImageData);
			}
			let ImageData = LoadImage.GetImageFromId(this.ImageId);
			if (ImageData) {
				if (this.state.Song.ImageData !== RequestedImage) {
					LoadImage.ClearImage(this.ImageId);
					console.log("Dropped late image");
					return;
				}
				this.setState({ Image: ImageData.Image });
				ImageData.OnUnload = () => {
					// this.setState({ Image: "" });
					this.state.Image = "";
				}
			} else {
				this.ImageId = undefined;
				this.LoadImage();
			}
		}
	}

	Seek(Event: React.MouseEvent) {
		let Target = Event.target as HTMLDivElement;
		if (Target) {
			let MouseX = window.MouseLocation.x;
			let Rect = Target.getBoundingClientRect();
			let Offset = 1 - ((Rect.right - MouseX) / Rect.width);
			if (this.Audio.current && this.Audio.current.duration) {
				this.Audio.current.currentTime = this.Audio.current.duration * Offset;
				this.setState({ Percentage: this.Audio.current.currentTime / this.Audio.current.duration * 100 });
			}
		}
	}

	Pause(Override?: boolean) {
		if (this.Audio.current) {
			if (Override || this.state.Paused) {
				this.Audio.current.play();
			} else {
				this.Audio.current.pause();
			}
			this.setState({ Paused: Override || this.Audio.current.paused });
			window.API.post("/playback", {
				Data: { Song: this.state.Song },
				Method: this.state.Paused ? "UnPause" : "Pause"
			}).then(Response => {
				console.log("Set playback state");
			});
		}
	}

	Like() {
		if (!this.state.Song)
			return;
		let PreviousState = this.state.Song.Liked;
		window.API.post(`/songs/like`, {
			Identifier: this.state.Song.Identifier,
			Liked: !this.state.Song.Liked
		}).then(Response => {
			console.log("Set liked");
		}).catch(error => {
			this.setState({ Liked: PreviousState });
			console.error(error);
		});
		let NewSong = this.state.Song;
		NewSong.Liked = !PreviousState;
		this.setState({ Song: NewSong });
	}

	render() {
		return (
			<div className="player">
				{/* @ts-ignore */}
				<audio crossOrigin="anonymous" src={this.state.AudioSrc} type="audio/x-m4a" ref={this.Audio} autoPlay={true}>
					<source src={this.state.AudioSrc} type="audio/x-m4a" />
				</audio>
				<div onMouseDown={(Event) => this.OnMouseDown(Event)} onClick={(Event) => this.Seek(Event)} className="progress-outer">
					<div
						style={{
							width: `${this.state.Percentage}%`
						}}
						className="progress-inner" />
				</div>
				<div className="player-info player-section">
					<img draggable={false} src={this.state.Image} className="player-song-image" alt="" />
					<div className="player-info-text">
						<h1 className="player-song-title">{this.state.Song?.Title}</h1>
						<h2 className="player-song-artist">{this.state.Song?.Artist}</h2>
					</div>
				</div>
				<div className="player-section">
					<button onClick={() => this.Like()} className={`${this.state.Song?.Liked ? "player-icon-color" : ""} player-icon-extra-small player-icon material-icons`}>{this.state.Song?.Liked ? "favorite" : "favorite_outline"}</button>
					<button className="player-icon-small player-icon material-icons">first_page</button>
					<button onClick={() => this.Pause()} className="player-icon material-icons">{(this.state.Paused || this.state.AudioSrc === "") ? "play_arrow" : "pause"}</button>
					<button className="player-icon-small player-icon material-icons">last_page</button>
				</div>
				{/* <div className="player-section"></div> */}
			</div>
		)
	}
}
