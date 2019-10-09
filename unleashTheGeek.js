const [MAP_WIDTH, MAP_HEIGHT] = readline()
	.split(' ')
	.map((a) => {
		return parseInt(a, 10);
	});

const NONE = -1;
const ROBOT_ALLY = 0;
const ROBOT_ENEMY = 1;
const HOLE = 1;
const RADAR = 2;
const TRAP = 3;
const ORE = 4;

// tuning
const EXTRA_RADARS = 0;
// prettier-ignore
const PROB_ORE = [0,0,0,1,1,2,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8,8,9,9,8,6,4,2,0,0,1,2,3,4,6,7,8,9,10,11,12,13,14,14,15,16,17,17,18,19,19,20,21,21,19,15,8,4,0,0,1,3,6,10,12,15,18,20,22,24,26,28,30,32,33,35,36,38,39,41,42,43,45,47,43,36,15,6,0,0,2,4,8,12,16,19,22,25,28,30,33,35,37,39,41,43,45,47,49,50,52,54,55,58,53,44,19,8,0,0,2,5,9,14,18,22,25,28,31,34,37,40,42,44,47,49,51,53,55,57,59,60,62,65,59,48,23,10,0,0,2,5,9,14,18,21,25,28,31,34,37,39,42,44,46,48,50,52,54,56,58,60,62,64,58,48,22,9,0,0,2,5,9,14,18,22,25,28,31,34,37,39,42,44,46,48,50,52,54,56,58,59,61,64,58,48,22,9,0,1,2,5,9,14,18,22,25,28,31,34,37,39,41,44,46,48,50,52,54,56,58,59,61,64,58,48,22,9,0,0,2,5,9,14,18,22,25,28,31,34,37,39,41,44,46,48,50,52,54,56,58,59,61,64,58,48,22,9,0,0,2,5,9,14,18,21,25,28,31,34,37,39,42,44,46,48,50,52,54,56,58,60,61,64,58,48,22,9,0,0,2,5,9,14,18,22,25,28,31,34,37,40,42,44,47,49,51,53,55,57,59,60,62,65,59,48,23,10,0,0,2,4,8,12,16,19,22,25,28,30,32,35,37,39,41,43,45,47,49,50,52,54,55,58,52,43,19,8,0,0,1,3,6,9,12,15,18,20,22,24,26,28,30,32,33,35,36,38,39,41,42,43,45,47,43,36,15,6,0,0,1,2,3,4,6,7,8,9,10,11,12,13,14,14,15,16,17,17,18,19,19,20,21,22,19,15,8,4,0,0,0,1,1,2,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8,8,9,9,8,6,4,2];

class Pos {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	distance(pos) {
		return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
	}
}

class Entity extends Pos {
	constructor(x, y, type, id, gameInstance) {
		super(x, y);
		this.id = id;
		this.type = type;
		this.gameInstance = gameInstance;
	}
}

class Cell extends Pos {
	constructor(ore, hole, x, y, probOre) {
		super(x, y);
		this.update(ore, hole);
		this.moveLatched = false;
		this.myHole = false;
		this.probOre = probOre;
	}

	update(ore, hole) {
		this.ore = ore;
		this.hole = hole;
	}

	isGood() {
		return (
			!this.radar &&
			!this.trap &&
			this.x !== 0 &&
			this.moveLatched === false
		);
	}

	isGoodForBuryingRadar() {
		return (
			((this.hole === HOLE && this.myHole === true) ||
				this.hole !== HOLE) &&
			this.ore === '?' &&
			this.isGood()
		);
	}

	isGoodForBuryingTraps() {
		return (
			((this.hole === HOLE && this.myHole === true) ||
				this.hole !== HOLE) &&
			this.ore > 0 &&
			this.isGood()
		);
	}

	isGoodForDigging() {
		return (
			((this.ore === '?' && this.hole !== HOLE) ||
				(this.ore > 0 &&
					((this.hole === HOLE && this.myHole === true) ||
						this.hole !== HOLE))) &&
			this.isGood()
		);
	}
}

