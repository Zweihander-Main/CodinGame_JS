import Robot from './Robot.js';

class EnemyRobot extends Robot {
	constructor(x, y, type, id, item, director) {
		super(x, y, type, id, item, director);
	}

	turnStart() {
		super.turnStart();
		// if (!this.hadOre && this.hasOre) {
		// 	this.currentCell.dugByEnemy(true);
		// }
		// if (this.hadRadar && !this.hasRadar) {
		// 	this.currentCell.enemyRadar = true;
		// }
		// if (this.hadTrap && !this.hadTrap) {
		// 	this.currentCell.enemyTrap = true;
		// }
	}
}

export default EnemyRobot;
