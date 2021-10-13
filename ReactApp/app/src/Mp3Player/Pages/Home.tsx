import React, { Component } from 'react'
import VerticalScroller from '../Components/VerticalScroller'

export default class Index extends Component {
	render() {
		return (
			<div>
				Songs
				<VerticalScroller Url="/albums/range" />
			</div>
		)
	}
}
