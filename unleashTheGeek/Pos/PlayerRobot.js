import Robot from './Robot.js';
import config from '../config.js';

class PlayerRobot extends Robot {
	constructor(x, y, type, id, item, director) {
		super(x, y, type, id, item, director);
		this.destinationMemory = { x: this.x, y: this.y, message: '' };
		this.resetAnticipatedScore();
		this.commandToExecute = {};
		this.clearCommandToExecute();
		this.commandHistory = [];
	}

	get memArrived() {
		return (
			this.destinationMemory.x === this.x &&
			this.destinationMemory.y === this.y
		);
	}

	turnStart() {
		super.turnStart();
		if (
			this.commandHistory.length > 0 &&
			this.commandHistory[this.commandHistory.length - 1].command ===
				this.consoleDig
		) {
			if (this.hasOre) {
				this.currentCell.dugByMe(true);
			} else {
				this.currentCell.dugByMe(false);
			}
		}
	}

	setCommandToExecute(command, storedThis, ...argsArray) {
		this.commandToExecute = {
			command: command,
			storedThis: storedThis,
			params: argsArray,
		};
		this.commandHistory.push({
			command: command,
			params: argsArray,
		});
	}

	executeCommand() {
		let boundFunc = this.commandToExecute.command.bind(
			this.commandToExecute.storedThis,
			...this.commandToExecute.params
		);
		return boundFunc();
	}

	clearCommandToExecute() {
		this.commandToExecute.command = null;
		this.commandToExecute.storedThis = null;
		this.commandToExecute.params = [];
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

	requestRadarRemotely() {
		this.director.requestItem(config.RADAR, 'remote', this);
		return this.returnToHQ();
	}

	takeRadar(message) {
		this.director.requestItem(config.RADAR, 'take', this);
		return this.setCommandToExecute(
			this.consoleRequest,
			this,
			config.RADAR,
			message
		);
	}

	takeTrap(message) {
		this.director.requestItem(config.TRAP, 'take', this);
		return this.setCommandToExecute(
			this.consoleRequest,
			this,
			config.TRAP,
			message
		);
	}

	moveToCell(cell, message) {
		if (cell.x !== 0) {
			cell.addMoveLatch(this);
			cell.addDigLatch(this);
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
		let newCell = this.director.getCell(
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
		let newCell = this.director.getCell(this.x, this.y);
		if (this.hasRadar) {
			newCell.radar = true;
		} else if (this.hasTrap) {
			newCell.trap = true;
		}
		newCell.addMoveLatch(this);
		newCell.addDigLatch(this);
		newCell.myHole = true;
		return this.setCommandToExecute(
			this.consoleDig,
			this,
			this.x,
			this.y,
			message
		);
	}

	returnToHQ(message) {
		this.resetAnticipatedScore();
		return this.moveToCell({ x: 0, y: this.y }, message);
	}

	resetAnticipatedScore() {
		this.anticipatedNegScore = Infinity;
	}

	declareDead() {
		return this.setCommandToExecute(this.consoleWait, this, 'DEAD');
	}
}

export default PlayerRobot;
