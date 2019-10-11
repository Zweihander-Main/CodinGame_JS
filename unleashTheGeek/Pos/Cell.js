import config from '../config.js';
import Pos from './Pos.js';

class Cell extends Pos {
	constructor(ore, hole, x, y, probOre) {
		super(x, y);
		this.update(ore, hole); //this.ore, this.hole
		this.myHole = false;
		this.radar = false;
		this.trap = false;
		// this.enemyRadar = false;
		// this.enemyTrap = false;
		this._oreGiven = 0;

		const startingProb = probOre;
		this.getStartingProb = () => {
			return startingProb;
		};

		this._moveLatchedArray = [];
		this._digLatchedArray = [];
	}

	get probOre() {
		return this.getStartingProb(); //TODO to expand
	}

	get enemyHole() {
		return this.hole === config.HOLE && !this.myHole;
	}

	get numMoveLatched() {
		return this._moveLatchedArray.length;
	}

	get numDigLatched() {
		return this._digLatchedArray.length;
	}

	get minedOre() {
		return this._oreMinedByMe + this._oreMinedByEnemy;
	}

	addMoveLatch(robot) {
		this._moveLatchedArray.push(robot);
	}

	addDigLatch(robot) {
		this._digLatchedArray.push(robot);
	}

	_dug(gaveOre) {
		if (gaveOre) {
			if (this.ore !== '?') {
				this.ore--;
			}
		} else {
			this.ore = 0;
		}
	}

	dugByMe(gaveOre) {
		this._dug(gaveOre);
		this._oreMinedByMe++;
	}

	dugByEnemy(gaveOre) {
		// TODO
		this._dug(gaveOre);
		this._oreMinedByEnemy++;
	}

	turnStart() {
		this._moveLatchedArray = [];
		this._digLatchedArray = [];
	}

	update(ore, hole) {
		// We may already know it's empty if we/enemy mined an unknown and got nothing
		if (this.ore !== 0) {
			this.ore = ore;
		}
		this.hole = hole;
	}
}

export default Cell;
