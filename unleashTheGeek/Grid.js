import config from './config.js';
import Cell from './Pos/Cell.js';

class Grid {
	constructor() {
		this.cells = [];
		this.init();
	}

	init() {
		for (let y = 0; y < config.MAP_HEIGHT; y++) {
			for (let x = 0; x < config.MAP_WIDTH; x++) {
				let index = x + config.MAP_WIDTH * y;
				this.cells[index] = new Cell(
					'?',
					0,
					x,
					y,
					config.PROB_ORE[index]
				);
			}
		}
	}

	turnStart() {
		this.cells.forEach((cell) => {
			cell.turnStart();
		});
	}

	turnOver() {}

	getCell(x, y) {
		return this.cells[x + config.MAP_WIDTH * y];
	}

	getCellsWithinOneMove(center, includeCenter) {
		let returnArray = [];
		let x = center.x;
		let y = center.y;
		for (let i = 0, len = config.OPTIMIZED_DIAMOND.length; i < len; i++) {
			let newX = x + config.OPTIMIZED_DIAMOND[i].x;
			let newY = y + config.OPTIMIZED_DIAMOND[i].y;
			let newCell = this.getCell(newX, newY);
			if (newCell) {
				returnArray.push(newCell);
			}
		}
		if (includeCenter) {
			returnArray.push(center);
		}
		return returnArray;
	}

	filterOutCellsInHQ(cellArray) {
		return cellArray.filter((cell) => {
			return !cell.isInHQ();
		});
	}

	filterOutCellsNearMapEdge(cellArray, distance) {
		return cellArray.filter((cell) => {
			return (
				cell.x > distance &&
				cell.x < config.MAP_WIDTH - distance &&
				cell.y > distance &&
				cell.y < config.MAP_HEIGHT - distance
			);
		});
	}

	getCellsWithoutRadar() {
		return this.cells.filter((cell) => {
			return cell.ore === '?' && cell.x !== 0;
		});
	}

	get numCellsWithoutRadar() {
		return this.getCellsWithoutRadar().length;
	}
}

export default Grid;
