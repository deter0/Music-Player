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
					const PathElement = document.getElementById("path-selection") as HTMLInputElement;
					const PythonElement = document.getElementById("python-selection") as HTMLInputElement;

					if (PathElement && PythonElement) {
						window.API.post("/", {}, {
							params: {
								Path: PathElement.value,
								Python: PythonElement.value
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

					<h3 style={{ fontWeight: 400, marginBottom: 24 }}>How do you call Python in your os? For example linux is python3 but on windows it can be Python or python. To check simply run
						<code>$ Python -v</code> or
						<code>$ python -v</code> or
						<code>$ python3 -v</code> or
						And whichever one does something is the one you should input.
					</h3>
					<input id="python-selection" style={{ marginRight: 12, marginBottom: 12, width: 600, maxWidth: "80vw" }}
						placeholder="'Python', 'python', 'python3' or other..." />
					<button type="submit" className="button-highlight">Submit</button>
				</form>
			</div>
		)
	}
}
