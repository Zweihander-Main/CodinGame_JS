import ItemDirector from './ItemDirector.js';

class MyTraps extends ItemDirector {
	constructor(gameInstance) {
		super(gameInstance);
	}

	turnStart() {
		super.turnStart();
	}

	turnOver() {
		super.turnOver();
	}

	shouldRequestOrTake(robot) {
		return super.shouldRequestOrTake(robot);
		// return false;
	}
}

export default MyTraps;
