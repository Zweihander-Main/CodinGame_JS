/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import config from './config.js';
import Game from './Game.js';

const readlineFunc = () => {
	if (config.PRINT_READLINE) {
		let saved = readline();
		console.error('READLINE:' + saved);
		return saved;
	} else {
		return readline();
	}
};

let prevTime = new Date().getTime();
global.printTime = (message = '', noPrint = false, msCutoff = 0) => {
	// defaults to dropping 0ms values
	if (config.DEBUG_TIME) {
		const newTime = new Date().getTime();
		const diff = newTime - prevTime;
		if (!noPrint && diff > msCutoff) {
			console.error('TIMING-' + message + ': ' + diff + 'ms');
		}
		prevTime = newTime;
	}
};

config.generate(readlineFunc);

let game = new Game();
printTime('init', true);

while (true) {
	printTime('To Loop Start', true);
	game.updateScoreData(...readlineFunc().split(' '));
	printTime('Extra Holdover Time');
	for (let i = 0; i < config.MAP_HEIGHT; i++) {
		let mapDataInputs = readlineFunc().split(' ');
		for (let j = 0; j < config.MAP_WIDTH; j++) {
			game.updateCell(
				j,
				i,
				mapDataInputs[2 * j],
				mapDataInputs[2 * j + 1]
			);
		}
	}
	printTime('Update Map Data', true);
	game.updateMiscData(...readlineFunc().split(' '));
	printTime('Update Misc Data', true);
	for (let i = 0, len = game.entityCount; i < len; i++) {
		game.updateEntityData(...readlineFunc().split(' '));
	}
	printTime('Update Entity Data', true);
	game.turnStart();
	printTime('turnStart');
	game.myRobots.entities.forEach((robot) => {
		if (robot.commandToExecute.command !== null) {
			return robot.executeCommand();
		} else {
			return robot.consoleWait('NOTHINGTODO');
		}
	});
	printTime('Execute', true);
	game.turnOver();
	printTime('turnOver', true);
}