class Grid {
	constructor() {
		this.cells = [];
	}

	init() {
		for (let y = 0; y < MAP_HEIGHT; y++) {
			for (let x = 0; x < MAP_WIDTH; x++) {
				let index = x + MAP_WIDTH * y;
				this.cells[index] = new Cell(0, 0, x, y, PROB_ORE[index]);
			}
		}
	}

	turnStart() {}

	turnOver() {
		this.cells.forEach((cell) => {
			if (cell.moveLatched) {
				cell.moveLatched = false;
			}
		});
	}

	getCell(x, y) {
		if (x < MAP_WIDTH && y < MAP_HEIGHT && x >= 0 && y >= 0) {
			return this.cells[x + MAP_WIDTH * y];
		}
		return null;
	}

	get viableOreContainingCells() {
		return this.cells.filter((cell) => {
			return cell.isGoodForDigging() === true && cell.ore > 0;
		});
	}

	closestGoodCell(pos, item) {
		let cellCheck = 'isGoodForDigging';
		if (item === RADAR) {
			cellCheck = 'isGoodForBuryingRadar';
		} else if (item === TRAP) {
			cellCheck = 'isGoodForBuryingTraps';
		}

		const calculateScore = (cell, moves) => {
			let score = cell.probOre / moves;
			if (!cell[cellCheck]) {
				score = score - 100;
			}
			return score;
		};

		let valueGraph = [];
		for (let i = 0, len = this.cells.length; i < len; i++) {
			let valueGraphObject = {
				cell: this.cells[i],
			};
			valueGraphObject.distance = valueGraphObject.cell.distance(pos);
			valueGraphObject.moves = Math.ceil(valueGraphObject.distance / 4);
			valueGraphObject.score = calculateScore(
				valueGraphObject.cell,
				valueGraphObject.moves
			);
			valueGraph.push(valueGraphObject);
		}
		valueGraph.sort((a, b) => {
			return b.score - a.score;
		});
		console.error(
			`Pos ${pos.x},${pos.y} resulted in ${valueGraph[0].cell.x},${valueGraph[0].cell.y} with score of ${valueGraph[0].score} and ${valueGraph[0].moves} moves.`
		);
		return valueGraph[0].cell;
	}

	// closestGoodCell(pos, item) {
	// 	let cellCheck = 'isGoodForDigging';
	// 	if (item === RADAR) {
	// 		cellCheck = 'isGoodForBuryingRadar';
	// 	} else if (item === TRAP) {
	// 		cellCheck = 'isGoodForBuryingTraps';
	// 	}
	// 	let currentAttempt = { x: pos.x, y: pos.y };
	// 	const checkCell = (xPlus, yPlus) => {
	// 		const cell = this.getCell(
	// 			currentAttempt.x + xPlus,
	// 			currentAttempt.y + yPlus
	// 		);
	// 		if (cell !== null && cell[cellCheck]()) {
	// 			return cell;
	// 		}
	// 		return false;
	// 	};

	// 	let totalDistribute = 1;
	// 	let debugRecursions = 0;
	// 	let circleSearchRecurse = (quad = 1, tempDistribute = 0) => {
	// 		debugRecursions++;
	// 		let x, y;
	// 		switch (quad) {
	// 			case 1: // quad 1
	// 				x = 1;
	// 				y = 1;
	// 				break;
	// 			case 2: // quad 4
	// 				x = 1;
	// 				y = -1;
	// 				break;
	// 			case 3: // quad 2
	// 				x = -1;
	// 				y = 1;
	// 				break;
	// 			case 4: // quad 3
	// 				x = -1;
	// 				y = -1;
	// 				break;
	// 		}

