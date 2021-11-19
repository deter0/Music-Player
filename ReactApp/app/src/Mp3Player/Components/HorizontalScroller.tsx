import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import * as Types from "../Types";
import * as App from "../App";
import IsVisible from '../Helpers/IsVisible';

import "./HorizontalScroller.scss";
import Signal from '../Signal';
import Vector2 from '../Helpers/Vector2';
import GetUTC from '../Helpers/GetUTC';
import Lerp from '../Helpers/Lerp';
import ImageLoader from './ImageLoader';
import { Link } from 'react-router-dom';

interface Props {
	Items?: Types.Album[],
	Url?: string,
	style?: { [index: string]: any };
};
interface State {
	Items: Types.Album[];
};

declare global {
	interface Window {
		MouseLocation: Vector2
	}
}

let MouseLocation = new Vector2();
window.MouseLocation = MouseLocation;
window.addEventListener("mousemove", (Event) => {
	MouseLocation.x = Event.clientX;
	MouseLocation.y = Event.clientY;
});
let MouseUp = false;
window.addEventListener("mouseup", () => {
	MouseUp = true;
});

export default class HorizontalScroller extends Component<Props, State, {}> {
	state: State = {
		Items: []
	};
	Scroller = React.createRef<HTMLUListElement>()
	LastElement = React.createRef<HTMLDivElement>();
	OnMouseDown = new Signal<undefined>();
	constructor(props: Props) {
		super(props);
		if (props.Items) {
			this.ItemsConstructor();
		} else if (props.Url) {
			this.UrlConstructor();
		}

		this.OnMouseDown.connect((args) => {
			let X = MouseLocation.x;
			let Last = GetUTC();
			MouseUp = false;
			if (this.Scroller.current) {
				let Real = this.Scroller.current.scrollLeft;
				let Callback = () => {
					let DeltaTime = GetUTC() - Last;
					if (this.Scroller.current) {
						let Difference = X - MouseLocation.x;
						X = MouseLocation.x;

						Real += Difference;
						Real = Math.max(Real, 0);
						this.Scroller.current.scrollLeft =
							Lerp(
								this.Scroller.current.scrollLeft,
								Real,
								DeltaTime * 20
							);
						if (!MouseUp) {
							setTimeout(Callback, 16);
						} else {
							MouseUp = false;
						}
					}
					Last = GetUTC();
				}
				Callback();
			}
		});
	}

	componentDidUpdate(OldProps: Props) {
		if (OldProps.Items && (JSON.stringify(OldProps.Items) !== JSON.stringify(this.props.Items))) {
			this.setState({ Items: [] });

			setTimeout(() => {
				this.ItemsConstructor();
			}, 17);
		}
		if (this.Scroller.current) {
			this.Scroller.current.onscroll = () => {
				if (this.LastElement.current) {
					if (!this.FetchingData && !this.LimitReached && IsVisible(this.LastElement.current)) {
						this.FetchMoreData(this.Index, 25);
					}
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
		this.FetchMoreData(this.Index, 25);
	}
	Index = 0;

	LimitReached = false;
	FetchingData = false;
	FetchMoreData(From: number, RequestSize: number) {
		if (this.LimitReached)
			return;
		this.FetchingData = true;
		window.API.get(this.props.Url as string, {
			params: {
				From: From,
				To: From + RequestSize
			}
		}).then((Response: AxiosResponse<Types.Album[]>) => {
			this.setState({
				Items: this.state.Items.concat(Response.data)
			});
			if (Response.data.length <= 0) {
				this.LimitReached = true;
			} else {
				this.Index += Response.data.length;
			}
			this.FetchingData = false;
		}).catch(error => {
			console.error('Error fetching url vertical scroller =>', error);
			this.FetchingData = false;
		});
	}

	render() {
		let isTouchDevice = 'ontouchstart' in document.documentElement;
		return (
			<ul ref={this.Scroller} style={{ overflowX: isTouchDevice ? "auto" : "hidden", paddingBottom: isTouchDevice ? "8px" : "", ...this.props.style }} className="vertical-scroller-container">
				{(this.state.Items).map((AlbumItem, index) => {
					return <Album OnMouseDown={this.OnMouseDown} key={index} Item={AlbumItem} />
				})}
				<div ref={this.LastElement} id="last" />
			</ul>
		)
	}
}

interface AlbumProps {
	Item: Types.Album;
	OnMouseDown: Signal<undefined>;
};
export class Album extends Component<AlbumProps> {
	state = {
		Image: ""
	};
	componentDidUpdate(Props: AlbumProps) {
		if (Props.Item.Id !== this.props.Item.Id) {
			this.LoadImage();
		}
	}
	componentDidMount() {
		this.LoadImage();
	}
	Errored = false;
	async LoadImage() {
		if (this.props.Item.Songs[0])
			this.setState({ Image: `http://localhost:${App.Port[0]}/songs/image?Identifier=${this.props.Item.Songs[0].Identifier}` });
		else
			this.setState({ Image: this.props.Item.Cover })
	}
	render() {
		return <div onMouseDown={() => this.props.OnMouseDown.dispatch(undefined)} className="album">
			<ImageLoader className="album-cover" Loading={this.state.Image === ""} ImageElement={
				<img onDragStart={(Event) => Event.preventDefault()} loading="lazy" draggable={false} className="album-cover" src={this.state.Image} alt="" />
			} />
			<Link to={`/album/${this.props.Item.Id}`} className="album-title">{this.props.Item.Title}</Link>
			<h2 className="album-artist">{this.props.Item.Artist}</h2>
		</div>
	}
}