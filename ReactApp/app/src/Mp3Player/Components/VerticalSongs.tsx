import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import * as Types from "../Types";
import * as VerticalSong from "./VerticalSong";

const PAGE_SIZE = 12;

interface Props {
	Items?: Types.Song[],
	Url?: string,
	NoPages?: boolean;
	Options?: { Icon: string; Label: string }[];
	style?: { [index: string]: any };
	songStyle?: { [index: string]: any };
	OptionsCallback?: (Index: number, Props: VerticalSong.Props) => void;
}
export default class VerticalSongs extends Component<Props> {
	state: {
		Items: Types.Song[]
	} = {
			Items: []
		};
	constructor(Props: Props) {
		super(Props);
		if (this.props.Url) {
			this.UrlConstructor();
		} else if (this.props.Items) {
			this.ItemsConstructor();
		}
	}

	componentDidUpdate(OldProps: Props) {
		if (OldProps.Items !== this.props.Items) {
			this.setState({ Items: [] });
			setTimeout(() => {
				this.ItemsConstructor();
			}, 17);
		}
	}

	ItemsConstructor() {
		if (this.props.Items) {
			this.setState({ Items: this.props.Items });
		}
	}

	Index = 0;
	Completed = false;
	UrlConstructor(Shift?: number) {
		if (this.props.Url && !this.Completed) {
			this.Index += Shift || 0;
			window.API.get(this.props.Url, {
				params: {
					From: this.Index,
					To: this.Index + PAGE_SIZE
				}
			}).then((Response: AxiosResponse<Types.Song[]>) => {
				this.setState({ Items: (Response.data) });
				this.Index += Response.data.length;
				console.log(Response.data.length);
				if (Response.data.length <= 0) {
					this.Completed = true;
				}
			}).catch(error => {
				console.error(error);
			});
		}
	}

	// TODO(deter): Make it scroll to the top
	NextPage() {
		if (this.props.Url) {
			this.UrlConstructor();
		}
	}

	PreviousPage() {
		if (this.props.Url) {
			console.log(this.Index);
			this.Index -= PAGE_SIZE;
			this.Completed = false;
			this.UrlConstructor();
			console.log(this.Index);
		}
	}

	render() {
		return (
			<div style={this.props.style} className="songs-container">
				{
					this.state.Items.map((Item, Index) => {
						// eslint-disable-next-line react/jsx-pascal-case
						return <VerticalSong.default OptionsCallback={this.props.OptionsCallback} style={this.props.songStyle} Options={this.props.Options} key={Index} Item={Item} Index={Index + this.Index} />
					})
				}
				{
					!this.props.NoPages && <div className="songs-action">
						<button className="button-highlight" onClick={() => this.PreviousPage()}><span className="material-icons">arrow_back</span>Previous Page</button>
						<button className="button-highlight"><span className="material-icons">layers</span>Pages</button>
						<button className="button-highlight" onClick={() => this.NextPage()}>Next Page<span className="material-icons">arrow_forward</span></button>
					</div>
				}
			</div>
		)
	}
}