	// 		if (
	// 			(quad <= 2 && tempDistribute <= totalDistribute) ||
	// 			(quad >= 3 && tempDistribute < totalDistribute) // Don't repeat cardinal
	// 		) {
	// 			let found = checkCell(
	// 				(totalDistribute - tempDistribute) * x,
	// 				tempDistribute * y
	// 			);
	// 			if (found) {
	// 				return found;
	// 			} else {
	// 				return circleSearchRecurse(quad, tempDistribute + 1);
	// 			}
	// 		} else {
	// 			if (quad === 4) {
	// 				totalDistribute++;
	// 				return circleSearchRecurse(1, 0);
	// 			} else {
	// 				if (quad === 2 || quad == 4) {
	// 					return circleSearchRecurse(quad + 1, 1); // Don't repeat cardinal
	// 				} else {
	// 					return circleSearchRecurse(quad + 1, 0);
	// 				}
	// 			}
	// 		}
	// 	};
	// 	try {
	// 		return circleSearchRecurse();
	// 	} catch (e) {
	// 		console.error(
	// 			`Total distributions: ${totalDistribute}\n` +
	// 				`Recursions: ${debugRecursions}\n` +
	// 				`Pos: ${pos.x}, ${pos.y}\n` +
	// 				`CurrentAttempt: ${currentAttempt.x}, ${currentAttempt.y}\n` +
	// 				`Item: ${item}\n` +
	// 				`CellCheck: ${cellCheck}\n `
	// 		);
	// 		console.error(e);
	// 	}
	// }
}

class Robot extends Entity {
	constructor(x, y, type, id, gameInstance) {
		super(x, y, type, id, gameInstance);
		this.commandToExecute = {};
		this.clearCommandToExecute();
	}

	isDead() {
		return this.x === -1 && this.y === -1;
	}

	isInHQ() {
		return this.x === 0;
	}

	setCommandToExecute(command, storedThis, ...argsArray) {
		this.commandToExecute = {
			command: command,
			storedThis: storedThis,
			params: argsArray,
		};
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
}

class PlayerRobot extends Robot {
	constructor(x, y, type, id, item, gameInstance) {
		super(x, y, type, id, gameInstance);
		this.item = item;
		this.destinationMemory = { x: x, y: y, message: '' };
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
		if (item === RADAR) {
			console.log(`REQUEST RADAR ${message}`);
		} else if (item === TRAP) {
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
			RADAR,
			message
		);
	}

	takeTrap(message) {
		this.gameInstance.myTraps.take(this);
		return this.setCommandToExecute(
			this.consoleRequest,
			this,
			TRAP,
			message
		);
	}

	moveToCell(cell, message) {
		if (cell.x !== 0) {
			cell.moveLatched = true;
		}
		return this.setCommandToExecute(
			this.consoleMove,
			this,
			cell.x,
			cell.y,
			message
		);
	}

	memMoveAndLatch() {
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

	// Item optional, can put a non-item string/nothing to just check for digging
	moveToClosestGoodCell(message, item) {
		let newCell = this.gameInstance.grid.closestGoodCell(this, item);

		// EARLY GAME OPTIMIZATION
		let totalChange = 1;
		if (this.gameInstance.turn < 13) {
			if (newCell.y === 0) {
				totalChange++;
				newCell.y = newCell.y + 1;
			}
			if (newCell.y === MAP_HEIGHT - 1) {
				totalChange++;
				newCell.y = newCell.y - 1;
			}
			let toChange = 4 - totalChange;
			newCell.x = newCell.x + toChange;
		}
		if (this.gameInstance.turn >= 13 && this.gameInstance.turn < 40) {
			if (newCell.y === 0) {
				newCell.y = newCell.y + 2;
			}
			if (newCell.y === MAP_HEIGHT - 1) {
				newCell.y = newCell.y - 2;
			}
		}
		// END OPTIMIZATION

		return this.moveToCell(newCell, message);
	}

	moveToClosestIdealBuryingSite(message) {
		if (this.item === RADAR) {
			let idealPosition = this.gameInstance.myRadars.getNextIdealPosition();
			if (idealPosition) {
				let newCell = this.gameInstance.grid.getCell(
					idealPosition.x,
					idealPosition.y
				);
				let destination = this.gameInstance.grid.closestGoodCell(
					newCell,
					this.item
				);
				return this.moveToCell(destination, message);
			}
		}
		return this.moveToClosestGoodCell(message, this.item);
	}

	digAndLatch(message) {
		let newCell = this.gameInstance.grid.getCell(this.x, this.y);
		if (this.item === RADAR) {
			newCell.radar = true;
		} else if (this.item === TRAP) {
			newCell.trap = true;
		}
		newCell.moveLatched = true;
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
		return this.moveToCell({ x: 0, y: this.y }, message);
	}

	declareDead() {
		return this.setCommandToExecute(this.wait, this, 'DEAD');
	}
}

class EntityDirector {
	constructor(gameInstance) {
		this.gameInstance = gameInstance;
		this.reset();
	}

