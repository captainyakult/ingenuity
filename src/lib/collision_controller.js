/** @module mars2020 */
import * as Pioneer from 'pioneer-js';

/** The collision controller.
 * @extends BaseController */
class CollisionController extends Pioneer.BaseController {
	/**
	 * Constructor.
	 * @param {string} type - the type of the controller
	 * @param {string} name - the name of the controller
	 * @param {Entity} entity - the parent entity
	 * @package
	 */
	constructor(type, name, entity) {
		super(type, name, entity);
		this._collisionEntity = null;
		this._threshold = -2.231;

		// Let the base controller know that this changes the position
		this.addModifiedState('position');
	}

	/**
	 * Gets the threshold value.
	 */
	getThreshold() {
		return this._threshold;
	}

	/**
	 * Sets the threshold value in km.
	 * @param {number} threshold
	 */
	setThreshold(threshold) {
		this._threshold = threshold;
	}

	/**
	 * Gets the target entity with which this entity will track.
	 * @returns {Entity}
	 */
	getCollisionEntity() {
		return this._collisionEntity;
	}

	/**
	 * Sets the target entity with which this entity will track.
	 * @param {Entity} targetEntity
	 */
	setCollisionEntity(targetEntity) {
		if (this._collisionEntity !== null) {
			this.removeDependentState(this._collisionEntity.getName(), 'position');
			this.removeDependentState(this._collisionEntity.getName(), 'orientation');
		}
		this._collisionEntity = targetEntity;
		if (this._collisionEntity !== null) {
			this.addDependentState(this._collisionEntity.getName(), 'position');
			this.addDependentState(this._collisionEntity.getName(), 'orientation');
		}
	}

	/**
	 * Updates the orientation.
	 * @package
	 */
	__update() {
		const positionRelativeToEntity = Pioneer.Vector3.pool.get();
		const parentToEntity = Pioneer.Vector3.pool.get();
		const lla = Pioneer.LatLonAlt.pool.get();

		this.getEntity().getPositionRelativeToEntity(positionRelativeToEntity, Pioneer.Vector3.Zero, this._collisionEntity);
		const spheroid = this._collisionEntity.get('spheroid').getSpheroid();
		spheroid.llaFromXYZ(lla, positionRelativeToEntity);

		// Limit camera to threshold
		if (lla.alt < this._threshold) {
			// Set altitude to zero
			lla.alt = this._threshold;

			// Calculate new position relative to collision entity
			spheroid.xyzFromLLA(positionRelativeToEntity, lla);

			// Translate position to relative to parent
			this.getEntity().getParent().getPositionRelativeToEntity(parentToEntity, Pioneer.Vector3.Zero, this._collisionEntity);
			positionRelativeToEntity.sub(positionRelativeToEntity, parentToEntity);

			// Set new position for camera
			this.getEntity().setPosition(positionRelativeToEntity);
		}

		Pioneer.LatLonAlt.pool.release(lla);
		Pioneer.Vector3.pool.release(positionRelativeToEntity);
		Pioneer.Vector3.pool.release(parentToEntity);
	}
}

export default CollisionController;
