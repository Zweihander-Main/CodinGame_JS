class Pos {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	distance(pos) {
		return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
	}
	get distanceToHQ() {
		return this.x;
	}
}

export default Pos;
