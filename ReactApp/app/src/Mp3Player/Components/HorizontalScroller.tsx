import { AxiosResponse } from 'axios';
import React, { Component } from 'react'
import * as Types from "../Types";
import IsVisible from '../Helpers/IsVisible';

import "./HorizontalScroller.scss";
import Signal from '../Signal';
import Vector2 from '../Helpers/Vector2';
import * as LoadImage from "../Helpers/LoadImage";
import GetUTC from '../Helpers/GetUTC';
import Lerp from '../Helpers/Lerp';
import ImageLoader from './ImageLoader';

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
			MouseUp = false;
			if (this.Scroller.current) {
				let Real = this.Scroller.current.scrollLeft;
				let Callback = () => {
					let DeltaTime = GetUTC() - Last;
					console.log(DeltaTime);
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
		let isTouchDevice = 'ontouchstart' in document.documentElement;
		return (
			<ul ref={this.Scroller} style={{ overflowX: isTouchDevice ? "auto" : "hidden", paddingBottom: isTouchDevice ? "8px" : "" }} className="vertical-scroller-container">
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
	ImageId: number | undefined;
	async LoadImage(NewImage?: boolean) {
		if (NewImage && this.ImageId) {
			LoadImage.ClearImage(this.ImageId);
			this.setState({ Image: "" });
		}
		if (this.props.Item.Cover) {
			if (!this.ImageId) {
				this.ImageId = await LoadImage.default(this.props.Item.Cover);
			}
			let ImageData = LoadImage.GetImageFromId(this.ImageId);
			if (ImageData) {
				this.setState({ Image: ImageData.Image });
				ImageData.OnUnload = () => {
					// this.setState({ Image: "" });
					this.state.Image = "";
				}
			} else {
				this.ImageId = undefined;
				this.LoadImage();
			}
		}
	}
	componentWillUnmount() {
		if (this.ImageId) {
			LoadImage.ClearImage(this.ImageId);
			this.state.Image = "";
		}
	}
	render() {
		return <li onMouseDown={() => this.props.OnMouseDown.dispatch(undefined)} className="album">
			<ImageLoader className="album-cover" Loading={this.state.Image === ""} ImageElement={
				<img ref={this.Image} draggable={false} className="album-cover" src={this.state.Image} alt="" />
			} />
			<h1 className="album-title">{this.props.Item.Title}</h1>
			<h2 className="album-artist">{this.props.Item.Artist}</h2>
		</li>
	}
}