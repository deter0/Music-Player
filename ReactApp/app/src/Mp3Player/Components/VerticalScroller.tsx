import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import * as Types from "../Types";
import IsVisible from '../Helpers/IsVisible';

import "./VerticalScroller.scss";
import Signal from '../Signal';
import Vector2 from '../Helpers/Vector2';
import Lerp from '../Helpers/Lerp';

interface Props {
	Items?: Types.Album[],
	Url?: string
};
interface State {
	Items: Types.Album[]
};
export default class VerticalScroller extends Component<Props, State, {}> {
	state: State = {
		Items: []
	};
	Scroller = React.createRef<HTMLUListElement>()

	OnMouseDown = new Signal();
	constructor(props: Props) {
		super(props);
		if (props.Items) {
			this.ItemsConstructor();
		} else if (props.Url) {
			this.UrlConstructor();
		}

		let MouseLocation = new Vector2();
		document.addEventListener("mousemove", (Event) => {
			MouseLocation.x = Event.clientX;
			MouseLocation.y = Event.clientY;
		});
	}

	componentDidUpdate() {
		if (this.props.Url) {
			if (this.Scroller.current) {
				this.Scroller.current.onscroll = () => {
					console.log(this.Scroller.current?.getBoundingClientRect(), this.Scroller.current?.scrollLeft);
				}
			}
		}
	}

	ItemsConstructor() {
		this.LimitReached = true;
		this.setState({
			Items: this.props.Items as Types.Album[]
		});
	}

	UrlConstructor() {
		console.log("loading from url", this.props.Url);
		this.FetchMoreData(0, 25);
	}

	LimitReached = false;
	FetchMoreData(From: number, RequestSize: number) {
		if (this.LimitReached)
			return;
		window.API.get(this.props.Url as string, {
			params: {
				From: From,
				To: From + RequestSize
			}
		}).then((Response: AxiosResponse<Types.Album[]>) => {
			this.setState({
				Items: Response.data
			});
			if (Response.data.length <= 0) {
				this.LimitReached = true;
			}
		}).catch(error => {
			console.error('Error fetching url vertical scroller =>', error);
		});
	}

	render() {
		return (
			<ul ref={this.Scroller} className="vertical-scroller-container">
				{(this.state.Items).map((AlbumItem, index) => {
					return <Album OnMouseDown={this.OnMouseDown} key={index} Item={AlbumItem} />
				})}
			</ul>
		)
	}
}

interface AlbumProps {
	Item: Types.Album;
	OnMouseDown: Signal;
};
export class Album extends Component<AlbumProps> {
	state = {
		Image: ""
	};
	Image: React.RefObject<HTMLImageElement>;
	componentDidUpdate(OldProps: AlbumProps) {
		if (this.props.Item.Cover !== OldProps.Item.Cover) {
			this.setState({ Image: "" });
			this.WatchForLoad();
		}
	}
	constructor(props: AlbumProps) {
		super(props);
		this.Image = React.createRef<HTMLImageElement>();
		this.WatchForLoad();
	}
	Errored = false;
	WatchForLoad() {
		setTimeout(() => {
			if (this.Image.current && IsVisible(this.Image.current)) {
				this.LoadImage().catch(() => {
					this.Errored = true;
				});
			} else if (!this.Errored) {
				this.WatchForLoad();
			}
		}, 300);
	}
	LoadImage() {
		return new Promise<boolean>((Resolve, Reject) => {
			window.API.get(this.props.Item.Cover).then((Response: AxiosResponse<string>) => {
				this.setState({ Image: Response.data });
				Resolve(true);
			}).catch(error => {
				console.error("Error loading album picture =>", error);
				Reject(error);
			});
		})
	}
	render() {
		return <li onMouseDown={() => this.props.OnMouseDown.dispatch()} className="album">
			<img className="album-cover" ref={this.Image} src={this.state.Image} draggable={false} alt="" />
			<h1 className="album-title">{this.props.Item.Title}</h1>
			<h2 className="album-artist">{this.props.Item.Artist}</h2>
		</li>
	}
}