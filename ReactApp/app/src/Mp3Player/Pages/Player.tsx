import React, { Component } from 'react'
import "./Player.scss";
import * as Types from "../Types";
import * as App from "../App";
import * as AudioPlayer_ from "../AudioPlayer";
import SecondsToHMS from '../Helpers/SecondsToHMS';

declare global {
	interface Window {
		PlaySong: (Song: Types.Song) => (void)
	}
}

class Lyrics extends Component<{ Lyrics: string }> {
	render() {
		return (
			<div className="lyrics">
				<h1 dangerouslySetInnerHTML={{ __html: this.props.Lyrics.replace("\n", "<br/>").replace(/\\"/g, "\"") }} className="lyrics-text" />
			</div>
		)
	}
}

const AudioPlayer = new AudioPlayer_.default();
export default class Player extends Component {
	state: {
		Song?: Types.Song,
		Image: string,
		Percentage: number,
		AudioSrc: string,
		Paused: boolean,
		HoveringSeek: boolean,
		MouseX: number,
		Volume: number,
		Lyrics?: string,
		LyricsVisible: false,
		Repeat: boolean,
	} = {
			Image: "",
			Percentage: 0,
			AudioSrc: "",
			Paused: false,
			HoveringSeek: false,
			MouseX: 0,
			Volume: 1,
			LyricsVisible: false,
			Repeat: false
		};

	componentDidMount() {
		window.PlaySong = (Song) => {
			// const AudioSrc = `http://localhost:9091/songs/raw?Identifier=${Song.Identifier}`;
			// AudioPlayer.SetSrc(AudioSrc);
			AudioPlayer.PlaySong(Song);
			this.setState({ Song: Song }, () => {
				this.LoadImage();
				AudioPlayer.SetMetadata(Song);
			});
		}

		AudioPlayer.OnPause.connect((State) => {
			this.setState({
				Paused: State
			});
		})

		AudioPlayer.OnVolumeChange.connect((volume) => {
			this.setState({
				Volume: volume
			});
		});

		AudioPlayer.OnEnded.connect(() => {
			if (this.state.Repeat && this.state.Song) {
				AudioPlayer.Seek(0);
				AudioPlayer.PlaySong(this.state.Song);
			}
		});

		AudioPlayer.OnSongChange.connect((Song) => {
			this.setState({ Song: Song });
			this.LoadImage();

			window.API.get("/lyrics", {
				params: {
					Artist: Song.Artist,
					Title: Song.Title
				}
			}).then(Response => {
				this.setState({ Lyrics: Response.data });
			}).catch(error => {
				console.error(error);
				this.setState({ Lyrics: undefined, LyricsVisible: false });
			})
		});
		if (AudioPlayer.GetSong()) {
			this.setState({ Song: AudioPlayer.GetSong() });
			this.LoadImage();
		}
		this.setState({ Song: AudioPlayer.GetSong() });

		const OnUpdate = AudioPlayer.SubscribeOnTimeUpdate(250);
		OnUpdate.connect((Time) => {
			const Song = AudioPlayer.Audio;
			if (Song) {
				this.setState({ Percentage: Time / Song.duration * 100 });
			}
		});

		const Volume = localStorage.getItem("Volume");
		if (Volume) {
			AudioPlayer.Audio.volume = JSON.parse(Volume);
		}

		window.addEventListener("mouseup", () => {
			this.MouseUp = true;
		});

		window.addEventListener("keydown", (Event) => {
			if (Event.key.toLowerCase() === " ") {
				//@ts-ignore
				if (Event.target.tagName.toLowerCase() !== "input") {
					AudioPlayer.Pause();
					Event.preventDefault();
				}
			}
		});

		setInterval(() => {
			if (window.MouseLocation) {
				let Element = document.getElementById("player-outer-progress");
				let ProgressTracker = document.getElementById("progress-tracker");
				if (Element && ProgressTracker) {
					let Rect = Element.getBoundingClientRect();
					let Diff = window.MouseLocation.x - Rect.left;
					let TrackerWidth = ProgressTracker.getBoundingClientRect().width;
					ProgressTracker.innerText = SecondsToHMS(Math.floor(Diff / Rect.width * AudioPlayer.Audio.duration));
					Diff -= TrackerWidth / 2;
					ProgressTracker.style.left = `${Diff / Rect.width * 100}%`;
				}
			}
		}, 18)
	}


