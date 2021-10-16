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

	UrlConstructor() {
		if (this.props.Url) {
			window.API.get(this.props.Url, {
				params: {
					From: 0,
					To: 25
				}
			}).then((Response: AxiosResponse<Types.Song[]>) => {
				this.setState({ Items: Response.data });
			}).catch(error => {
				console.error(error);
			});
		}
	}

	render() {
		return (
			<div className="songs-container">
				{
					this.state.Items.map((Item, Index) => {
						return <VerticalSong key={Index} Item={Item} Index={Index} />
					})
				}
			</div>
		)
	}
}
