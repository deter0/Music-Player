import React, { Component } from 'react'
import "./VerticalSong.scss";
import * as Types from "../Types";
import SecondsToHMS from '../Helpers/SecondsToHMS';
import LoadImage from "../Helpers/LoadImage";

import DropDown from "./DropDown";

import "./VerticalSongs.scss";
import IsVisible from '../Helpers/IsVisible';

interface Props {
	Item: Types.Song,
	Index: number
};
export default class VerticalSong extends Component<Props> {
	state = {
		Image: "",
		Liked: false
	}
	Image = React.createRef<HTMLImageElement>();
	constructor(props: Props) {
		super(props);
		this.state.Liked = props.Item.Liked || false;
	}
	async LoadImage() {
		if (this.props.Item.ImageData) {
			this.setState({ Image: await LoadImage(this.props.Item.ImageData) });
		}
	}
	componentDidMount() {
		this.WatchForLoad();
	}
	WatchForLoad() {
		if (this.Image.current && IsVisible(this.Image.current)) {
			this.LoadImage();
		} else {
			setTimeout(() => {
				this.WatchForLoad();
			}, 200);
		}
	}
	Like() {
		window.API.post(`/songs/like`, {
			Id: this.props.Item.Id,
			Liked: !this.state.Liked
		}).then(Response => {
			console.log("Set liked");
		}).catch(error => {
			console.error(error);
		});
	}
	render() {
		return (
			<div className="song-container">
				<img ref={this.Image} draggable={false} className="song-image" src={this.state.Image} alt="" />
				<h1 className="song-index">{this.props.Index + 1 < 10 ? `0${this.props.Index + 1}` : this.props.Index + 1}</h1>
				<button onClick={() => {
					this.Like();
					this.setState({ Liked: !this.state.Liked });
				}} className={`${this.state.Liked ? "song-liked" : ""} song-like material-icons`}>{this.props.Item.Liked ? "favorite" : "favorite_border"}</button>
				<h1 className="song-title">{this.props.Item.Title}</h1>
				<h1 className="song-album">{this.props.Item.Album}</h1>
				<h1 className="song-duration">{SecondsToHMS(Math.round(this.props.Item.Duration))}</h1>
				<button className="song-options material-icons">more_horiz</button>
			</div >
		)
	}
}
