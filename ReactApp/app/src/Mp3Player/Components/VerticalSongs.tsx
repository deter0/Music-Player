import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import * as Types from "../Types";
import VerticalSong from "./VerticalSong";

interface Props {
	Items?: Types.Song[],
	Url?: string
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

	ItemsConstructor() {
		if (this.props.Items) {
			// eslint-disable-next-line react/no-direct-mutation-state
			this.state.Items = this.props.Items;
		}
	}

	Index = 0;
	Completed = false;
	UrlConstructor(Shift?: number) {
		if (this.props.Url && !this.Completed) {
			this.Index += (Shift || 0);
			window.API.get(this.props.Url, {
				params: {
					From: this.Index,
					To: this.Index + 25
				}
			}).then((Response: AxiosResponse<Types.Song[]>) => {
				this.setState({ Items: Response.data });
				this.Index += Response.data.length;
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
			this.UrlConstructor(-50);
		}
	}

	render() {
		return (
			<div className="songs-container">
				{
					this.state.Items.map((Item, Index) => {
						return <VerticalSong key={Index} Item={Item} Index={Index + this.Index} />
					})
				}
				<div className="songs-action">
					<button className="button-highlight" onClick={() => this.PreviousPage()}>Previous Page</button>
					<button className="button-highlight">Pages</button>
					<button className="button-highlight" onClick={() => this.NextPage()}>Next Page</button>
				</div>
			</div>
		)
	}
}
