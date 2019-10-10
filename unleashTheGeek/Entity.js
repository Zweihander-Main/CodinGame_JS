import Pos from './Pos.js';

class Entity extends Pos {
	constructor(x, y, type, id, gameInstance) {
		super(x, y);
		this.id = id;
		this.type = type;
		this.gameInstance = gameInstance;
	}
}

export default Entity;
