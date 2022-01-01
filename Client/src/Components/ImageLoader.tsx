import React from "react";

import "./ImageSpinner.scss";

interface Props {
	className: string;
	ImageElement: JSX.Element,
	Loading: boolean
};
export default class ImageLoader extends React.Component<Props> {
	render() {
		return <div className={`spinner-outer ${this.props.className}`} style={{ zIndex: 100 }}>
			<div className={`${!this.props.Loading ? "spinner-done" : ""} spinner-inner`} />
			{this.props.ImageElement}
		</div>
	}
}