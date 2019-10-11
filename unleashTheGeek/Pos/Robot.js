import config from '../config.js';
import Entity from './Entity.js';
import Pos from './Pos.js';

class Robot extends Entity {
	constructor(x, y, type, id, item, director) {
		super(x, y, type, id);
		this.director = director;
		this.updateItem(item); // this._item
		this.locHistory = [];
		this.itemHistory = [];
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

	updateItem(item) {
		this._item = item;
	}

	turnStart() {
		this.locHistory.push(new Pos(this.x, this.y));
		this.itemHistory.push(this._item);
	}

	isDead() {
		return this.x === -1 && this.y === -1;
	}

	movesToCoverDistance(distance) {
		return Math.ceil(distance / config.AGENTS_MOVE_DISTANCE);
	}
}

export default Robot;
