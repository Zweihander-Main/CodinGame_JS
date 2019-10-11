import RobotDirector from './RobotDirector';
import PlayerRobot from '../Pos/PlayerRobot.js';
import config from '../config.js';

class PlayerRobots extends RobotDirector {
	constructor(game) {
		super(game);
	}

	get availableRobots() {
		return this.entities.filter((robot) => {
			return robot.commandToExecute.command === null;
		});
	}

	createNewEntity(x, y, type, id, item) {
		return new PlayerRobot(x, y, type, id, item, this);
	}

	// ask, remote, take
	requestItem(item, requestType, requester) {
		if (item === config.RADAR) {
			this._game.myRadars.requestItem(requestType, requester);
		} else {
			this._game.myTraps.requestItem(requestType, requester);
		}
	}

	getCellScore(robot, cell, moves, distance, radarLocScore) {
		let returnObject = {
			pos: 0,
			neg: 0,
			posReasons: [],
			negReasons: [],
		};
		const distanceToHQ = cell.distanceToHQ();
		const totalMoves = moves + robot.movesToCoverDistance(distanceToHQ);
		if (cell.x === 0) {
			returnObject.neg += 1000;
			returnObject.negReasons.push('HQ');
		}
		if (cell.radar || cell.trap) {
			returnObject.neg += 1000;
			returnObject.negReasons.push('Item Present');
		}
		if (cell.ore === '?' && cell.numMoveLatched > 0) {
			returnObject.neg += 100;
			returnObject.negReasons.push('Move Latched Cell');
		}
		if (cell.ore !== '?' && cell.numDigLatched >= cell.ore) {
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

		if (robot.hasRadar) {
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

	getBestCellForRobot(robot) {
		let valueGraph = [];
		for (let i = 0, len = this._game.grid.cells.length; i < len; i++) {
			let valueGraphObject = {
				cell: this._game.grid.cells[i],
			};
			valueGraphObject.distance = valueGraphObject.cell.distance(
				robot.currentCell
			);
			valueGraphObject.moves = robot.movesToCoverDistance(
				valueGraphObject.distance
			);
			if (valueGraphObject.moves === 0) {
				valueGraphObject.moves = 1;
			}
			let radarLocScore;
			if (robot.hasRadar) {
				radarLocScore = this._game.myRadars.radarLocScore(
					valueGraphObject.cell
				);
			}
			valueGraphObject.scoreObject = this.getCellScore(
				robot,
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
			`Pos ${robot.x},${robot.y} resulted in ${valueGraph[0].cell.x},${
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

	determineBestAction(robot) {
		let currentCellScore = this.getCellScore(
			robot,
			robot.currentCell,
			1,
			0
		);
		if (currentCellScore.neg === robot.anticipatedNegScore) {
			return robot.digCell('DIG');
		} else {
			let bestCellData = this.getBestCellForRobot(robot);
			robot.anticipatedNegScore = bestCellData.scoreObject.neg;
			return robot.moveToCell(bestCellData.cell, 'MOVE');
		}
	}

	turnStart() {
		super.turnStart();

		this.entities.forEach((robot) => {
			if (robot.isDead()) {
				return robot.declareDead();
			}

			robot.turnStart();

			if (!robot.memArrived) {
				return robot.memMove();
			}

			if (robot.isInHQ() && !robot.hasItem) {
				if (this._game.myRadars.shouldRequestOrTake(robot, true)) {
					return robot.takeRadar('REQRADAR');
				}
				if (this._game.myTraps.shouldRequestOrTake(robot)) {
					return robot.takeTrap('REQTRAP');
				}
			}

			if (robot.hasOre) {
				return robot.returnToHQ('HQ:ORE');
			}

			return this.determineBestAction(robot);
		});
	}

	turnOver() {
		super.turnOver();
		this.entities.forEach((robot) => {
			robot.clearCommandToExecute();
		});
	}
}

export default PlayerRobots;
