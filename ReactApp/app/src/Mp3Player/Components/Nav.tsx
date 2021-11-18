import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Signal from '../Signal';

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
	state: { Path: string, Notifications: { [key: string]: number } } = { Path: "/", Notifications: {} };
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
		setInterval(() => {
			this.UpdatePath();
		}, 100);
		window.SetNotifications = (NotificationCount, Label) => {
			const Notifications = this.state.Notifications;
			Notifications[Label] = NotificationCount;
			this.setState({ Notifications: Notifications });
		}
	}
	render() {
		let Render = [];
		for (const Key in Paths) {
			Render.push(<h1>{Key}</h1>);
			Render.push(Paths[Key].map(Data => {
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