	MouseUp = false;
	OnMouseDown(Event: React.MouseEvent) {
		let Target = Event.target as HTMLDivElement;
		if (Target) {
			this.MouseUp = false;
			let Callback = () => {
				let MouseX = window.MouseLocation.x;
				let Rect = Target.getBoundingClientRect();
				let Offset = 1 - ((Rect.right - MouseX) / Rect.width);
				// if (this.Audio.current && this.Audio.current.duration) {
				this.setState({ Percentage: Offset * 100 });
				// }
				if (!this.MouseUp) {
					requestAnimationFrame(() => Callback());
				} else {
					const Time = AudioPlayer.Audio.duration * Offset;
					AudioPlayer.Seek(Time);
				}
			}
			requestAnimationFrame(() => Callback());
		}
	}

	async LoadImage(NewImage?: boolean) {
		if (this.state.Song)
			this.setState({
				Image: `http://localhost:${App.Port[0]}/songs/image?Identifier=${this.state.Song.Identifier}`
			});
	}

	componentDidUpdate() {
		if (AudioPlayer.GetSong() !== this.state.Song) {
			this.setState({ Song: AudioPlayer.GetSong() });
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

	OnVolumeMouseDown(Event: React.MouseEvent) {
		let Target = Event.target as HTMLDivElement;
		if (Target) {
			this.MouseUp = false;
			let Callback = () => {
				let MouseX = window.MouseLocation.x;
				let Rect = Target.getBoundingClientRect();
				let Offset = 1 - ((Rect.right - MouseX) / Rect.width);
				Offset = Offset > 1 ? 1 : (Offset < 0 ? 0 : Offset);
				AudioPlayer.Audio.volume = Offset;
				if (!this.MouseUp) {
					requestAnimationFrame(() => Callback());
				} else {
					localStorage.setItem("Volume", JSON.stringify(Offset));
				}
			}
			requestAnimationFrame(() => Callback());
		}
	}

	render() {
		return <>
			{(this.state.LyricsVisible && this.state.Lyrics) && <Lyrics Lyrics={this.state.Lyrics} />}
			<div className="player">
				<div
					id="progress-tracker"
					style={{ left: `${this.state.MouseX}%` }}
					className={`${!this.state.HoveringSeek ? "progress-tracker-inactive" : ""} progress-tracker`} >{SecondsToHMS(Math.round(AudioPlayer.Audio.currentTime))}</div>
				<div
					id="player-outer-progress"
					onMouseDown={(Event) => this.OnMouseDown(Event)}
					onMouseEnter={() => this.setState({ HoveringSeek: true })}
					onMouseLeave={() => this.setState({ HoveringSeek: false })}
					data-left={`${this.state.MouseX}%`}
					className={`${this.state.HoveringSeek ? "progress-outer-hover" : ""} progress-outer`}
				>
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
					<button onClick={() => this.setState({ Repeat: !this.state.Repeat })} className={`${this.state.Repeat ? "player-icon-active" : ""} player-icon-small player-icon material-icons`}>restart_alt</button>
					{this.state.Lyrics &&
						<button onClick={() => this.setState({ LyricsVisible: !this.state.LyricsVisible })} className="player-icon-small player-icon material-icons">format_quote</button>
					}
					<h2 className="player-icon-ex-small player-icon material-icons">volume_down</h2>
					<div className="slider-container">
						<div style={{ width: `${this.state.Volume * 100}%` }} className="slider-progress" />
						<div style={{ left: `calc(${this.state.Volume * 100}% - 5px)` }} className="slider-head" />
						<div
							className="slider-base"
							onMouseDown={(Event) => this.OnVolumeMouseDown(Event)}
							onMouseUp={() => null}
						/>
					</div>
					<h2 className="player-icon-ex-small player-icon material-icons">volume_up</h2>
					<button onClick={() => this.Like()} className={`${this.state.Song?.Liked ? "player-icon-color" : ""} player-icon-extra-small player-icon material-icons`}>{this.state.Song?.Liked ? "favorite" : "favorite_outline"}</button>
					<button className="player-icon-small player-icon material-icons">first_page</button>
					<button onClick={() => AudioPlayer.Pause()} className="player-icon material-icons">{(this.state.Paused) ? "play_arrow" : "pause"}</button>
					<button className="player-icon-small player-icon material-icons">last_page</button>
				</div>
				{/* <div className="player-section"></div> */}
			</div>
		</>
	}
}
