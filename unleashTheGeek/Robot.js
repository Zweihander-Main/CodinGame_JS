import Entity from './Entity.js';

class Robot extends Entity {
	constructor(x, y, type, id, gameInstance) {
		super(x, y, type, id, gameInstance);
		this.commandToExecute = {};
		this.clearCommandToExecute();
		this.historyExecutedCommands = [];
	}

	turnStart() {}

	isDead() {
		return this.x === -1 && this.y === -1;
	}

	isInHQ() {
		return this.x === 0;
	}

	movesToCoverDistance(distance) {
		return Math.ceil(distance / 4);
	}

	setCommandToExecute(command, storedThis, ...argsArray) {
		this.commandToExecute = {
			command: command,
			storedThis: storedThis,
			params: argsArray,
		};
		this.historyExecutedCommands.push({
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

	get currentCell() {
		return this.gameInstance.grid.getCell(this.x, this.y);
	}
}

export default Robot;
