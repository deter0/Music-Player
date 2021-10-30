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
			if (this.Audio.current) {
				this.Audio.current.play();
			}
			this.setState({ Song: Song, AudioSrc: `http://192.168.2.12:8080/songs/raw?Identifier=${Song.Identifier}` });
			this.LoadImage(true);
		}

		setInterval(() => {
			if (this.Audio.current) {
				let Percentage = this.Audio.current.currentTime / this.Audio.current.duration;
				this.setState({ Percentage: Percentage * 100 });
				console.log(Percentage);
			}
		}, 500);
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

	render() {
		return (
			<div className="player">
				<audio src={this.state.AudioSrc} ref={this.Audio} autoPlay={true} />
				<div className="progress-outer">
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
					<button className="player-icon-small player-icon material-icons">first_page</button>
					<button onClick={() => {
						if (this.Audio.current) {
							if (this.state.Paused) {
								this.Audio.current.play();
							} else {
								this.Audio.current.pause();
							}
							this.setState({ Paused: this.Audio.current.paused });
						}
					}} className="player-icon material-icons">{(this.state.Paused || this.state.AudioSrc === "") ? "play_arrow" : "pause"}</button>
					<button className="player-icon-small player-icon material-icons">last_page</button>
				</div>
				<div className="player-section"></div>
			</div>
		)
	}
}
