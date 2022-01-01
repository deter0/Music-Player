import React, { Component } from 'react'
import GetUTC from '../Helpers/GetUTC';

export default class Spash extends Component {
	componentDidMount() {
		const a = document.getElementById("a") as SVGPathElement | null;
		if (a) {
			setInterval(() => {
				const Values = [20, 20, 70, 60];
				setInterval(() => {
					Values.forEach((Value, Index) => {
						Values[Index] = Math.sin(GetUTC()) + 20;
					});
					//@ts-ignore
					a.setAttribute("d", `M 10,30
					 A ${Values[0]}, 20 0, 0, 1 50, 30
					 A 20, 20 0, 0, 1 90, 30
					 Q 90, 70 50, 90
					 Q 10, 60 10, 30 z`);
				})
			}, 15)
		}
	}
	render() {
		return (
			<div>
				<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<path id="a" fill="none" stroke="red"
						d="M 10,30
       A 20,20 0,0,1 50,30
       A 20,20 0,0,1 90,30
       Q 90,60 50,90
       Q 10,60 10,30 z" />
				</svg>
			</div>
		)
	}
}
