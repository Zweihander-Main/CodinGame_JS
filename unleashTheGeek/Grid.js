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
					config.PROB_ORE[index],
					this
				);
			}
		}
	}

	get numCellsWithoutRadar() {
		return this.getCellsWithoutRadar().length;
	}

	turnStart() {
		this.cells.forEach((cell) => {
			cell.turnStart();
		});
	}

	turnOver() {
		this.cells.forEach((cell) => {
			cell.turnOver();
		});
	}

	getCell(x, y) {
		if (x < config.MAP_WIDTH && y < config.MAP_HEIGHT && x >= 0 && y >= 0) {
			return this.cells[x + config.MAP_WIDTH * y];
		}
		return null;
	}

	getCellsWithinOneMove(centerCell, includeDigRange, includeCenter) {
		const OPTIMIZED_DIAMOND = includeDigRange
			? config.OPTIMIZED_DIAMOND_5
			: config.OPTIMIZED_DIAMOND_4;
		let returnArray = [];
		let x = centerCell.x;
		let y = centerCell.y;
		for (let i = 0, len = OPTIMIZED_DIAMOND.length; i < len; i++) {
			let newX = x + OPTIMIZED_DIAMOND[i].x;
			let newY = y + OPTIMIZED_DIAMOND[i].y;
			let newCell = this.getCell(newX, newY);
			if (newCell) {
				returnArray.push(newCell);
			}
		}
		if (includeCenter) {
			returnArray.push(centerCell);
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

	getCellsWithAdjacency(centerCell, includeCenter) {
		let returnArray = [];
		for (let i = 0, len = config.ADJACENCY.length; i < len; i++) {
			let newCell = this.getCell(
				centerCell.x + config.ADJACENCY[i].x,
				centerCell.y + config.ADJACENCY[i].y
			);
			if (newCell) {
				returnArray.push(newCell);
			}
		}
		if (includeCenter) {
			returnArray.push(centerCell);
		}
		return returnArray;
	}

	isCellWithinAdjacency(currentCell, destinationCell) {
		if (currentCell === destinationCell) {
			return true;
		}
		return this.getCellsWithAdjacency(currentCell).findIndex((cell) => {
			return cell === destinationCell;
		});
	}
}

export default Grid;
