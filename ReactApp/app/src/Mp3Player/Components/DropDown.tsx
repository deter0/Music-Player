import React, { Component } from 'react'

import "./DropDown.scss";

interface Props {
	style?: { [index: string]: any };
	Label: string,
	Items: { Icon: string, Text: string }[],
	SelectedIndex?: number
}
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
	constructor(Props: Props) {
		super(Props);
		if (this.props.SelectedIndex) {
			this.state.Selected = this.props.SelectedIndex;
		}
	}
	render() {
		return (
			<button
				className="dropdown"
				data-icon={this.state.Opened ? `expand_less` : `expand_more`}
				onMouseUp={() => this.setState({ Opened: !this.state.Opened })}
				onMouseEnter={() => this.setState({ Hovering: true })}
				onMouseLeave={() => this.setState({ Hovering: false })}
				style={this.props.style}>
				{this.props.Label}
				<div
					className={`${this.state.Opened === false ? "dropped-down-closed" : ""} dropped-down`}>
					{this.props.Items.map((Item, Index) => {
						return <button
							key={Index}
							onClick={() => this.setState({ Selected: Index })}
							onFocus={() => this.setState({ Opened: true })}
							onBlur={() => this.setState({ Opened: false })}
							className={`${Index === this.state.Selected ? "drop-down-option-selected" : ""} drop-down-option`}
							data-icon={Item.Icon}
						>
							{Item.Text}
						</button>
					})}
				</div>
			</button>
		)
	}
}
