import config from './config.js';
import Game from './Game.js';
config.generate();

let game = new Game();

while (true) {
	game.updateScoreData(...readline().split(' '));
	for (let i = 0; i < config.MAP_HEIGHT; i++) {
		let mapDataInputs = readline().split(' ');
		for (let j = 0; j < config.MAP_WIDTH; j++) {
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
			return robot.consoleWait('NOTHINGTODO');
		}
	});
	game.turnOver();
}
