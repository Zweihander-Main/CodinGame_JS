import EntityDirector from './EntityDirector.js';

class RobotDirector extends EntityDirector {
	constructor(game) {
		super(game);
	}

	getCell(x, y) {
		return this._game.grid.getCell(x, y);
	}

	isCellWithinAdjacency(currentCell, destinationCell) {
		return this._game.grid.isCellWithinAdjacency(
			currentCell,
			destinationCell
		);
	}
}

export default RobotDirector;
