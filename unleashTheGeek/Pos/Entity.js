import config from '../config.js';
import Pos from './Pos.js';

class Entity extends Pos {
	constructor(x, y, type, id) {
		super(x, y);
		this.updateCell(null); //this.currentCell
		const _id = id;
		const _type = type;

		this.getId = () => {
			return _id;
		};

		this.getType = () => {
			return _type;
		};
	}

	get id() {
		return this.getId();
	}

	get type() {
		return this.getType();
	}

	get radar() {
		return this.getType() === config.RADAR;
	}

	get trap() {
		return this.getType() === config.TRAP;
	}

	get none() {
		return this.getType() === config.NONE;
	}

	get myRobot() {
		return this.getType() === config.ROBOT_ALLY;
	}

	get enemyRobot() {
		return this.getType() === config.ROBOT_ENEMY;
	}

	updateCell(currentCell) {
		this.currentCell = currentCell;
	}
}

export default Entity;
