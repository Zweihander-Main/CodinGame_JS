import Robot from './Robot.js';

class EnemyRobot extends Robot {
	constructor(x, y, type, id, item, director) {
		super(x, y, type, id, item, director);
	}

	turnStart() {
		super.turnStart();
		if (this.locHistory.length > 0) {
			const lastLoc = this.locHistory[this.locHistory.length - 1];
			if (
				lastLoc.x === this.x &&
				lastLoc.y === this.y &&
				lastLoc.x !== 0 // TODO can dig in hq
			) {
				const possibleCells = [];
				const surroundingCells = this.director._grid.getCellsWithAdjacency(
					this,
					true
				);
				surroundingCells.forEach((cell) => {
					if (cell.hole && cell.wasJustMined) {
						possibleCells.push(cell);
					}
				});
				if (possibleCells === 1) {
					if (possibleCells[0].myHole) {
						possibleCells[0].enemyTrapChance += 5;
					}
				} else if (possibleCells > 1) {
					console.error(possibleCells.map((a) => a.pretty));
					possibleCells.forEach((cell) => {
						console.error(
							'unsure cell dug by enemy: ',
							cell.pretty
						);
						if (cell.myHole) {
							cell.enemyTrapChance += possibleCells.length;
						}
					});
				}
			}
		}
		// if (this.locHistory.length > 0) {
		// 	const lastLoc = this.locHistory[this.locHistory.length - 1];
		// 	if (
		// 		lastLoc.x === this.x &&
		// 		lastLoc.y === this.y &&
		// 		this.lastHQ > this.locHistory.length - 1
		// 	) {
		// 		console.error('possible');
		// 		// const possibleCells = [];
		// 		// if (this.isInHQ && this.locHistory.length > 1) {
		// 		// 	const last2Loc = this.locHistory[
		// 		// 		this.locHistory.length - 2
		// 		// 	];
		// 		// 	if (last2Loc.x === this.x && last2Loc.y === this.y) {
		// 		// 		const possibleCell = this.director.getCell(1, this.y);
		// 		// 		if (
		// 		// 			possibleCell.hole &&
		// 		// 			!possibleCell.myHole &&
		// 		// 			possibleCell.wasJustMined
		// 		// 		) {
		// 		// 			possibleCells.push(this.currentCell);
		// 		// 		}
		// 		// 	}
		// 		// } else if (!this.isInHQ) {
		// 		// 	const surroundingCells = this.director._grid.getCellsWithAdjacency(
		// 		// 		this,
		// 		// 		true
		// 		// 	);
		// 		// 	surroundingCells.forEach((cell) => {
		// 		// 		if (cell.hole && cell.wasJustMined) {
		// 		// 			possibleCells.push(cell);
		// 		// 		}
		// 		// 	});
		// 		// }
		// 		// console.error(this.itemHistory);
		// 		// if (possibleCells.length > 1 && this.hadTrap) {
		// 		// 	possibleCells.forEach((cell) => {
		// 		// 		cell.enemyTrapChance++;
		// 		// 	});
		// 		// 	// TODO should at least add in trap chance
		// 		// }
		// 		// if (possibleCells.length === 1) {
		// 		// 	if (!this.hadOre) {
		// 		// 		possibleCells[0].dugByEnemy(this.hasOre);
		// 		// 	}
		// 		// 	if (this.hadRadar) {
		// 		// 		possibleCells[0].enemyRadarChance += 5;
		// 		// 	} else if (this.hadTrap) {
		// 		// 		possibleCells[0].enemyTrapChance += 5;
		// 		// 	}
		// 		// }
		// 	}
		// }
	}
}

export default EnemyRobot;
