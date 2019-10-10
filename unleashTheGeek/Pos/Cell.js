import Pos from './Pos.js';

class Cell extends Pos {
	constructor(ore, hole, x, y, probOre) {
		super(x, y);
		this.update(ore, hole);
		this.moveLatched = false;
		this.oreLatched = 0;
		this.myHole = false;
		this.probOre = probOre;
		this.hadOre = '?'; // true if yes, false if no, ? if unknown
		this.oreGiven = 0;
	}

	update(ore, hole) {
		this.ore = ore;
		this.hole = hole;
	}
}

export default Cell;
