import config from '../config.js';
import EntityDirector from './EntityDirector';

class MyRobots extends EntityDirector {
	constructor(gameInstance) {
		super(gameInstance);
	}

	turnStart() {
		super.turnStart();

		this.entities.forEach((robot) => {
			if (robot.isDead()) {
				return robot.declareDead();
			}

			robot.turnStart();

			if (!robot.memArrived) {
				return robot.memMove();
			}

			if (robot.isInHQ() && robot.item === config.NONE) {
				if (
					this.gameInstance.myRadars.shouldRequestOrTake(robot, true)
				) {
					return robot.takeRadar('REQRADAR');
				}
				if (this.gameInstance.myTraps.shouldRequestOrTake(robot)) {
					return robot.takeTrap('REQTRAP');
				}
			}

			if (robot.item === config.ORE) {
				return robot.returnToHQ('HQ:ORE');
			}

			return robot.determineBestAction();
		});
	}

	turnOver() {
		super.turnOver();
		this.entities.forEach((robot) => {
			robot.clearCommandToExecute();
		});
	}

	get availableRobots() {
		return this.entities.filter((robot) => {
			return robot.commandToExecute.command === null;
		});
	}
}

export default MyRobots;
