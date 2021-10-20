import React, { Component } from 'react'
import "./VerticalSong.scss";
import * as Types from "../Types";
import SecondsToHMS from '../Helpers/SecondsToHMS';
import LoadImage from "../Helpers/LoadImage";

// import DropDown from "./DropDown";

import "./VerticalSongs.scss";
import IsVisible from '../Helpers/IsVisible';
import ImageLoader from './ImageLoader';

interface Props {
	Item: Types.Song,
	Index: number
};
export default class VerticalSong extends Component<Props> {
	state = {
		Image: "",
		Liked: false,
		ImageRef: React.createRef<HTMLImageElement>()
	}
	constructor(props: Props) {
		super(props);
		this.state.Liked = props.Item.Liked || false;
	}
	async LoadImage() {
		if (this.props.Item.ImageData) {
			this.setState({ Image: await LoadImage(this.props.Item.ImageData) });
		}
	}
	componentDidUpdate(OldProps: Props) {
		if (OldProps.Item.ImageData !== this.props.Item.ImageData) {
			if (this.state.Image !== "") {
				this.setState({ Image: "" });
				this.LoadImage();
			}
		}
	}
	componentDidMount() {
		this.WatchForLoad();
	}
	WatchForLoad() {
		if (this.state.ImageRef.current) { // TODO(deter): Make a more optimized loading with maybe `octree`s?
			// this.LoadImage();
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
				<ImageLoader className="song-image" Loading={this.state.Image === ""} ImageElement={
					<img ref={this.state.ImageRef} draggable={false} className="song-image" src={this.state.Image} alt="" />
				} />
				<h1 className="song-index">{this.props.Index + 1 < 10 ? `0${this.props.Index + 1}` : this.props.Index + 1}</h1>
				<button onClick={() => {
					this.Like();
					this.setState({ Liked: !this.state.Liked });
				}} className={`${this.state.Liked ? "song-liked" : ""} song-like material-icons`}>{this.state.Liked ? "favorite" : "favorite_border"}</button>
				<div className='song-div'>
					<h1 className="song-title">{this.props.Item.Title}</h1>
					<h1 className="song-album">{this.props.Item.Artist}<span className="song-artist-span">• {this.props.Item.Album}</span></h1>
				</div>
				<h1 className="song-duration">{SecondsToHMS(Math.round(this.props.Item.Duration))}</h1>
				<button className="song-options material-icons">more_horiz</button>
			</div >
		)
	}
}
