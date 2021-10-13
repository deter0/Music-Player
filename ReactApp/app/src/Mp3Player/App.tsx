import React, { Component } from 'react'
import { Router as BrowserRouter, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import "./Styles/index.scss";
import Home from "./Pages/Home";

import Shortcuts from "./Shortcuts/Shortcuts";
import axios, { AxiosInstance } from 'axios';

const API = axios.create({
	baseURL: "http://192.168.2.13:8080/",
	timeout: 10000
});

const AppShortcuts = new Shortcuts();
declare global {
	interface Window {
		History: any; SetImage: (src: string) => void,
		Shortcuts: Shortcuts,
		API: AxiosInstance
	}
}
window.API = API;
window.Shortcuts = AppShortcuts;
window.History = createBrowserHistory();

export default class App extends Component {
	PageContainer: React.RefObject<HTMLDivElement>;
	state = {
		src: "",
		oldSrc: "",
		back: false
	}
	constructor(props: any) {
		super(props);
		this.PageContainer = React.createRef();
	}
	render() {
		const frontImage = this.state.back ? this.state.oldSrc : this.state.src;
		const backImage = this.state.back ? this.state.src : this.state.oldSrc;

		return (
			<BrowserRouter history={window.History}>
				<img style={(this.state.back ? { opacity: 0, backgroundImage: `url(${frontImage})` } : { opacity: 1, backgroundImage: `url(${frontImage})` })} draggable={false} alt="" className="underlaying-image" />
				<img style={this.state.back ? { opacity: 1, backgroundImage: `url(${backImage})` } : { opacity: 0, backgroundImage: `url(${backImage})` }} draggable={false} alt="" className="underlaying-image" />
				{/* <Search /> */}
				<div className="playing-layout">
					<div className="layout">
						{/* <LeftBar /> */}
						<div ref={this.PageContainer} className="page-container">
							<div id="page-animation-container" className="page-animation-container">
								<Route component={Home} exact={true} path="/home" />
								{/* <Route component={Genres} path="/genres" />
								<Route component={Song} path="/song" /> */}
							</div>
						</div>
					</div>
					{/* <Player /> */}
				</div>
				<div id="hidden-links" className="hidden" />
			</BrowserRouter>
		)
	}
}
