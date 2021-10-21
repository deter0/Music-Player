import { Component } from 'react'
import Vector2 from '../Helpers/Vector2';

import * as DropDowns from "./DropDowns";
import "./DropDown.scss";

interface Props {
	style?: { [index: string]: any };
	Label: string,
	Items: DropDowns.Item[],
	SelectedIndex?: number,
	IsNotSelectable?: boolean,
	Icon?: string,
	IconSize?: string,
	className?: string,
	Callback: DropDowns.Callback
}
let DropDownCount = 0;
export default class DropDown extends Component<Props> {
	state = {
		Opened: false,
		Hovering: false,
		Selected: 0,
		HoveringTrigger: false
	};
	componentDidMount() {
		document.addEventListener("mousedown", () => {
			if (!this.state.Hovering) {
				this.setState({ Opened: false });
			}
		})
	}
	Id: number;
	constructor(Props: Props) {
		super(Props);
		DropDownCount++;
		this.Id = DropDownCount;
		if (this.props.SelectedIndex) {
			this.state.Selected = this.props.SelectedIndex;
		}
	}
	render() {
		return (
			<button
				className={(this.props.className ? this.props.className + " " : "") + "dropdown"}
				data-icon={this.props.Icon || (this.state.Opened ? `expand_less` : `expand_more`)}
				data-icon-size={this.props.IconSize || `14px`}
				onClick={() => {
					let Element = document.getElementById(`dropdown-${this.Id}`);
					if (Element) {
						let Bounds = Element.getBoundingClientRect();
						window.CreateDropdown(this.props.Items, new Vector2(Bounds.top, Bounds.left), this.props.Callback, this.props.SelectedIndex);
					} else {
						alert("No element");
					}
				}}
				onMouseEnter={() => this.setState({ Hovering: true })}
				onMouseLeave={() => this.setState({ Hovering: false })}
				id={`dropdown-${this.Id}`}
				style={this.props.style}>
				{this.props.Label}
			</button>
		)
	}
}