	reset() {
		this.entities = [];
	}

	getEntity(id) {
		return this.entities.find((entity) => {
			return entity.id === id;
		});
	}

	update(x, y, type, id, item) {
		let found = this.getEntity(id);
		if (found) {
			found.x = x;
			found.y = y;
			if (item) {
				found.item = item;
			}
		} else {
			let toPush;
			if (type === ROBOT_ALLY) {
				toPush = new PlayerRobot(
					x,
					y,
					type,
					id,
					item,
					this.gameInstance
				);
			} else if (type === ROBOT_ENEMY) {
				toPush = new Robot(x, y, type, id, this.gameInstance);
			} else {
				toPush = new Entity(x, y, type, id, this.gameInstance);
			}
			this.entities.push(toPush);
		}
	}

	get length() {
		return this.entities.length;
	}

	turnStart() {}

	turnOver() {}
}

class MyRobots extends EntityDirector {
	constructor(gameInstance) {
		super(gameInstance);
	}

	turnStart() {
		super.turnStart();

		this.entities.forEach((robot) => {
			if (robot.isDead()) {
				return robot.declareDead();
			}

			if (!robot.memArrived) {
				return robot.memMoveAndLatch();
			}

			if (robot.isInHQ() && robot.item === NONE) {
				if (
					this.gameInstance.myRadars.shouldRequestOrTake(robot, true)
				) {
					return robot.takeRadar('REQRADAR');
				}
				if (this.gameInstance.myTraps.shouldRequestOrTake()) {
					return robot.takeTrap('REQTRAP');
				}
			}

			if (robot.item === ORE) {
				return robot.returnToHQ('HQ:ORE');
			}

			const currentCell = this.gameInstance.grid.getCell(
				robot.x,
				robot.y
			);

			if (robot.item === RADAR || robot.item === TRAP) {
				if (
					(robot.item === RADAR &&
						currentCell.isGoodForBuryingRadar()) ||
					(robot.item === TRAP && currentCell.isGoodForBuryingTraps())
				) {
					return robot.digAndLatch('DIG:BURY');
				} else {
					return robot.moveToClosestIdealBuryingSite('GOTO:BURY');
				}
			}

			if (currentCell.ore > 0 && currentCell.isGoodForDigging()) {
				robot.digAndLatch('DIG:ORE');
			}
		});

		const availableOre = this.gameInstance.grid.viableOreContainingCells.slice();
		if (availableOre.length > 0) {
			const availableRobots = this.availableRobots.slice();
			const robotInfoArray = [];
			if (availableRobots.length < availableOre.length) {
				availableRobots.forEach((robot) => {
					let closestOre;
					let closestOreDistance = Infinity;
					availableOre.forEach((oreCell) => {
						if (!oreCell.moveLatched) {
							let distance = oreCell.distance(robot);
							if (distance < closestOreDistance) {
								closestOre = oreCell;
								closestOreDistance = distance;
							}
						}
					});
					robot.moveToCell(closestOre, 'GOTO:ORE');
				});
			} else {
				availableOre.forEach((oreCell) => {
					let closestRobot;
					let closestRobotDistance = Infinity;
					availableRobots.forEach((robot) => {
						if (robot.commandToExecute.command === null) {
							let distance = oreCell.distance(robot);
							if (distance < closestRobotDistance) {
								closestRobot = robot;
								closestRobotDistance = distance;
							}
						}
					});
					closestRobot.moveToCell(oreCell, 'GOTO:ORE');
				});
			}
		}

		const robotsLeft = this.availableRobots.slice();
		robotsLeft.forEach((robot) => {
			if (this.gameInstance.myRadars.shouldRequestOrTake(robot, false)) {
				return robot.requestRadarRemotely('HQ:RADAR');
			}
			const currentCell = this.gameInstance.grid.getCell(
				robot.x,
				robot.y
			);
			if (!currentCell.isGoodForDigging()) {
				return robot.moveToClosestGoodCell('GOTO:SEARCH', 'dig');
			} else {
				return robot.digAndLatch('DIG:SEARCH');
			}
		});
	}

