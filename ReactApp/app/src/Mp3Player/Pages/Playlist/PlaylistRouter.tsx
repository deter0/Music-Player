import React, { Component } from 'react'
import { Route } from 'react-router';
const Create = React.lazy(() => import('./CreatePlaylist'));

export default class PlaylistRouter extends Component {
	render() {
		return (
			<div>
				<Route component={Create} path="/playlist/create" />
			</div>
		)
	}
}
