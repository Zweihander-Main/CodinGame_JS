import config from '../config.js';
import Entity from './Entity.js';
import Pos from './Pos.js';

class Robot extends Entity {
	constructor(x, y, type, id, item, director) {
		super(x, y, type, id);
		this.director = director;
		this.itemHistory = [];
		this.locHistory = [];
		this.updateItem(item); // this._item
	}

	get hasRadar() {
		return this._item === config.RADAR;
	}

	get hasTrap() {
		return this._item === config.TRAP;
	}

	get hasRadarOrTrap() {
		return this.hasRadar || this.hasTrap;
	}

	get hasOre() {
		return this._item === config.ORE;
	}

	get hasItem() {
		return this._item !== config.NONE;
	}

	get itemLastTurn() {
		return this.itemHistory[this.itemHistory.length - 1];
	}

	get hadRadar() {
		return this.itemLastTurn === config.RADAR;
	}

	get hadTrap() {
		return this.itemLastTurn === config.TRAP;
	}

	get hadOre() {
		return this.itemLastTurn === config.ORE;
	}

	get hadItem() {
		return this.itemLastTurn !== config.NONE;
	}

	get lastDig() {
		if (this.locHistory.length > 1) {
			for (let i = this.locHistory.length - 1; i !== -1; i--) {
				if (
					this.locHistory[i + 1].x === this.locHistory[i].x &&
					this.locHistory[i + 1].y === this.locHistory[i].y
				) {
					return i;
				}
			}
		}
		return false;
	}

	get lastHQ() {
		if (this.locHistory.length > 1) {
			for (let i = this.locHistory.length - 1; i !== -1; i--) {
				if (this.locHistory[i + 1].x === 0) {
					return i;
				}
			}
		}
		return false;
	}

	updateItem(item) {
		this._item = item;
		this.itemHistory.push(item);
	}

	turnStart() {
		this.locHistory.push(new Pos(this.x, this.y));
	}

	isDead() {
		return this.x === -1 && this.y === -1;
	}

	movesToCoverDistance(distance, addInAdjacency) {
		distance = distance - (addInAdjacency ? 1 : 0);
		return Math.ceil(distance / config.AGENTS_MOVE_DISTANCE);
	}
}

export default Robot;
