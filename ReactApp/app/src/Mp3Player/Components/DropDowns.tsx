import React, { Component } from 'react'
import Vector2 from '../Helpers/Vector2';
import "./DropDown.scss";

export interface Item {
	Label: string;
	Icon: string;
	// IconSize?: number;
}
export type Callback = (SelectedIndex: number) => void;
declare global {
	interface Window {
		CreateDropdown: (Items: Item[], Position: Vector2, Callback: Callback, SelectedIndex?: number) => (void);
	}
}

export default class DropDowns extends Component {
	state: { Items: { Items: Item[], Position: Vector2, Callback: Callback, SelectedIndex?: number }[] } = { Items: [] };
	componentDidMount() {
		window.CreateDropdown = (Items, Position, Callback: Callback, SelectedIndex) => {
			this.setState({
				Items: this.state.Items.concat({ Items: Items, Position: Position, Callback: Callback, SelectedIndex: SelectedIndex })
			})
		}
	}
	Remove = (Index: number, NewIndex: number) => {
		let Items = this.state.Items;
		if (Items[Index]) {
			Items[Index].Callback(NewIndex);
			Items.splice(Index, 1);
			this.setState({
				Items: Items
			});
		}
	}
	render() {
		return (
			<div style={{ pointerEvents: this.state.Items.length > 0 ? "all" : "none" }} className="seperate-layer">
				{this.state.Items.map((Items, Index) => {
					return <DropDown SelectedIndex={Items.SelectedIndex} Remove={this.Remove} Index={Index} key={Index} Items={Items.Items} Position={Items.Position} />
				})}
			</div>
		)
	}
}

interface Props {
	style?: { [index: string]: any };
	IsNotSelectable?: boolean;
	Items: Item[],
	SelectedIndex?: number,
	className?: string;
	Position: Vector2;
	Index: number;
	Remove: (Index: number, NewIndex: number) => void
}
export class DropDown extends Component<Props> {
	state = {
		Opened: true,
		Hovering: false,
		Selected: 0,
		HoveringTrigger: false,
		Position: new Vector2()
	};
	Ref = React.createRef<HTMLDivElement>();
	Mounted = false;
	componentDidMount() {
		this.Mounted = true;
		document.addEventListener("mousedown", () => {
			if (!this.state.Hovering && this.Mounted) {
				this.setState({ Opened: false });
				setTimeout(() => {
					this.props.Remove(this.props.Index, this.state.Selected);
				}, 200);
			}
		})
		this.FixPosition();
	}
	componentWillUnmount() {
		this.Mounted = false;
	}
	constructor(Props: Props) {
		super(Props);
		if (this.props.SelectedIndex) {
			this.state.Selected = this.props.SelectedIndex;
		}
		this.state.Position = this.props.Position;
	}
	componentDidUpdate() {
		if (!this.state.Opened) {
			if (this.state.Selected !== this.props.SelectedIndex) {
				this.Closed();
			}
		}
	}
	FixPosition() {
		if (this.Ref.current) {
			let Bounds = this.Ref.current.getBoundingClientRect();
			let ViewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
			let Right = Bounds.right;
			let Left = Bounds.left;
			if (Right > ViewportWidth) {
				this.setState({
					Position: new Vector2(this.state.Position.x, ViewportWidth - (Bounds.width * 1.2))
				});
			} else if (Left < 0) {
				this.setState({
					Position: new Vector2(this.state.Position.x, (Bounds.width * 1.2))
				});
			}
		}
	}
	Closed = () => {
		setTimeout(() => {
			this.props.Remove(this.props.Index, this.state.Selected);
		}, 200);
	}
	render() {
		return (
			<div
				style={{
					top: this.state.Position.x,
					left: this.state.Position.y
				}}
				className={`${this.state.Opened === false ? "dropped-down-closed" : ""} dropped-down`}
				ref={this.Ref}
			>
				{this.props.Items.map((Item, Index) => {
					return <button
						key={Index}
						onClick={() => {
							this.setState({ Selected: this.props.IsNotSelectable ? this.props.SelectedIndex : Index, Opened: false });
						}}
						onFocus={() => this.setState({ Opened: true })}
						onBlur={() => this.setState({ Opened: false })}
						className={`${Index === this.state.Selected ? "drop-down-option-selected" : ""} drop-down-option`}
						data-icon={Item.Icon}
					>
						{Item.Label}
					</button>
				})}
			</div>
		)
	}
}