import React, { Component } from 'react'
import "./VerticalSong.scss";
import * as Types from "../Types";
import SecondsToHMS from '../Helpers/SecondsToHMS';
import * as App from "../App";

// import DropDown from "./DropDown";

import "./VerticalSongs.scss";
import ImageLoader from './ImageLoader';
import DropDown from './DropDown';

export interface Props {
	Item: Types.Song,
	Index: number;
	Options?: { Icon: string; Label: string }[];
	style?: { [index: string]: any };
	OptionsCallback?: (Index: number, Props: Props) => void
};
export default class VerticalSong extends Component<Props> {
	state = {
		Image: "",
		Liked: false,
	}
	constructor(props: Props) {
		super(props);
		this.state.Liked = props.Item.Liked || false;
	}
	ImageId: number | undefined;
	async LoadImage() {
		if (!this.props.Item.ExternalMedia)
			this.setState({ Image: `http://localhost:${App.Port[0]}/songs/image?Identifier=${this.props.Item.Identifier}` });
		else
			this.setState({ Image: this.props.Item.ImageData });
	}
	componentDidUpdate(OldProps: Props) {
		if (OldProps.Item.Identifier !== this.props.Item.Identifier) {
			this.LoadImage();
		}
	}
	componentDidMount() {
		this.LoadImage();
	}
	Like_() {
		let PreviousState = this.state.Liked;
		window.API.post(`/songs/like`, {
			Identifier: this.props.Item.Identifier,
			Liked: !this.state.Liked
		}).then(Response => {
			console.log("Set liked");
			this.setState({ Liked: !PreviousState });
		}).catch(error => {
			this.setState({ Liked: PreviousState });
			console.error(error);
		});
	}
	Like() {
		let PreviousState = this.state.Liked;
		window.API.post(`/songs/like`, {
			Identifier: this.props.Item.Identifier,
			Liked: !this.state.Liked
		}).then(Response => {
			console.log("Set liked");
		}).catch(error => {
			this.setState({ Liked: PreviousState });
			console.error(error);
		});
	}
	SelectedDropDownOption(Option: number) {
		if (this.props.OptionsCallback)
			this.props.OptionsCallback(Option, this.props);
		else {
			switch (Option) {
				case (0):
					this.Like();
					this.setState({ Liked: !this.state.Liked })
					break;
				case (1):
					window.PlaySong(this.props.Item);
					break;
			}
		}
	}
	render() {
		return (
			<div className="song-container" style={this.props.style}>
				<ImageLoader className="song-image" Loading={this.state.Image === ""} ImageElement={
					<img loading="lazy" draggable={false} className="song-image" src={this.state.Image} alt="" />
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
