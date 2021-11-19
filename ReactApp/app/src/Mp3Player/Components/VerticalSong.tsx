import React, { Component } from 'react'
import "./VerticalSong.scss";
import * as Types from "../Types";
import SecondsToHMS from '../Helpers/SecondsToHMS';
import * as App from "../App";

import { Link } from 'react-router-dom';

import "./VerticalSongs.scss";
import DropDown from './DropDown';
import { Redirect } from 'react-router';
import Vector2 from '../Helpers/Vector2';

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
		MouseFocus: false,
		Album: false,
		Deleted: false
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
			this.setState({ Liked: this.props.Item.Liked, Deleted: false });
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
				case (3):
					this.Like();
					this.setState({ Album: true });
					break;
				case (4):
					window.API.get(`/playlists`, {
						params: {
							From: 0,
							To: 5
						}
					}).then(Response => {
						if (!window.MouseLocation) {
							window.MouseLocation = new Vector2(0, 0);
						}
						window.CreateDropdown((Response.data as Types.Playlist[]).map((Playlist) => {
							return {
								Icon: "",
								Label: Playlist.Name
							}
						}), new Vector2(window.MouseLocation.y - 20, window.MouseLocation.x - 40), (Selected) => {
							console.log("SELECTED" + Selected);
							if ((Response.data as Types.Playlist[])[Selected]) {
								window.API.post(`/playlists/add-to-playlist`, {
									SongIdentifier: this.props.Item.Identifier,
									PlaylistName: (Response.data as Types.Playlist[])[Selected].Name
								}).then(Response => {
									console.log("Added to playlist");
								}).catch(error => {
									console.error(error);
								});
							}
						});
					});
					break;
				case (5):
					window.API.delete(`/songs/`, {
						params: {
							Identifier: this.props.Item.Identifier
						}
					}).then(Response => {
						if (Response.status === 200) {
							this.setState({ Deleted: true });
						}
					});
					break;
			}
		}
	}
	render() {
		return this.state.Deleted ? null : this.state.Album ? <Redirect to={`/album/${this.props.Item.AlbumId}`} /> : (
			<div
				onDoubleClick={() => window.PlaySong(this.props.Item)}
				onMouseEnter={() => this.setState({ MouseFocus: true })}
				onMouseLeave={() => this.setState({ MouseFocus: false })}
				className="song-container"
				style={this.props.style}
			>
				<img loading="lazy" draggable={false} className={`${this.state.MouseFocus && "song-image-hover"} song-image`} src={this.state.Image} alt="" />
				<h1 className="song-index">{this.props.Index + 1 < 10 ? `0${this.props.Index + 1}` : this.props.Index + 1}</h1>
				<button onClick={() => {
					this.Like();
					this.setState({ Liked: !this.state.Liked });
				}} className={`${this.state.Liked ? "song-liked" : ""} song-like material-icons`}>{this.state.Liked ? "favorite" : "favorite_border"}</button>
				<div className='song-div'>
					<h1 className="song-title">{this.props.Item.Title}</h1>
					<h1 className="song-album">{this.props.Item.Artist + this.props.Item.Features.map(Feature => `, ${Feature}`)}<Link to={`/album/${this.props.Item.AlbumId}`} className="song-artist-span">• {this.props.Item.Album}</Link></h1>
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
					},
					{
						Icon: "library_music",
						Label: "Go to Album"
					},
					{
						Icon: "bookmark_add",
						Label: "Add to Playlist"
					},
					{
						Icon: "delete_outline",
						Label: "Delete Song"
					}
				]} />
			</div >
		)
	}
}
