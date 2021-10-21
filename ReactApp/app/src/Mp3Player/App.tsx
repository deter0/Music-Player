import React, { Component } from 'react'
import { Router as BrowserRouter, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import Nav from "./Components/Nav";
import "./Styles/index.scss";
import Home from "./Pages/Home";

import Shortcuts from "./Shortcuts/Shortcuts";
import axios, { AxiosInstance } from 'axios';
import DropDowns from './Components/DropDowns';

const API = axios.create({
	baseURL: "http://192.168.2.12:8080/",
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
	constructor(props: any) {
		super(props);
		this.PageContainer = React.createRef();
	}
	render() {
		return (
			<BrowserRouter history={window.History}>
				{/* <Search /> */}
				<div className="playing-layout">
					<div className="layout">
						<DropDowns />
						<Nav />
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