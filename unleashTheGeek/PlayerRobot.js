import Robot from './Robot.js';
import config from './config.js';

class PlayerRobot extends Robot {
	constructor(x, y, type, id, item, gameInstance) {
		super(x, y, type, id, gameInstance);
		this.item = item;
		this.destinationMemory = { x: x, y: y, message: '' };
		this.resetAnticipatedScore();
	}

	turnStart() {
		super.turnStart();
		if (
			this.historyExecutedCommands.length > 0 &&
			this.historyExecutedCommands[
				this.historyExecutedCommands.length - 1
			].command === this.consoleDig
		) {
			let currentCell = this.currentCell;
			if (this.item === config.ORE) {
				currentCell.hadOre = true;
				currentCell.oreGiven++;
			} else {
				currentCell.hadOre = false;
			}
		}
	}

	consoleMove(x, y, message = '') {
		this.destinationMemory.x = x;
		this.destinationMemory.y = y;
		this.destinationMemory.message = message;
		console.log(`MOVE ${x} ${y} ${message}`);
	}

	consoleWait(message = '') {
		console.log(`WAIT ${message}`);
	}

	consoleDig(x, y, message = '') {
		console.log(`DIG ${x} ${y} ${message}`);
	}

	consoleRequest(item, message = '') {
		if (item === config.RADAR) {
			console.log(`REQUEST RADAR ${message}`);
		} else if (item === config.TRAP) {
			console.log(`REQUEST TRAP ${message}`);
		} else {
			throw Error(`unrecognized item: ${item}`);
		}
	}

	get memArrived() {
		return (
			this.destinationMemory.x === this.x &&
			this.destinationMemory.y === this.y
		);
	}

	requestRadarRemotely() {
		this.gameInstance.myRadars.requestRemotely(this);
		return this.returnToHQ();
	}

	takeRadar(message) {
		this.gameInstance.myRadars.requestAndTake(this);
		return this.setCommandToExecute(
			this.consoleRequest,
			this,
			config.RADAR,
			message
		);
	}

	takeTrap(message) {
		this.gameInstance.myTraps.requestAndTake(this);
		return this.setCommandToExecute(
			this.consoleRequest,
			this,
			config.TRAP,
			message
		);
	}

	moveToCell(cell, message) {
		if (cell.x !== 0) {
			cell.moveLatched = true;
			cell.digLatched++;
		}
		return this.setCommandToExecute(
			this.consoleMove,
			this,
			cell.x,
			cell.y,
			message
		);
	}

	memMove() {
		let newCell = this.gameInstance.grid.getCell(
			this.destinationMemory.x,
			this.destinationMemory.y
		);
		if (this.destinationMemory.message.indexOf('|MEMx') !== -1) {
			let message = this.destinationMemory.message;
			let currentNum = parseInt(
				message.substring(message.indexOf('|MEMx') + 5),
				10
			);
			message =
				message.substring(0, message.indexOf('|MEMx') + 5) +
				(currentNum + 1);
			this.destinationMemory.message = message;
		} else {
			this.destinationMemory.message =
				this.destinationMemory.message + '|MEMx1';
		}
		return this.moveToCell(newCell, this.destinationMemory.message);
	}

	digCell(message) {
		this.resetAnticipatedScore();
		let newCell = this.gameInstance.grid.getCell(this.x, this.y);
		if (this.item === config.RADAR) {
			newCell.radar = true;
		} else if (this.item === config.TRAP) {
			newCell.trap = true;
		}
		newCell.moveLatched = true;
		newCell.digLatched++;
		newCell.myHole = true;
		return this.setCommandToExecute(
			this.consoleDig,
			this,
			this.x,
			this.y,
			message
		);
	}

