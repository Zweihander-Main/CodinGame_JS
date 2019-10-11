import Entity from '../Pos/Entity.js';

class EntityDirector {
	constructor(game) {
		this._game = game;
		this.reset(); // this.entities[]
	}

	reset() {
		this.entities = [];
	}

	getEntity(id) {
		return this.entities.find((entity) => {
			return entity.id === id;
		});
	}

	createNewEntity(x, y, type, id) {
		return new Entity(x, y, type, id);
	}

	updateEntityData(entity, x, y, item) {
		if (entity.x !== x || entity.y !== y) {
			entity.x = x;
			entity.y = y;
			entity.updateCell(this._game.grid.getCell(x, y));
		} else if (entity.currentCell === null) {
			entity.updateCell(this._game.grid.getCell(x, y));
		}
		if (item) {
			entity.updateItem(item);
		}
	}

	update(x, y, type, id, item) {
		let found = this.getEntity(id);
		if (found) {
			this.updateEntityData(found, x, y, item);
		} else {
			let newEntity = this.createNewEntity(x, y, type, id, item);
			this.entities.push(newEntity);
			this.updateEntityData(newEntity, x, y, item);
		}
	}

	get length() {
		return this.entities.length;
	}

	turnStart() {}

	turnOver() {}
}

export default EntityDirector;
