import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import * as Types from "../Types";
import IsVisible from '../Helpers/IsVisible';

import "./VerticalScroller.scss";
import Signal from '../Signal';
import Vector2 from '../Helpers/Vector2';
import LoadImage from "../Helpers/LoadImage";
import GetUTC from '../Helpers/GetUTC';
import Lerp from '../Helpers/Lerp';
import Clamp from '../Helpers/Clamp';

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
	LastElement = React.createRef<HTMLDivElement>();
	OnMouseDown = new Signal<undefined>();
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
		let MouseUp = false;
		document.addEventListener("mouseup", () => {
			MouseUp = true;
		});
		this.OnMouseDown.connect((args) => {
			let X = MouseLocation.x;
			let Last = GetUTC();
			if (this.Scroller.current) {
				let Real = this.Scroller.current.scrollLeft;
				let Callback = () => {
					let DeltaTime = GetUTC() - Last;
					if (this.Scroller.current) {
						let Difference = X - MouseLocation.x;
						X = MouseLocation.x;

						Real += Difference;
						Real = Math.max(Real, 0);
						console.log(Real);
						this.Scroller.current.scrollLeft =
							Lerp(
								this.Scroller.current.scrollLeft,
								Real,
								DeltaTime * 20
							);
						if (!MouseUp) {
							requestAnimationFrame(() => Callback());
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

	componentDidUpdate() {
		if (this.props.Url) {
			if (this.Scroller.current) {
				this.Scroller.current.onscroll = () => {
					console.log(this.Scroller.current?.getBoundingClientRect(), this.Scroller.current?.scrollLeft);
				}
			}
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
		return (
			<ul ref={this.Scroller} className="vertical-scroller-container">
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
		if (this.Image.current && IsVisible(this.Image.current)) {
			this.LoadImage().catch(() => {
				this.Errored = true;
			});
		} else if (!this.Errored) {
			setTimeout(() => {
				this.WatchForLoad();
			}, 200);
		}
	}
	LoadImage() {
		return new Promise<boolean>(async (Resolve, Reject) => {
			LoadImage(this.props.Item.Cover).then(Response => {
				this.setState({
					Image: Response
				});
				Resolve(true);
			}).catch(Error => {
				this.Errored = true;
				Reject(Error);
			});
		})
	}
	render() {
		return <li onMouseDown={() => this.props.OnMouseDown.dispatch(undefined)} className="album">
			<img className="album-cover" ref={this.Image} src={this.state.Image} draggable={false} alt="" />
			<h1 className="album-title">{this.props.Item.Title}</h1>
			<h2 className="album-artist">{this.props.Item.Artist}</h2>
		</li>
	}
}