import Entity from '../Pos/Entity.js';

class EntityDirector {
	constructor(game) {
		this._game = game;
		this._grid = game.grid;
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
		let cell = this._grid.getCell(x, y);
		entity.update(x, y, cell, item);
		if (cell) {
			cell.updateEntityData(entity);
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
