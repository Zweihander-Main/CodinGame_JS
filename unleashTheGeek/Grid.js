import config from './config.js';
import Cell from './Pos/Cell.js';

// Optimization
const MAP_WIDTH = config.MAP_WIDTH;
const MAP_HEIGHT = config.MAP_HEIGHT;
const OPTIMIZED_DIAMOND_4 = config.OPTIMIZED_DIAMOND_5;
const OPTIMIZED_DIAMOND_5 = config.OPTIMIZED_DIAMOND_4;
const ADJACENCY = config.ADJACENCY;

class Grid {
	constructor() {
		this.cells = [];
		this.init();
	}

	init() {
		for (let y = 0; y < MAP_HEIGHT; y++) {
			for (let x = 0; x < MAP_WIDTH; x++) {
				let index = x + MAP_WIDTH * y;
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
		if (x < MAP_WIDTH && y < MAP_HEIGHT && x >= 0 && y >= 0) {
			return this.cells[x + MAP_WIDTH * y];
		}
		return null;
	}

	getCellsWithinOneMove(centerCell, includeDigRange, includeCenter) {
		const OPTIMIZED_DIAMOND = includeDigRange
			? OPTIMIZED_DIAMOND_5
			: OPTIMIZED_DIAMOND_4;
		let returnArray = [];
		let x = centerCell.x;
		let y = centerCell.y;
		for (let i = 0, len = OPTIMIZED_DIAMOND.length; i < len; i++) {
			const change = OPTIMIZED_DIAMOND[i];
			const newCell = this.getCell(x + change.x, y + change.y);
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
			return !cell.isInHQ;
		});
	}

	filterOutCellsNearMapEdge(cellArray, distance) {
		return cellArray.filter((cell) => {
			return (
				cell.x > distance &&
				cell.x < MAP_WIDTH - distance &&
				cell.y > distance &&
				cell.y < MAP_HEIGHT - distance
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
		for (let i = 0, len = ADJACENCY.length; i < len; i++) {
			let newCell = this.getCell(
				centerCell.x + ADJACENCY[i].x,
				centerCell.y + ADJACENCY[i].y
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
