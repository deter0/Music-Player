import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Signal from '../Signal';

import "./Nav.scss";

const OnLinkClick = new Signal<number>();
interface Path { icon: string; to: string; label: string };
const Paths: Path[] = [
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
]
const Others: Path[] = [
	{
		icon: "settings",
		to: "/settings",
		label: "Settings"
	},
]
interface Props { Path: string; Data: Path };
class NavItem extends Component<Props> {
	render() {
		return (
			<Link onClick={() => OnLinkClick.dispatch(0)} className="nav-item" to={this.props.Data.to} data-active={this.props.Path === this.props.Data.to || undefined}>
				<span className="material-icons">
					{this.props.Data.icon}
				</span>
				<span className="nav-text">{this.props.Data.label}</span>
			</Link>
		)
	}
}

export default class Nav extends Component {
	state = { Path: "/" };
	UpdatePath() {
		let Location = window.location.pathname;
		this.setState({ Path: Location });
	}
	componentDidMount() {
		this.UpdatePath();
		OnLinkClick.connect(() => {
			setTimeout(() => {
				this.UpdatePath();
			}, 16);
		})
	}
	render() {
		return (
			<nav className="nav">
				{Paths.map((Data, index) => {
					return <NavItem key={index} Path={this.state.Path} Data={Data} />
				})}
				<h1>Other</h1>
				{Others.map((Data, index) => {
					return <NavItem key={index} Path={this.state.Path} Data={Data} />
				})}
			</nav>
		)
	}
}
