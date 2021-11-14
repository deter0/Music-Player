import React, { Component, Suspense } from 'react'
import { Router as BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";

import Nav from "./Components/Nav";
import "./Styles/index.scss";

import Shortcuts from "./Shortcuts/Shortcuts";
import axios, { AxiosInstance } from 'axios';
import DropDowns from './Components/DropDowns';
import Library from './Pages/Library/Library';

import Error from './Components/Error';
import Path from './Pages/Path';
import WS from './WS';

// import Download from './Pages/Download';
// import Search from './Pages/Search';
// import Player from './Pages/Player';
// import Album from './Pages/Album';
// import Home from "./Pages/Home";
const Download = React.lazy(() => import('./Pages/Download'));
const Search = React.lazy(() => import('./Pages/Search'));
const Player = React.lazy(() => import('./Pages/Player'));
const Album = React.lazy(() => import('./Pages/Album'));
const Home = React.lazy(() => import('./Pages/Home'));
const Settings = React.lazy(() => import('./Pages/Splash'));

export const Port = [9091];
const API = axios.create({
	baseURL: `http://localhost:${Port[0]}/`,
	timeout: 10000
});
const WSHandler = new WS(`ws://localhost:${Port[0] + 1}`);

const AppShortcuts = new Shortcuts();
declare global {
	interface Window {
		History: any; SetImage: (src: string) => void,
		Shortcuts: Shortcuts,
		API: AxiosInstance,
		WS: WS
	}
}
window.API = API;
window.Shortcuts = AppShortcuts;
window.History = createBrowserHistory();
window.WS = WSHandler;

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
			<Suspense fallback={<h1>Loading...</h1>}>
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
											<Switch>
												<Route component={Home} exact={true} path="/home" />
												<Route component={Download} exact={false} path="/download" />
												<Route component={Search} exact={false} path="/search" />
												<Route component={Library} exact={false} path="/library" />
												<Route component={Album} exact={false} path="/album" />
												<Route component={Settings} exact={false} path="/settings" />
											</Switch>
										</div>
									</div>
								</div>
							</div>
						</div>
						<Player />
					</>}
					<div id="hidden-links" className="hidden" />
				</BrowserRouter>
			</Suspense>
		)
	}
}