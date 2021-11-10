import React, { Component } from 'react'
import "./Error.scss";

export default class Error extends Component {
	state: {
		Err: boolean | null
	} = { Err: null }

	componentDidMount() {
		const Validate = () => {
			window.API.get("/online").then(Response => {
				this.setState({ Err: false });
			}).catch(Error => {
				this.setState({ Err: true })
			})
		}
		Validate();
		setInterval(() => {
			Validate();
		}, 10000);
	}
	render() {
		return this.state.Err ? (
			<div className="error-container">
				<h1>Something went wrong. Is the server running? Is the port correct at <code>ReactApp/app/Mp3Player/App.tsx : Line 19</code></h1>
			</div>
		) : <></>
	}
}
