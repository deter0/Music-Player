import React, { Component } from 'react'
import { Route } from 'react-router';
import Playlist from './Playlist';
const Create = React.lazy(() => import('./CreatePlaylist'));

export default class PlaylistRouter extends Component {
	render() {
		return (
			<div>
				<Route component={Create} path="/playlists/create" />
				<Route component={Playlist} exact={false} path="/playlists/playlist" />
			</div>
		)
	}
}
