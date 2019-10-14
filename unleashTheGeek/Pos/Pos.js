class Pos {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	get pretty() {
		return `(${this.x},${this.y})`;
	}

	get isInHQ() {
		return this.x === 0;
	}

	distance(pos) {
		return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
	}

	distanceToHQ() {
		return this.x;
	}
}

export default Pos;
