import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Signal from '../Signal';
import * as Types from "../Types";

import "./Nav.scss";

const OnLinkClick = new Signal<number>();
interface Path { icon: string; to: string; label: string };
const Paths: { [key: string]: Path[] } = {
	"": [
		{
			icon: "home",
			to: "/home",
			label: "Home"
		},
		{
			icon: "search",
			to: "/search",
			label: "Search"
		},
		{
			icon: "file_download",
			to: "/download",
			label: "Download"
		}
	],
	"Library": [
		{
			icon: "favorite_outline",
			to: "/library/liked",
			label: "Liked"
		},
	],
	"Playlists": [
		{
			icon: "queue",
			to: "/playlists/create",
			label: "New Playlist"
		}
	],
	"Other": [
		{
			icon: "settings",
			to: "/settings",
			label: "Settings"
		}
	]
}
declare global {
	interface Window {
		SetNotifications: (Notifications: number, Label: string) => (void)
	}
}
interface Props { Path: string; Data: Path, Notifications?: number };
class NavItem extends Component<Props> {
	render() {
		return (
			<Link onClick={() => OnLinkClick.dispatch(0)} className="nav-item" to={this.props.Data.to} data-active={this.props.Path === this.props.Data.to || undefined}>
				<span className="material-icons">
					{this.props.Data.icon}
				</span>
				<span className={`nav-text ${(this.props.Notifications && this.props.Notifications > 0) ? "notifications" : ""}`} data-notifications={this.props.Notifications}>{this.props.Data.label}</span>
			</Link>
		)
	}
}

export default class Nav extends Component {
	state: {
		Path: string,
		Notifications: { [key: string]: number },
		Paths: typeof Paths
	} = { Path: "/", Notifications: {}, Paths: Paths };
	UpdatePath() {
		let Location = window.location.pathname;
		this.setState({ Path: Location });
	}
	componentDidMount() {
		this.UpdatePath();
		// OnLinkClick.connect(() => {
		// 	setTimeout(() => {
		// 		this.UpdatePath();
		// 	}, 16);
		// });
		const Create = Paths.Playlists[0];
		setInterval(() => {
			this.UpdatePath();
			window.WS.SendData<Types.Playlist[] | number>("Playlists", {
				From: 0,
				To: 5
			}).then(Data => {
				if (Data.Data) {
					if (typeof (Data.Data) !== "number") {
						const Paths = this.state.Paths;

						Paths.Playlists = [Create];
						Paths.Playlists = Paths.Playlists.concat(Data.Data.map(Data => {
							return {
								icon: "playlist_play",
								to: `/playlists/playlist?Name=${Data.Name}`,
								label: Data.Name
							}
						}));
						this.setState({ Paths: Paths });
					}
				}
			});
		}, 400);
		window.SetNotifications = (NotificationCount, Label) => {
			const Notifications = this.state.Notifications;
			Notifications[Label] = NotificationCount;
			this.setState({ Notifications: Notifications });
		}
	}
	render() {
		let Render = [];
		for (const Key in this.state.Paths) {
			Render.push(<h1>{Key}</h1>);
			Render.push(this.state.Paths[Key].map(Data => {
				return <NavItem Notifications={this.state.Notifications[Data.label]} Path={this.state.Path} Data={Data} />
			}));
		}
		return (
			<nav className="nav">
				{Render}
			</nav>
		)
	}
}
