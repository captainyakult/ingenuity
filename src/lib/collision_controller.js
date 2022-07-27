/** @module mars2020 */
import * as Pioneer from 'pioneer-js';

/**
 * The collision controller.
 */
class CollisionController extends Pioneer.BaseController {
	/**
	 * Constructor.
	 * @param {string} type - the type of the controller
	 * @param {string} name - the name of the controller
	 * @param {Pioneer.Entity} entity - the parent entity
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
	 * @returns {Pioneer.Entity | null}
	 */
	getCollisionEntity() {
		return this._collisionEntity;
	}

	/**
	 * Sets the target entity with which this entity will track.
	 * @param {Pioneer.Entity} targetEntity
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
	 * @override
	 */
	__update() {
		const xyzCamera = Pioneer.Vector3.pool.get();
		const parentToEntity = Pioneer.Vector3.pool.get();
		const llaCamera = Pioneer.LatLonAlt.pool.get();
		const llaGround = Pioneer.LatLonAlt.pool.get();

		if (this._collisionEntity === null) {
			return;
		}

		// Get the position of the camera as an LLA.
		this.getEntity().getPositionRelativeToEntity(xyzCamera, Pioneer.Vector3.Zero, this._collisionEntity);
		xyzCamera.rotateInverse(this._collisionEntity.getOrientation(), xyzCamera);
		const spheroid = /** @type {Pioneer.SpheroidComponent} */(this._collisionEntity.getComponentByType('spheroid'));
		spheroid.llaFromXYZ(llaCamera, xyzCamera);

		// Get the equivalent position on the ground of the CMTS. If the CMTS tiles aren't loaded it, do nothing.
		const cmts = /** @type {Pioneer.CMTSComponent} */(this._collisionEntity.getComponentByType('cmts'));
		if (!cmts.areTilesLoaded()) {
			return;
		}
		const xyzGround = Pioneer.Vector3.pool.get();
		cmts.getGroundPosition(xyzGround, xyzCamera, 0.002);
		spheroid.llaFromXYZ(llaGround, xyzGround);
		Pioneer.Vector3.pool.release(xyzGround);
		
		// Limit camera to threshold
		if (llaCamera.alt < llaGround.alt) {
			// Clamp the camera altitude.
			llaCamera.alt = llaGround.alt;

			// Calculate new position relative to collision entity
			spheroid.xyzFromLLA(xyzCamera, llaCamera);
			xyzCamera.rotate(this._collisionEntity.getOrientation(), xyzCamera);

			// Translate position to relative to parent
			this.getEntity().getParent().getPositionRelativeToEntity(parentToEntity, Pioneer.Vector3.Zero, this._collisionEntity);
			xyzCamera.sub(xyzCamera, parentToEntity);

			// Set new position for camera
			this.getEntity().setPosition(xyzCamera);
		}

		Pioneer.LatLonAlt.pool.release(llaGround);
		Pioneer.LatLonAlt.pool.release(llaCamera);
		Pioneer.Vector3.pool.release(xyzCamera);
		Pioneer.Vector3.pool.release(parentToEntity);
	}
}

export default CollisionController;
