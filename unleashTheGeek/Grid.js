import config from './config.js';
import Cell from './Pos/Cell.js';

class Grid {
	constructor() {
		this.cells = [];
	}

	init() {
		for (let y = 0; y < config.MAP_HEIGHT; y++) {
			for (let x = 0; x < config.MAP_WIDTH; x++) {
				let index = x + config.MAP_WIDTH * y;
				this.cells[index] = new Cell(
					0,
					0,
					x,
					y,
					config.PROB_ORE[index]
				);
			}
		}
	}

	turnStart() {}

	turnOver() {
		this.cells.forEach((cell) => {
			if (cell.moveLatched) {
				cell.moveLatched = false;
			}
			if (cell.oreLatched > 0) {
				cell.oreLatched = 0;
			}
		});
	}

	getCell(x, y) {
		if (x < config.MAP_WIDTH && y < config.MAP_HEIGHT && x >= 0 && y >= 0) {
			return this.cells[x + config.MAP_WIDTH * y];
		}
		return null;
	}

	generateSingleMoveArray(
		pos,
		countInnerCell,
		ignoreHQ = true,
		extraPadding = 0
	) {
		let returnArray = [];
		if (countInnerCell) {
			returnArray.push(pos);
		}
		let x = pos.x;
		let y = pos.y;
		for (let i = 0, len = config.OPTIMIZED_DIAMOND.length; i < len; i++) {
			let newX = x + config.OPTIMIZED_DIAMOND[i].x;
			let newY = y + config.OPTIMIZED_DIAMOND[i].y;
			let dropCell = false;
			if (ignoreHQ && newX === 0) {
				dropCell = true;
			}
			if (
				!(
					newX > extraPadding - 1 &&
					newX < config.MAP_WIDTH - extraPadding &&
					newY > extraPadding - 1 &&
					newY < config.MAP_HEIGHT - extraPadding
				)
			) {
				dropCell = true;
			}
			let newCell = this.cells[newX + config.MAP_WIDTH * newY];
			if (newCell && !dropCell) {
				returnArray.push(newCell);
			}
		}
		return returnArray;
	}

	get numCellsWithoutRadar() {
		return this.cells.filter((cell) => {
			return cell.ore === '?' && cell.x !== 0;
		}).length;
	}
}

export default Grid;
