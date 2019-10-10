import config from '../config.js';
import ItemDirector from './ItemDirector.js';

class MyRadars extends ItemDirector {
	constructor(gameInstance) {
		super(gameInstance);
		this.startingX = 3;
		this.startingY = 2;
		this.plusX = 3;
		this.plusY = 4;
	}

	turnStart() {
		super.turnStart();
	}

	turnOver() {
		super.turnOver();
	}

	requestAndTake(robot) {
		super.requestAndTake(robot);
	}

	shouldRequestOrTake(robot) {
		return (
			super.shouldRequestOrTake(robot) &&
			this.gameInstance.grid.numRadarLessCells >
				config.UNKNOWN_CELL_THRESHOLD
		);
	}

	radarLocScore(cell) {
		const singleMoveArray = this.gameInstance.grid.generateSingleMoveArray(
			cell,
			true,
			true,
			2
		); // counts inner cell, doesn't count hq, doesn't count map padding 2
		let score = 0;
		let scoreAdd = 100 / 41; //41 max tiles, 100 best score

		// Factors:
		// DONE: We don't know if it has ore = plus due to missing radar coverage
		// DONE: Our hole and didn't get ore = neg TODO track ore
		// DONE: Our hole and did get ore = plus (may be more, vein effect) TODO track ore
		// DONE: Ignoring enemy hole due to trap danger
		// DONE: Has ore -- neutral
		// DONE: Has no ore -- 2neg due to missing vein and radar coverage already present
		// DONE: Radar already there is bad
		singleMoveArray.forEach((cell) => {
			if (cell.ore === '?') {
				score += scoreAdd * 2;
			} else {
				score += -scoreAdd * 2;
			}

			if (cell.myHole) {
				if (cell.hadOre === false) {
					score += -scoreAdd;
				} else if (cell.hadOre === true) {
					score += scoreAdd;
				}
			}

			if (cell.radar) {
				score += -scoreAdd * 3;
			}
		});
		return score;
	}
}

export default MyRadars;
