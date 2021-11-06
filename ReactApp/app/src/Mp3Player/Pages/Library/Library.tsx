import React, { Component } from 'react'
import { Route } from 'react-router'

import Liked from "./Liked";

export default class Library extends Component {
	render() {
		return (
			<Route path="/library/liked" component={Liked} />
		)
	}
}
