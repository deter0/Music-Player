import React, { Component } from 'react'
import VerticalSongs from '../../Components/VerticalSongs'

export default class Liked extends Component {
	render() {
		return (
			<div className="page-padding-top">
				<span className="context-title">Liked Songs</span>
				<VerticalSongs Url="/songs/liked" />
			</div>
		)
	}
}
