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

	getCellDigScore(robot, cell, radarLocScore) {
		let returnObject = {
			digPos: 0,
			digNeg: 0,
			digScore: 0,
			digPosReasons: [],
			digNegReasons: [],
		};
		if (cell.x === 0) {
			returnObject.digNeg += 1000;
			returnObject.digNegReasons.push('HQ');
		}
		if (cell.radar || cell.trap) {
			returnObject.digNeg += 1000;
			returnObject.digNegReasons.push('Item Present');
		}
		if (
			robot.hasItem &&
			!cell.isDigLatchedByGivenRobot(robot) &&
			cell.numDigLatched !== 0
		) {
			returnObject.digNeg += 100;
			returnObject.digNegReasons.push(
				'Item May Be Destroyed By Another Robot'
			);
		}
		if (
			cell.ore !== '?' &&
			!cell.isDigLatchedByGivenRobot(robot) &&
			cell.numDigLatched >= cell.ore
		) {
			returnObject.digNeg += 100;
			returnObject.digNegReasons.push('Dig Latched Cell');
		}
		if (cell.hole === config.HOLE && cell.myHole !== true) {
			returnObject.digNeg += 100;
			returnObject.digNegReasons.push('Enemy Hole');
		}
		if (cell.hole === config.HOLE && cell.ore === '?') {
			returnObject.digNeg += 100;
			returnObject.digNegReasons.push('Already dug unknown hole'); //TODO track ore extracted
		}
		if (cell.ore === 0) {
			returnObject.digNeg += 100;
			returnObject.digNegReasons.push('Exhausted vein');
		}

		if (robot.hasRadar) {
			returnObject.digPos += radarLocScore;
			returnObject.digPosReasons.push(
				`Radar placement score: ${radarLocScore}`
			);
			if (radarLocScore <= 0) {
				returnObject.digNeg += 100;
				returnObject.digNegReasons.push('Bad Radar Loc');
			}
		} else if (robot.hasTrap && cell.ore !== '?' && cell.ore > 0) {
			if (cell.enemyHole) {
				returnObject.digPos += 10; // TODO: Overdoing it? -- will be better when you have likely enemy traps
				returnObject.digPosReasons.push('Perfect trap location');
			} else {
				returnObject.digPos += 5;
				returnObject.digPosReasons.push('Not enemy hole but has ore');
			}
		}
		if (cell.ore === '?') {
			returnObject.digPos += cell.probOre;
			returnObject.digPosReasons.push(`%${cell.probOre} prob`);
		} else if (cell.ore > 0) {
			returnObject.digPos += 100;
			for (let i = cell.ore; i > 1; i--) {
				returnObject.digPos += 25;
			}
			returnObject.digPosReasons.push(`${cell.ore} ore`);
		}
		returnObject.digScore += returnObject.digPos - returnObject.digNeg;
		return returnObject;
	}

	getValueGraphForDigging(robot) {
		let valueGraph = [];
		for (let i = 0, len = this._game.grid.cells.length; i < len; i++) {
			let cell = this._game.grid.cells[i];
			let radarLocScore;
			if (robot.hasRadar) {
				radarLocScore = this._game.myRadars.radarLocScore(cell);
			}
			const digScoreObject = this.getCellDigScore(
				robot,
				cell,
				radarLocScore
			);
			valueGraph.push({ digCell: cell, ...digScoreObject });
		}
		return valueGraph;
	}

	getCellMoveScore(robot, cell) {
		const returnObject = {
			totalMoves: 0,
			moveScore: 0,
		};
		const distance = cell.distance(robot.currentCell);
		const moves = robot.movesToCoverDistance(distance, false);
		const distanceToHQ = cell.distanceToHQ();
		const totalMoves =
			moves + robot.movesToCoverDistance(distanceToHQ, false);
		returnObject.totalMoves += totalMoves;
		returnObject.moveScore += totalMoves;
		return returnObject;
	}

	getValueGraphForMovingAroundDigCell(robot, digCell) {
		let movingValueGraph = [];
		const adjacentCells = this._game.grid.getCellsWithAdjacency(
			digCell,
			true
		);
		adjacentCells.forEach((cell) => {
			const moveScoreObject = this.getCellMoveScore(robot, cell);
			movingValueGraph.push({
				moveCell: cell,
				...moveScoreObject,
			});
		});

		return movingValueGraph;
	}

	getIdealCellsData(robot) {
		let diggingValueGraph = this.getValueGraphForDigging(robot);
		let idealCellsGraph = [];
		console.error('preok');
		diggingValueGraph.forEach((digNodeData) => {
			const movingValueGraph = this.getValueGraphForMovingAroundDigCell(
				robot,
				digNodeData.digCell
			);
			movingValueGraph.forEach((moveNodeData) => {
				let idealScore = digNodeData.digPos;

				if (moveNodeData.moveScore !== 0) {
					idealScore = idealScore / moveNodeData.moveScore;
				}
				idealScore = idealScore - digNodeData.digNeg;
				idealCellsGraph.push({
					idealScore: idealScore,
					...moveNodeData,
					...digNodeData,
				});
			});
		});
		console.error('pastok');
		idealCellsGraph.sort((a, b) => {
			return b.idealScore - a.idealScore;
		});
		console.error('pastsort');
		const idealMoveCellData = idealCellsGraph[0];

		if (config.DEVMSG) {
			// prettier-ignore
			console.error(`(${robot.x},${robot.y}) => move (${idealMoveCellData.moveCell.x},${idealMoveCellData.moveCell.y}), dig (${idealMoveCellData.digCell.x},${idealMoveCellData.digCell.y})
 	digPos: ${idealMoveCellData.digPos}, digNeg: ${idealMoveCellData.digNeg}
 	digPosReasons: [${idealMoveCellData.digPosReasons}], digNegReasons: [${idealMoveCellData.digNegReasons}]
 	moveScore: ${idealMoveCellData.moveScore}, totalMoves: ${idealMoveCellData.totalMoves}
 	idealScore: ${idealMoveCellData.idealScore}`);
		}
		return idealMoveCellData;

		// {
		// 	totalMoves: 0,
		// 	moveScore: 0,
		// 	digCell: cell,
		// 	moveCell: cell,
		// 	digPos: 0,
		// 	digNeg: 0,
		// 	digScore: 0,
		// 	digPosReasons: [],
		// 	digNegReasons: [],
		// }
	}

	hasScoreChanged(robot) {
		if (robot.intendedDigCell !== null) {
			let radarLocScore = 0;
			if (robot.hasRadar) {
				radarLocScore = this._game.myRadars.radarLocScore(
					robot.intendedDigCell
				);
			}
			console.error('scorechange-radar');
			let currentCellScore = this.getCellDigScore(
				robot,
				robot.intendedDigCell,
				radarLocScore
			);
			console.error('scorechange-cellscore');
			return (
				currentCellScore.digNeg !== robot.anticipatedNegScore ||
				currentCellScore.digPos <
					robot.anticipatedPosScore +
						config.DIG_POS_SCORE_CHANGE_THRESHOLD
			);
		} else {
			return true;
		}
	}

	determineBestAction(robot) {
		// It has arrived at its destination move cell
		console.error('prescore');
		if (!this.hasScoreChanged(robot)) {
			console.error('unclear-dig ');
			return robot.digCell(robot.intendedDigCell, 'DIG');
		} else {
			console.error('postscore-changed');
			let bestCellData = this.getIdealCellsData(robot);
			robot.anticipatedPosScore = bestCellData.digPos;
			robot.anticipatedNegScore = bestCellData.digNeg;
			if (robot.currentCell === bestCellData.moveCell) {
				console.error('cleared - dig');
				return robot.digCell(bestCellData.digCell, 'DIG');
			} else {
				console.error('cleared - move');
				return robot.moveToCell(
					bestCellData.moveCell,
					bestCellData.digCell,
					'MOVE'
				);
			}
		}
	}

	turnStart() {
		super.turnStart();

		this.entities.forEach((robot) => {
			if (robot.isDead()) {
				return robot.declareDead();
			}
			robot.turnStart(); // Otherwise, hole might get marked as 0 ore if earlier
			if (robot.isInHQ() && !robot.hasItem) {
				if (this._game.myRadars.shouldRequestOrTake(robot, true)) {
					return robot.takeRadar('REQRADAR');
				}
				if (this._game.myTraps.shouldRequestOrTake(robot)) {
					return robot.takeTrap('REQTRAP');
				}
			}

			if (robot.hasOre) {
				return robot.returnToHQ('ORE');
			}
		});

		// Clear unneeded digging latches before going further
		this.availableRobots.forEach((robot) => {
			if (!robot.arrivedAtLocationInMemory) {
				if (!this.hasScoreChanged(robot)) {
					return robot.memMove();
				} else {
					robot.breakMemoryLatchForDigging();
				}
			}
		});

		console.error(this.availableRobots.length, ' to clear');

		this.availableRobots.forEach((robot) => {
			this.determineBestAction(robot);
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
