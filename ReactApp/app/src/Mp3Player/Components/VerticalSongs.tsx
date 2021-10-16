import React, { Component } from 'react'
import * as Types from "../Types";

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
	}

	render() {
		return (
			<div className="songs-container">

			</div>
		)
	}
}
