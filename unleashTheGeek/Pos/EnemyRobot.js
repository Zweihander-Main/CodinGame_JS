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
	}
}

export default EnemyRobot;