	turnOver() {
		super.turnOver();
		this.entities.forEach((robot) => {
			robot.clearCommandToExecute();
		});
	}

	get availableRobots() {
		return this.entities.filter((robot) => {
			return robot.commandToExecute.command === null;
		});
	}
}

class EnemyRobots extends EntityDirector {
	constructor(gameInstance) {
		super(gameInstance);
	}

	turnStart() {
		super.turnStart();
	}

	turnOver() {
		super.turnOver();
	}
}

class ItemDirector extends EntityDirector {
	constructor(gameInstance) {
		super(gameInstance);
		this.itemFreezeLatch = false;
		this.cooldown = 0;
	}

	turnStart() {
		super.turnStart();
	}

	turnOver() {
		super.turnOver();
		if (this.itemFreezeLatch && this.itemFreezeLatch.item === RADAR) {
			this.itemFreezeLatch = false;
		}
	}

	requestAndTake(robot) {
		this.latch(robot);
	}

	requestRemotely(robot) {
		this.latch(robot);
	}

	shouldRequestOrTake(robot) {
		return (
			this.cooldown === 0 &&
			(this.itemFreezeLatch === false ||
				this.isLatchedByGivenRobot(robot))
		);
	}

	latch(robot) {
		this.itemFreezeLatch = robot;
	}

	isLatchedByGivenRobot(robot) {
		return this.itemFreezeLatch && this.itemFreezeLatch.id === robot.id;
	}

	updateCooldown(cooldown) {
		this.cooldown = cooldown;
	}
}

class MyRadars extends ItemDirector {
	constructor(gameInstance) {
		super(gameInstance);
		this.startingX = 3;
		this.startingY = 2;
		this.plusX = 4;
		this.plusY = 5;
		this.latchedEntities = [];
		this.numExtraRadars = EXTRA_RADARS;
		this.generateIdealEntities();
	}

	turnStart() {
		super.turnStart();
	}

	turnOver() {
		super.turnOver();
	}

	requestAndTake(robot) {
		super.requestAndTake(robot);
		if (this.getNumIdealLeft() === 0) {
			this.numExtras--;
		}
	}

	// If it is greedy then give it a few extras, otherwise not
	shouldRequestOrTake(robot, greedy) {
		return (
			super.shouldRequestOrTake(robot) &&
			(greedy
				? this.getNumIdealLeft() + this.numExtraRadars > 0
				: this.getNumIdealLeft() > 0)
		);
	}

	generateIdealEntities() {
		let lastEntity = { x: this.startingX, y: this.startingY };
		let offset = false;
		for (let x = this.startingX; x < MAP_WIDTH; x = x + this.plusX) {
			let yOffset = offset ? this.startingY + this.plusY : this.startingY;
			for (let y = yOffset; y < MAP_HEIGHT; y = y + 2 * this.plusY) {
				this.latchedEntities.push({
					x: x,
					y: y,
					latched: false,
				});
			}
			offset = !offset;
		}
	}