	calculateScore(cell, moves, distance, radarLocScore) {
		let returnObject = {
			pos: 0,
			neg: 0,
			posReasons: [],
			negReasons: [],
		};
		const distanceToHQ = cell.distanceToHQ;
		const totalMoves = moves + this.movesToCoverDistance(distanceToHQ);
		if (cell.x === 0) {
			returnObject.neg += 1000;
			returnObject.negReasons.push('HQ');
		}
		if (cell.radar || cell.trap) {
			returnObject.neg += 1000;
			returnObject.negReasons.push('Item Present');
		}
		if (cell.ore === '?' && cell.moveLatched === true) {
			returnObject.neg += 100;
			returnObject.negReasons.push('Move Latched Cell');
		}
		if (cell.ore !== '?' && cell.digLatched >= cell.ore) {
			returnObject.neg += 100;
			returnObject.negReasons.push('Dig Latched Cell');
		}
		if (cell.hole === config.HOLE && cell.myHole !== true) {
			returnObject.neg += 100;
			returnObject.negReasons.push('Enemy Hole');
		}
		if (cell.hole === config.HOLE && cell.ore === '?') {
			returnObject.neg += 100;
			returnObject.negReasons.push('Already dug unknown hole'); //TODO track ore extracted
		}
		if (cell.ore === 0) {
			returnObject.neg += 100;
			returnObject.negReasons.push('Exhausted vein');
		}

		if (this.item === config.RADAR) {
			returnObject.pos += radarLocScore;
			returnObject.posReasons.push(
				`Radar placement score: ${radarLocScore}`
			);
		}
		if (cell.ore === '?') {
			returnObject.pos += cell.probOre / totalMoves;
			returnObject.posReasons.push(
				`%${cell.probOre} prob in ${totalMoves} totalMoves`
			);
		} else if (cell.ore > 0) {
			returnObject.pos += 100 / totalMoves;
			returnObject.posReasons.push(
				`${cell.ore} ore in ${totalMoves} totalMoves`
			);
		}
		returnObject.score = returnObject.pos - returnObject.neg;
		return returnObject;
	}

	buildValueGraph(pos) {
		let valueGraph = [];
		for (
			let i = 0, len = this.gameInstance.grid.cells.length;
			i < len;
			i++
		) {
			let valueGraphObject = {
				cell: this.gameInstance.grid.cells[i],
			};
			valueGraphObject.distance = valueGraphObject.cell.distance(pos);
			valueGraphObject.moves = this.movesToCoverDistance(
				valueGraphObject.distance
			);
			if (valueGraphObject.moves === 0) {
				valueGraphObject.moves = 1;
			}
			let radarLocScore;
			if (this.item === config.RADAR) {
				radarLocScore = this.gameInstance.myRadars.radarLocScore(
					valueGraphObject.cell
				);
			}
			valueGraphObject.scoreObject = this.calculateScore(
				valueGraphObject.cell,
				valueGraphObject.moves,
				valueGraphObject.distance,
				radarLocScore
			);
			valueGraph.push(valueGraphObject);
		}
		valueGraph.sort((a, b) => {
			return b.scoreObject.score - a.scoreObject.score;
		});
		console.error(
			`Pos ${pos.x},${pos.y} resulted in ${valueGraph[0].cell.x},${
				valueGraph[0].cell.y
			} with score of ${valueGraph[0].scoreObject.score}, ${
				valueGraph[0].moves
			} moves, (${valueGraph[0].scoreObject.posReasons.join(
				','
			)}) positive reasons (score: ${
				valueGraph[0].scoreObject.pos
			}), and (${valueGraph[0].scoreObject.negReasons.join(
				','
			)}) negative reasons (score: ${valueGraph[0].scoreObject.neg}).`
		);
		return valueGraph[0];
	}

	determineBestAction() {
		let currentCellScore = this.calculateScore(this.currentCell, 1, 0);
		if (currentCellScore.neg === this.anticipatedNegScore) {
			return this.digCell('DIG:BEST');
		} else {
			let bestCellData = this.buildValueGraph(this.currentCell);
			this.anticipatedNegScore = bestCellData.scoreObject.neg;
			return this.moveToCell(bestCellData.cell, 'MOVE:BEST');
		}
	}

	returnToHQ(message) {
		this.resetAnticipatedScore();
		return this.moveToCell({ x: 0, y: this.y }, message);
	}

	resetAnticipatedScore() {
		this.anticipatedNegScore = 10000;
	}

	declareDead() {
		return this.setCommandToExecute(this.consoleWait, this, 'DEAD');
	}
}

export default PlayerRobot;
