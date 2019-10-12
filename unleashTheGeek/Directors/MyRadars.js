import config from '../config.js';
import ItemDirector from './ItemDirector.js';

class MyRadars extends ItemDirector {
	constructor(game) {
		super(game);
		this.startingX = 3;
		this.startingY = 2;
		this.plusX = 3;
		this.plusY = 4;
	}

	shouldRequestOrTake(robot) {
		return (
			super.shouldRequestOrTake(robot) &&
			this._game.grid.numCellsWithoutRadar > config.UNKNOWN_CELL_THRESHOLD
		);
	}

	radarLocScore(cell) {
		const cellsWithinOneMove = this._game.grid.filterOutCellsNearMapEdge(
			this._game.grid.getCellsWithinOneMove(cell, false, true),
			2
		); // Include center, filter out padding around map of 2
		let score = 0;
		let scoreAdd = 100 / 41; //41 max tiles, 100 best score
		cellsWithinOneMove.forEach((cell) => {
			if (cell.ore === '?') {
				score += scoreAdd * 2;
			} else {
				score += -scoreAdd * 2;
			}

			if (cell.myHole) {
				// TODO no need for myHole when tracking if enemy mined
				if (cell.minedOre === 0) {
					score += -scoreAdd;
				} else if (cell.minedOre > 0) {
					score += scoreAdd;
				}
			}

			if (cell.radar) {
				score += -scoreAdd * 3;
			}
		});
		if (score < 0) {
			score = 0;
		}
		return score;
	}
}

export default MyRadars;

// Factors for radarLocScore:
// We don't know if it has ore = plus due to missing radar coverage
// Our hole and didn't get ore = neg TODO track ore
// Our hole and did get ore = plus (may be more, vein effect) TODO track ore
// Ignoring enemy hole due to trap danger
// Has ore -- neutral
// Has no ore -- 2neg due to missing vein and radar coverage already present
// Radar already there is bad
