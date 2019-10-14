import config from '../config.js';
import Pos from './Pos.js';

class Cell extends Pos {
	constructor(ore, hole, x, y, probOre, grid) {
		super(x, y);
		this._grid = grid;
		this.update(ore, hole); //this.ore, this.hole
		this.myHole = false;
		this._oreGiven = 0;
		this.radar = false;
		this.trap = false;
		this.enemyTrapChance = 0;
		this.wasJustMined = false;

		const startingProb = probOre;
		this.getStartingProb = () => {
			return startingProb;
		};

		this._digLatchedArray = [];
		this._entityArray = [];
	}

	get probOre() {
		return this.getStartingProb(); //TODO to expand
	}

	get enemyHole() {
		return this.hole && !this.myHole;
	}

	get numDigLatched() {
		return this._digLatchedArray.length;
	}

	get minedOre() {
		return this._oreMinedByMe + this._oreMinedByEnemy;
	}

	getEntityData(entity) {
		return this._entityArray.find((a) => {
			return entity === a;
		});
	}

	addEntityData(entity) {
		this._entityArray.push(entity);
	}

	removeEntityData(entity) {
		this._entityArray = this._entityArray.filter((a) => {
			return entity !== a;
		});
	}

	updateEntityData(entity) {
		if (!this.getEntityData(entity)) {
			this.addEntityData(entity);
		}
	}

	addDigLatch(robot) {
		if (robot.hasItem) {
			this._digLatchedArray = new Array(config.MAP_ORE_IN_CELL_MAX).fill(
				robot
			);
		} else {
			this._digLatchedArray.push(robot);
		}
	}

	removeDigLatch(robot) {
		this._digLatchedArray = this._digLatchedArray.filter((a) => {
			return robot.id !== a.id;
		});
	}

	isDigLatchedByGivenRobot(robot) {
		return this._digLatchedArray.includes(robot);
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

	aboutToBeDug() {
		this.myHole = true;
	}

	turnStart() {
		this._digLatchedArray = [];
	}

	turnOver() {
		this._entityArray = [];
	}

	update(ore, hole) {
		// We may already know it's empty if we/enemy mined an unknown and got nothing
		if (this.ore !== 0) {
			this.ore = ore;
		}
		if (this.hole !== (hole === config.HOLE)) {
			this.wasJustMined = true;
			this.hole = hole === config.HOLE ? true : false;
		} else {
			this.wasJustMined = false;
		}
	}
}

export default Cell;
