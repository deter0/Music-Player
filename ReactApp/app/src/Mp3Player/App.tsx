import React, { Component } from 'react'
import { Router as BrowserRouter, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";

import Nav from "./Components/Nav";
import "./Styles/index.scss";
import Home from "./Pages/Home";

import Shortcuts from "./Shortcuts/Shortcuts";
import axios, { AxiosInstance } from 'axios';
import DropDowns from './Components/DropDowns';
import Download from './Pages/Download';
import Search from './Pages/Search';
import Player from './Pages/Player';
import Library from './Pages/Library/Library';

import Error from './Components/Error';
import Path from './Pages/Path';

export const Port = [9091];
const API = axios.create({
	baseURL: `http://localhost:${Port[0]}/`,
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
	state = { SetPath: false }
	PageContainer: React.RefObject<HTMLDivElement>;
	constructor(props: any) {
		super(props);
		this.PageContainer = React.createRef();
	}
	componentDidMount() {
		window.API.get("/path").then(Response => {
			if (Response.data === false) {
				this.setState({ SetPath: true });
			}
		});
	}
	render() {
		return (
			<BrowserRouter history={window.History}>
				<Route component={Path} exact={true} path="/path" />
				{this.state.SetPath ? <Redirect to="/path" /> : <>
					{/* <Search /> */}
					<Error />
					<div className="player-layout">
						<div className="playing-layout">
							<div className="layout">
								<DropDowns />
								<Nav />
								<div ref={this.PageContainer} className="page-container">
									<div id="page-animation-container" className="page-animation-container">
										<Route component={Home} exact={true} path="/home" />
										<Route component={Download} exact={false} path="/download" />
										<Route component={Search} exact={false} path="/search" />
										<Route component={Library} exact={false} path="/library" />
									</div>
								</div>
							</div>
						</div>
					</div>
					<Player />
				</>}
				<div id="hidden-links" className="hidden" />
			</BrowserRouter>
		)
	}
}