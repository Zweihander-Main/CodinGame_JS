import RobotDirector from './RobotDirector.js';
import EnemyRobot from '../Pos/EnemyRobot.js';

class EnemyRobots extends RobotDirector {
	constructor(game) {
		super(game);
	}

	turnStart() {
		super.turnStart();

		this.entities.forEach((robot) => {
			robot.turnStart();
		});
	}

	createNewEntity(x, y, type, id, item) {
		return new EnemyRobot(x, y, type, id, item, this);
	}
}

export default EnemyRobots;
