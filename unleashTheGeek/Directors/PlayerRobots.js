import RobotDirector from './RobotDirector';
import PlayerRobot from '../Pos/PlayerRobot.js';
import {
	RADAR,
	TOP_CELLS_TO_ANALYZE,
	DEVMSG,
	DIG_POS_SCORE_CHANGE_THRESHOLD,
} from '../config.js';
import { distanceBetween } from '../common.js';

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
		if (item === RADAR) {
			this._game.myRadars.requestItem(requestType, requester);
		} else {
			this._game.myTraps.requestItem(requestType, requester);
		}
	}

	getCellDigScore(robot, cell, radarLocScore) {
		let digPos = 0;
		let digNeg = 0;
		let digScore = 0;
		let digPosReasons = [];
		let digNegReasons = [];
		if (cell.x === 0) {
			return {
				digPos: 0,
				digNeg: 1000,
				digPosReasons: [],
				digNegReasons: ['HQ'],
				digScore: -1000,
			};
		}
		if (cell.radar || cell.trap) {
			return {
				digPos: 0,
				digNeg: 1000,
				digPosReasons: [],
				digNegReasons: ['Item Present'],
				digScore: -1000,
			};
		}
		if (
			robot.hasItem &&
			!cell.isDigLatchedByGivenRobot(robot) &&
			cell.numDigLatched !== 0
		) {
			digNeg += 100;
			digNegReasons.push('Item May Be Destroyed By Another Robot');
		}
		if (
			cell.ore !== '?' &&
			!cell.isDigLatchedByGivenRobot(robot) &&
			cell.numDigLatched >= cell.ore
		) {
			digNeg += 100;
			digNegReasons.push('Dig Latched Cell');
		}
		if (cell.hole && !cell.myHole) {
			digNeg += 100;
			digNegReasons.push('Enemy Hole');
		}
		if (cell.hole && cell.enemyTrapChance > 0) {
			digNeg += 100 * cell.enemyTrapChance;
			digNegReasons.push(`${cell.enemyTrapChance} chance of trap`);
		}
		if (cell.hole && cell.ore === '?') {
			digNeg += 100;
			digNegReasons.push('Already dug unknown hole'); //TODO track ore extracted
		}
		if (cell.ore === 0) {
			digNeg += 100;
			digNegReasons.push('Exhausted vein');
		}

		if (robot.hasRadar) {
			digPos += radarLocScore;
			digPosReasons.push(`Radar placement score: ${radarLocScore}`);
			if (radarLocScore <= 0) {
				digNeg += 100;
				digNegReasons.push('Bad Radar Loc');
			}
		} else if (robot.hasTrap && cell.ore !== '?' && cell.ore > 0) {
			if (cell.enemyHole) {
				digPos += 10; // TODO: Overdoing it? -- will be better when you have likely enemy traps
				digPosReasons.push('Perfect trap location');
			} else {
				digPos += 5;
				digPosReasons.push('Not enemy hole but has ore');
			}
		}
		if (cell.ore === '?') {
			digPos += cell.probOre;
			digPosReasons.push(`%${cell.probOre} prob`);
		} else if (cell.ore > 0) {
			digPos += 100;
			for (let i = cell.ore; i > 1; i--) {
				digPos += 25;
			}
			digPosReasons.push(`${cell.ore} ore`);
		}
		digScore += digPos - digNeg;
		return {
			digPos: digPos,
			digNeg: digNeg,
			digPosReasons: digPosReasons,
			digNegReasons: digNegReasons,
			digScore: digScore,
		};
	}

	getValueGraphForDigging(robot) {
		let valueGraph = [];
		for (let i = 0, len = this._grid.cells.length; i < len; i++) {
			let cell = this._grid.cells[i];
			let radarLocScore;
			if (robot.hasRadar) {
				printTime(null, true);
				radarLocScore = this._game.myRadars.radarLocScore(cell);
				printTime('radarLocScore');
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

	getBestNodeForDigging(robot) {
		let bestDigScore = -Infinity;
		let bestCell = {};
		for (let i = this._grid.cells.length - 1; i !== -1; i--) {
			let cell = this._grid.cells[i];
			let radarLocScore;
			if (robot.hasRadar) {
				printTime(null, true);
				radarLocScore = this._game.myRadars.radarLocScore(cell);
				printTime('radarLocScore');
			}
			const digScoreObject = this.getCellDigScore(
				robot,
				cell,
				radarLocScore
			);
			if (digScoreObject.digScore > bestDigScore) {
				bestCell = { digCell: cell, ...digScoreObject };
				bestDigScore = digScoreObject.digScore;
			}
		}
		return bestCell;
	}

	getCellMoveScore(robot, cell) {
		const distance = distanceBetween(cell, robot.currentCell);
		const moves = robot.movesToCoverDistance(distance, false);
		const distanceToHQ = cell.distanceToHQ();
		const totalMoves =
			moves + robot.movesToCoverDistance(distanceToHQ, false);
		const moveScore = totalMoves;
		return {
			totalMoves: totalMoves,
			moveScore: moveScore,
		};
	}

	getValueGraphForMovingAroundDigCell(robot, digCell) {
		let movingValueGraph = [];
		const adjacentCells = this._grid.getCellsWithAdjacency(digCell, true);
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
		const diggingValueGraph = this.getValueGraphForDigging(robot);
		const amountToSlice = robot.hasRadar
			? diggingValueGraph.length
			: TOP_CELLS_TO_ANALYZE;
		const topDigNodes = diggingValueGraph
			.sort((a, b) => {
				return b.digScore - a.digScore;
			})
			.slice(0, amountToSlice);

		if (robot.hasRadar) {
			printTime('diggingValueGraph.withRadar');
		} else {
			printTime('diggingValueGraph');
		}

		let savedIdealScore = -Infinity;
		let idealMoveCellData = {};
		let digPogReasons = [];
		let digNegReasons = [];
		for (let i = topDigNodes.length - 1; i !== -1; i--) {
			const digNodeData = topDigNodes[i];
			const movingValueGraph = this.getValueGraphForMovingAroundDigCell(
				robot,
				digNodeData.digCell
			);
			for (let j = 0, len = movingValueGraph.length; j < len; j++) {
				const moveNodeData = movingValueGraph[j];
				let idealScore = digNodeData.digPos;

				if (moveNodeData.moveScore !== 0) {
					idealScore = idealScore / moveNodeData.moveScore;
				}

				idealScore = idealScore - digNodeData.digNeg;

				if (idealScore > savedIdealScore) {
					idealMoveCellData = {
						idealScore: idealScore,
						moveCell: moveNodeData.moveCell,
						moveScore: moveNodeData.moveScore,
						totalMoves: moveNodeData.totalMoves,
						digCell: digNodeData.digCell,
						digPos: digNodeData.digPos,
						digNeg: digNodeData.digNeg,
					};
					digPogReasons = digNodeData.digPosReasons;
					digNegReasons = digNodeData.digNegReasons;
					savedIdealScore = idealScore;
				}
			}
		}
		if (robot.hasRadar) {
			printTime('movingValueGraphs.withRadar');
		} else {
			printTime('movingValueGraphs');
		}

		if (DEVMSG) {
			// prettier-ignore
			console.error(`(${robot.x},${robot.y}) => move (${idealMoveCellData.moveCell.x},${idealMoveCellData.moveCell.y}), dig (${idealMoveCellData.digCell.x},${idealMoveCellData.digCell.y})
 	digPos: ${idealMoveCellData.digPos}, digNeg: ${idealMoveCellData.digNeg}
 	digPosReasons: [${digPogReasons}], digNegReasons: [${digNegReasons}]
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
			let currentCellScore = this.getCellDigScore(
				robot,
				robot.intendedDigCell,
				radarLocScore
			);
			return (
				currentCellScore.digNeg !== robot.anticipatedNegScore ||
				currentCellScore.digPos <
					robot.anticipatedPosScore + DIG_POS_SCORE_CHANGE_THRESHOLD
			);
		} else {
			return true;
		}
	}

	determineBestAction(robot) {
		// It has arrived at its destination move cell
		if (!this.hasScoreChanged(robot)) {
			printTime(
				'myRobots.turnStart.best action loop.score changed',
				true
			);
			return robot.digCell(robot.intendedDigCell, 'DIG');
		} else {
			printTime(
				'myRobots.turnStart.best action loop.score changed',
				true
			);
			let bestCellData = this.getIdealCellsData(robot);
			printTime(
				'myRobots.turnStart.best action loop.ideal cell selected'
			);
			robot.anticipatedPosScore = bestCellData.digPos;
			robot.anticipatedNegScore = bestCellData.digNeg;
			if (robot.currentCell === bestCellData.moveCell) {
				return robot.digCell(bestCellData.digCell, 'DIG');
			} else {
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
			if (robot.isInHQ && !robot.hasItem) {
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
		printTime('myRobots.turnStart.rules loop', false);

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
		printTime('myRobots.turnStart.memory loop', false);

		this.availableRobots.forEach((robot) => {
			this.determineBestAction(robot);
		});
		printTime('myRobots.turnStart.best action loop');
	}

	turnOver() {
		super.turnOver();
		this.entities.forEach((robot) => {
			robot.clearCommandToExecute();
		});
	}
}

export default PlayerRobots;
