import config from './config.js';
import PlayerRobot from './PlayerRobot.js';
import Robot from './Robot.js';
import Entity from './Entity.js';

class EntityDirector {
	constructor(gameInstance) {
		this.gameInstance = gameInstance;
		this.reset();
	}

	reset() {
		this.entities = [];
	}

	getEntity(id) {
		return this.entities.find((entity) => {
			return entity.id === id;
		});
	}

	update(x, y, type, id, item) {
		let found = this.getEntity(id);
		if (found) {
			found.x = x;
			found.y = y;
			if (item) {
				found.item = item;
			}
		} else {
			let toPush;
			if (type === config.ROBOT_ALLY) {
				toPush = new PlayerRobot(
					x,
					y,
					type,
					id,
					item,
					this.gameInstance
				);
			} else if (type === config.ROBOT_ENEMY) {
				toPush = new Robot(x, y, type, id, this.gameInstance);
			} else {
				toPush = new Entity(x, y, type, id, this.gameInstance);
			}
			this.entities.push(toPush);
		}
	}

	get length() {
		return this.entities.length;
	}

	turnStart() {}

	turnOver() {}
}

export default EntityDirector;
