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
			let cell = this._game.grid.getCell(x, y);
			entity.updateCell(cell);
			cell.updateEntityData(entity);
		} else if (entity.currentCell === null) {
			let cell = this._game.grid.getCell(x, y);
			entity.updateCell(cell);
			cell.updateEntityData(entity);
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
