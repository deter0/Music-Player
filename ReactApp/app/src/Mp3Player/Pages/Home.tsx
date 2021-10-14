import React, { Component } from 'react'
import VerticalScroller from '../Components/VerticalScroller'

export default class Index extends Component {
	render() {
		return (
			<div>
				{/* <i className="ms-Icon ms-Icon--Installation" aria-hidden="true"></i> */}
				<p className="context-title-container"><span className="context-title">Context Title</span><span className="context-title-icon ms-Icon ms-Icon--Ringer" /></p>
				<VerticalScroller Url="/albums/range" />
				<div style={{ padding: "24px", display: 'flex', alignItems: "flex-start", rowGap: "14px", justifyContent: "flex-start", flexDirection: "column" }}>
					<button>Example button</button>
					<button className="button-highlight">Example button</button>

					<button className="notifications button-highlight" data-notifications="99+">Example notifications</button>
					<input placeholder="Input box!" />
					<div className="search">
						<input className="search" placeholder="Search..." />
					</div>
					<h1>List</h1>
					<div className="select">
						<button data-icon="" value="home">Home</button>
						<button data-icon="" value="search">Search</button>
						<button data-icon="" value="search" className="notifications" data-notifications="24">Notifications</button>
						<button data-icon="" value="settings" data-selected={true}>Settings</button>
					</div>
				</div>
			</div >
		)
	}
}
