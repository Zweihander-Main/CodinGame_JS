import config from '../config.js';
import EntityDirector from './EntityDirector.js';

class ItemDirector extends EntityDirector {
	constructor(gameInstance) {
		super(gameInstance);
		this.itemFreezeLatch = false;
		this.cooldown = 0;
	}

	turnStart() {
		super.turnStart();
	}

	turnOver() {
		super.turnOver();
		if (
			this.itemFreezeLatch &&
			this.itemFreezeLatch.item === config.RADAR
		) {
			this.itemFreezeLatch = false;
		}
	}

	requestAndTake(robot) {
		this.latch(robot);
	}

	requestRemotely(robot) {
		this.latch(robot);
	}

	shouldRequestOrTake(robot) {
		return (
			this.cooldown === 0 &&
			(this.itemFreezeLatch === false ||
				this.isLatchedByGivenRobot(robot))
		);
	}

	latch(robot) {
		this.itemFreezeLatch = robot;
	}

	isLatchedByGivenRobot(robot) {
		return this.itemFreezeLatch && this.itemFreezeLatch.id === robot.id;
	}

	updateCooldown(cooldown) {
		this.cooldown = cooldown;
	}
}

export default ItemDirector;