	getNextIdealPosition() {
		let toReturnArray = this.latchedEntities.filter((entry) => {
			return entry.latched === false;
		});
		// Pick the lower third to optimize probability distribution
		if (toReturnArray.length > 0) {
			let toReturn = toReturnArray[Math.floor(toReturnArray.length / 3)];
			toReturn.latched = true;
			return toReturn;
		}
		return false;
	}

	getNumIdealLeft() {
		return this.latchedEntities.filter((entry) => {
			return entry.latched === false;
		}).length;
	}
}

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
		// super.shouldRequestOrTake();
		return false;
	}

	isGoodTimeToPlace(robot) {
		return this.gameInstance.grid.viableOreContainingCells.length > 0;
	}
}

class Game {
	constructor() {
		this.grid = new Grid();
		this.grid.init();
		this.myScore = 0;
		this.enemyScore = 0;
		this.turn = 0;
		this.entityCount = 0;
		this.myRobots = new MyRobots(this);
		this.enemyRobots = new EnemyRobots(this);
		this.myRadars = new MyRadars(this);
		this.myTraps = new MyTraps(this);
	}

	turnStart() {
		this.myRobots.turnStart();
		this.enemyRobots.turnStart();
		this.myRadars.turnStart();
		this.myTraps.turnStart();
		this.grid.turnStart();
	}

	turnOver() {
		this.myRobots.turnOver();
		this.enemyRobots.turnOver();
		this.myRadars.turnOver();
		this.myTraps.turnOver();
		this.grid.turnOver();
		this.turn++;
	}

	updateScoreData(myScore, enemyScore) {
		this.myScore = parseInt(myScore, 10);
		this.enemyScore = parseInt(myScore, 10);
	}

	updateCell(x, y, ore, hole) {
		if (ore !== '?') {
			ore = parseInt(ore, 10);
		}
		hole = parseInt(hole, 10);
		this.grid.getCell(x, y).update(ore, hole);
	}

	updateMiscData(...entityData) {
		const [entityCount, radarCooldown, trapCooldown] = entityData.map(
			(a) => {
				return parseInt(a, 10);
			}
		);
		this.entityCount = entityCount;
		this.myRadars.updateCooldown(radarCooldown);
		this.myTraps.updateCooldown(trapCooldown);
	}

	updateEntityData(...entityData) {
		const [id, type, x, y, item] = entityData.map((a) => {
			return parseInt(a, 10);
		});
		switch (type) {
			case ROBOT_ALLY:
				this.myRobots.update(x, y, type, id, item);
				break;
			case ROBOT_ENEMY:
				this.enemyRobots.update(x, y, type, id, item);
				break;
			case RADAR:
				this.myRadars.update(x, y, type, id);
				break;
			case TRAP:
				this.myTraps.update(x, y, type, id);
				break;
		}
	}
}

let game = new Game();

while (true) {
	game.updateScoreData(...readline().split(' '));
	for (let i = 0; i < MAP_HEIGHT; i++) {
		let mapDataInputs = readline().split(' ');
		for (let j = 0; j < MAP_WIDTH; j++) {
			game.updateCell(
				j,
				i,
				mapDataInputs[2 * j],
				mapDataInputs[2 * j + 1]
			);
		}
	}
	game.updateMiscData(...readline().split(' '));
	for (let i = 0, len = game.entityCount; i < len; i++) {
		game.updateEntityData(...readline().split(' '));
	}

	game.turnStart();
	game.myRobots.entities.forEach((robot) => {
		if (robot.commandToExecute.command !== null) {
			return robot.executeCommand();
		} else {
			return robot.wait('NOTHINGTODO');
		}
	});
	game.turnOver();
}
