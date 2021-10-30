import React, { Component } from 'react'
import "./VerticalSong.scss";
import * as Types from "../Types";
import SecondsToHMS from '../Helpers/SecondsToHMS';
import * as LoadImage from "../Helpers/LoadImage";

// import DropDown from "./DropDown";

import "./VerticalSongs.scss";
import ImageLoader from './ImageLoader';
import DropDown from './DropDown';

interface Props {
	Item: Types.Song,
	Index: number;
	Options?: { Icon: string; Label: string }[];
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
	ImageId: number | undefined;
	async LoadImage(NewImage?: boolean) {
		let RequestedImage = this.props.Item.ImageData;
		if (this.props.Item && this.props.Item.ImageData && !this.props.Item.ImageData.startsWith("/")) {
			this.setState({ Image: this.props.Item.ImageData });
			return;
		}
		if (NewImage && this.ImageId) {
			LoadImage.ClearImage(this.ImageId);
			this.setState({ Image: "" });
		}
		if (this.props.Item.ImageData) {
			if (!this.ImageId) {
				this.ImageId = await LoadImage.default(this.props.Item.ImageData);
			}
			let ImageData = LoadImage.GetImageFromId(this.ImageId);
			if (ImageData) {
				if (this.props.Item.ImageData !== RequestedImage) {
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
	componentDidUpdate(OldProps: Props) {
		if (OldProps.Item.Identifier !== this.props.Item.Identifier) {
			this.LoadImage(true);
		}
	}
	componentDidMount() {
		this.WatchForLoad();
	}
	WatchForLoad() {
		if (this.state.ImageRef.current) { // TODO(deter): Make a more optimized loading with maybe `octree`s?
			this.LoadImage();
		}
	}
	componentWillUnmount() {
		this.setState({ Image: "" });
		if (this.ImageId)
			LoadImage.ClearImage(this.ImageId);
	}
	Like() {
		let PreviousState = this.state.Liked;
		window.API.post(`/songs/like`, {
			Id: this.props.Item.Id,
			Liked: !this.state.Liked
		}).then(Response => {
			console.log("Set liked");
		}).catch(error => {
			this.setState({ Liked: PreviousState });
			console.error(error);
		});
	}
	SelectedDropDownOption(Option: number) {
		switch (Option) {
			case (0):
				this.Like();
				this.setState({ Liked: !this.state.Liked })
				break;
		}
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
				{/* <button className="song-options material-icons">more_horiz</button> */}
				<DropDown className="song-options" style={{ padding: 0, border: "none" }} Label="" Icon="more_horiz" SelectedIndex={9999} Callback={(SelectedIndex) => this.SelectedDropDownOption(SelectedIndex)} Items={this.props.Options || [
					{
						Icon: this.state.Liked === false ? "favorite_border" : "favorite",
						Label: this.state.Liked === true ? "Unlike" : "Like",
					},
					{
						Icon: "play_arrow",
						Label: "Play",
					},
					{
						Icon: "queue",
						Label: "Add to queue",
					}
				]} />
			</div >
		)
	}
}
