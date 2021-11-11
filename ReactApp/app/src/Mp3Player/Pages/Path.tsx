import React, { Component } from 'react'
import { Redirect } from 'react-router';
import "./Path.scss";

export default class Path extends Component {
	state = { Finished: false }
	render() {
		return this.state.Finished ? <Redirect to="/home" /> : (
			<div className="page-padding">
				<h1>Choose path</h1>
				<form onSubmit={(Event) => {
					Event.preventDefault();
					const Element = document.getElementById("path-selection") as HTMLInputElement;
					if (Element) {
						window.API.post("/", {}, {
							params: {
								Path: Element.value
							}
						}).then(Response => {
							this.setState({ Finished: true });
							setTimeout(() => {
								window.location.reload();
							}, 200); // A little delay to wait for server
						})
					}
				}}>
					<h3 style={{ fontWeight: 400, marginBottom: 24 }}>This is where your music will be located, any existing music will be also loaded.</h3>
					<input id="path-selection" style={{ marginRight: 12, marginBottom: 12, width: 600, maxWidth: "80vw" }} placeholder="Enter a path where your music should be..." />
					<button className="button-highlight">Submit</button>
				</form>
			</div>
		)
	}
}
