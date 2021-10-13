export default class Vector2 {
	x: number = 0;
	y: number = 0;
	constructor(x?: number, y?: number) {
		this.x = x || 0;
		this.y = y || 0;
	}
	add(OtherVector: Vector2) {
		return new Vector2(this.x + OtherVector.x, this.y + OtherVector.y);
	}
	multiply(OtherVector: Vector2 | number) {
		if (typeof (OtherVector) === "number") {
			return new Vector2(this.x * OtherVector, this.y * OtherVector);
		} else {
			return new Vector2(this.x * OtherVector.x, this.y * OtherVector.y);
		}
	}
	divide(OtherVector: Vector2 | number) {
		if (typeof (OtherVector) === "number") {
			return new Vector2(this.x / OtherVector, this.y / OtherVector);
		} else {
			return new Vector2(this.x / OtherVector.x, this.y / OtherVector.y);
		}
	}
	negative() {
		return new Vector2(-this.x, -this.y);
	}
	subtract(OtherVector2: Vector2) {
		return this.add(OtherVector2.negative());
	}
	clone() {
		return new Vector2(this.x, this.y);
	}
	isWithinDistance(distance: number) {
		if (Math.pow(this.x, 2) + Math.pow(this.y, 2) <= Math.pow(distance, 2)) {
			return true;
		}
		return false;
	}
}