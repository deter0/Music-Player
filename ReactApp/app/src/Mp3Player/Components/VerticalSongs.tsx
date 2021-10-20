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
			if (this.Index + (Shift || 0) >= 0) {
				this.Index += (Shift || 0);
			}
			console.log(this.Index);
			window.API.get(this.props.Url, {
				params: {
					From: this.Index,
					To: this.Index + 900
				}
			}).then((Response: AxiosResponse<Types.Song[]>) => {
				this.setState({ Items: this.state.Items.concat(Response.data) });
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
					<button className="button-highlight" onClick={() => this.PreviousPage()}><span className="material-icons">arrow_back</span>Previous Page</button>
					<button className="button-highlight"><span className="material-icons">layers</span>Pages</button>
					<button className="button-highlight" onClick={() => this.NextPage()}>Next Page<span className="material-icons">arrow_forward</span></button>
				</div>
			</div>
		)
	}
}
