import * as Pioneer from 'pioneer-js';
import { Cameras, SceneHelpers } from 'pioneer-scripts';
import { CameraManager as BaseCameraManager } from 'es6-ui-library';

/**
 * The Camera Manager class.
 */
class CameraManager extends BaseCameraManager {
	/**
	 * Moves the camera to an entity.
	 * @param {string} name
	 */
	// async goToEntity(name) {
	// 	const cameraEntity = this._defaultScene.get('camera');
	// 	const focusEntity = this._defaultScene.get(name);
	// 	await SceneHelpers.waitTillEntitiesInPlace(this._defaultScene, new Set([focusEntity.getName()]));
	// 	const distance = Cameras.getDistanceToFitEntities(cameraEntity, cameraEntity.getOrientation(), focusEntity, []);
	// 	await Cameras.goToEntity(cameraEntity, focusEntity, {
	// 		up: false,
	// 		distance: distance
	// 	});

	// 	// Manage loading of components
	// 	for (let i = this._callbacks.loading.length - 1; i >= 0; i--) {
	// 		const callback = this._callbacks.loading[i];
	// 		callback(name, 'camera');
	// 	}
	// 	const promises = [];
	// 	const components = ['model', 'wmts', 'spheroid'];
	// 	for (let i = 0; i < components.length; i++) {
	// 		const component = this._defaultScene.get(name, components[i]);
	// 		if (component !== null) {
	// 			promises.push(component.getLoadedPromise());
	// 		}
	// 	}
	// 	Promise.all(promises).then(() => {
	// 		for (let i = this._callbacks.loaded.length - 1; i >= 0; i--) {
	// 			const callback = this._callbacks.loaded[i];
	// 			callback(name, 'camera');
	// 		}
	// 	});

	// 	const orbit = cameraEntity.get('orbit');
	// 	if (orbit instanceof Pioneer.OrbitController) {
	// 		orbit.slowWhenCloseToParent(true);
	// 	}
	// 	const zoom = cameraEntity.get('zoom');
	// 	if (zoom instanceof Pioneer.ZoomController) {
	// 		zoom.setUseSpheroidRadiusForDistance(true);
	// 	}
	// 	cameraEntity.addController('roll');
	// 	// Apply the target text.
	// 	// const div = focusEntity.getComponentByType('div');
	// 	// if (div instanceof Pioneer.DivComponent) {
	// 	// 	this.__element('target').innerHTML = div.getDiv().innerHTML;
	// 	// }

	// 	const cameraComponent = cameraEntity.getComponentByType('camera');
	// 	this._pioneer.addCallback(() => {
	// 		const distance = cameraEntity.getPosition().magnitude();
	// 		cameraComponent.setNearDistance(Math.max(0.001, distance * 0.1));
	// 		cameraComponent.setMidDistance(Math.max(0.1, distance * 10));
	// 	}, true);
	// }

	async alignWithTarget(id, target, { planeId = 'mars', distance = undefined, cinematic = false, duration = 0.75, verticalOffset = 0, horizontalOffset = 0 } = {}) {
		// Entities
		const scEntity = this._defaultScene.get(id);
		await SceneHelpers.waitTillEntitiesInPlace(this._defaultScene, new Set([scEntity.getName()]));
		const targetEntity = this._defaultScene.get(target);
		const planeEntity = this._defaultScene.get(planeId);

		const scRadius = scEntity.getOcclusionRadius();
		const minRadius = 1.2 * scRadius;

		// Target view
		const dest = new Pioneer.Vector3();
		scEntity.getPositionRelativeToEntity(dest, Pioneer.Vector3.Zero, targetEntity);
		dest.normalize(dest);

		// Target up
		const up = new Pioneer.Vector3();
		targetEntity.getPositionRelativeToEntity(up, Pioneer.Vector3.Zero, planeEntity);
		up.normalize(up);

		// Horizontal
		const horizontal = new Pioneer.Vector3();
		horizontal.cross(dest, up);
		horizontal.normalize(horizontal);

		// Make sure up is orthogonal
		up.cross(horizontal, dest);

		// Offset dest vector so target is below or above
		if (verticalOffset !== 0) {
			const orientationOffset = new Pioneer.Quaternion();
			const angleOffset = Pioneer.MathUtils.degToRad(verticalOffset);
			orientationOffset.setFromAxisAngle(horizontal, angleOffset);
			dest.rotate(orientationOffset, dest);
		}

		// TODO: Optional: Update up after rotation
		// up.cross(horizontal, dest);

		// Offset dest vector so target is on the left or right
		if (horizontalOffset !== 0) {
			const orientationOffset = new Pioneer.Quaternion();
			const angleOffset = Pioneer.MathUtils.degToRad(horizontalOffset);
			orientationOffset.setFromAxisAngle(up, angleOffset);
			dest.rotate(orientationOffset, dest);
		}

		// Distance
		if (distance === undefined) {
			dest.mult(dest, 10 * scRadius);
		}
		else {
			dest.mult(dest, distance);
		}

		await this.goToEntity(id, { destination: dest, cinematic, minRadius, destinationUp: up, duration });
	}

	async viewFromBehind(id, { upMode = 'planetUp', planeId = 'mars', distance = undefined, cinematic = false, duration = 0.75, verticalOffset = 0, horizontalOffset = 0 } = {}) {
		// Entities
		const scEntity = this._defaultScene.get(id);
		await SceneHelpers.waitTillEntitiesInPlace(this._defaultScene, new Set([scEntity.getName()]));
		const planeEntity = this._defaultScene.get(planeId);

		const scRadius = scEntity.getOcclusionRadius();
		const minRadius = 1.2 * scRadius;

		// View from behind
		const dest = new Pioneer.Vector3();
		scEntity.getOrientation().getAxis(dest, 2);
		dest.normalize(dest);
		dest.mult(dest, -1);

		// Up vector modes
		const up = new Pioneer.Vector3();
		if (upMode === 'planetUp') {
			planeEntity.getOrientation().getAxis(up, 2);
			up.normalize(up);
		}
		else if (upMode === 'surfaceUp') {
			scEntity.getPositionRelativeToEntity(up, Pioneer.Vector3.Zero, planeEntity);
			up.normalize(up);
		}

		// Horizontal
		const horizontal = new Pioneer.Vector3();
		horizontal.cross(dest, up);
		horizontal.normalize(horizontal);

		// Make sure up is orthogonal
		up.cross(horizontal, dest);

		// Offset dest vector so target is below or above
		if (verticalOffset !== 0) {
			const orientationOffset = new Pioneer.Quaternion();
			const angleOffset = Pioneer.MathUtils.degToRad(verticalOffset);
			orientationOffset.setFromAxisAngle(horizontal, angleOffset);
			dest.rotate(orientationOffset, dest);
		}

		// TODO: Optional: Update up after rotation
		// up.cross(horizontal, dest);

		// Offset dest vector so target is on the left or right
		if (horizontalOffset !== 0) {
			const orientationOffset = new Pioneer.Quaternion();
			const angleOffset = Pioneer.MathUtils.degToRad(horizontalOffset);
			orientationOffset.setFromAxisAngle(up, angleOffset);
			dest.rotate(orientationOffset, dest);
		}

		// Update horizontal axis
		horizontal.cross(dest, up);
		horizontal.normalize(horizontal);

		// Distance
		// const cameraOrientation = new Pioneer.Quaternion();
		// cameraOrientation.setFromAxes(horizontal, dest, undefined);
		// const distToFit = Cameras.getDistanceToFitEntities(this._cameraEntity, cameraOrientation, scEntity, [scEntity, targetEntity]);
		// const dist = distToFit * 1.3;
		// dest.mult(dest, dist);

		if (distance === undefined) {
			dest.mult(dest, 10 * scRadius);
		}
		else {
			dest.mult(dest, distance);
		}

		await this.goToEntity(id, { destination: dest, cinematic, minRadius, destinationUp: up, duration });
	}

	async viewFromSide(id, { planeId = 'mars', distance = undefined, cinematic = false, duration = 0.75, verticalOffset = 0, horizontalOffset = 0, forwardVector = 'x-axis' } = {}) {
		// Entities
		const scEntity = this._defaultScene.get(id);
		await SceneHelpers.waitTillEntitiesInPlace(this._defaultScene, new Set([scEntity.getName()]));
		// const targetEntity = this._defaultScene.get(target);
		const planeEntity = this._defaultScene.get(planeId);

		const scRadius = scEntity.getOcclusionRadius();
		const minRadius = 1.2 * scRadius;

		// View from side
		const dest = new Pioneer.Vector3();
		const forward = new Pioneer.Vector3();
		let forwardIndex = 0;
		if (forwardVector === 'z-axis') {
			forwardIndex = 2;
		}
		else if (forwardVector === 'y-axis') {
			forwardIndex = 1;
		}
		scEntity.getOrientation().getAxis(forward, forwardIndex);
		forward.normalize(forward);
		const scPosition = new Pioneer.Vector3();
		scEntity.getPositionRelativeToEntity(scPosition, Pioneer.Vector3.Zero, planeEntity);
		scPosition.normalize(scPosition);
		dest.cross(forward, scPosition);
		dest.normalize(dest);
		dest.mult(dest, -1);

		// Position up
		const up = new Pioneer.Vector3();
		scEntity.getPositionRelativeToEntity(up, Pioneer.Vector3.Zero, planeEntity);
		up.normalize(up);

		// Horizontal
		const horizontal = new Pioneer.Vector3();
		horizontal.cross(dest, up);
		horizontal.normalize(horizontal);

		// Make sure up is orthogonal
		up.cross(horizontal, dest);

		// Offset dest vector so target is below or above
		if (verticalOffset !== 0) {
			const orientationOffset = new Pioneer.Quaternion();
			const angleOffset = Pioneer.MathUtils.degToRad(verticalOffset);
			orientationOffset.setFromAxisAngle(horizontal, angleOffset);
			dest.rotate(orientationOffset, dest);
		}

		// TODO: Optional: Update up after rotation
		// up.cross(horizontal, dest);

		// Offset dest vector so target is on the left or right
		if (horizontalOffset !== 0) {
			const orientationOffset = new Pioneer.Quaternion();
			const angleOffset = Pioneer.MathUtils.degToRad(horizontalOffset);
			orientationOffset.setFromAxisAngle(up, angleOffset);
			dest.rotate(orientationOffset, dest);
		}

		// Update horizontal axis
		horizontal.cross(dest, up);
		horizontal.normalize(horizontal);

		// Distance
		if (distance === undefined) {
			dest.mult(dest, 10 * scRadius);
		}
		else {
			dest.mult(dest, distance);
		}

		await this.goToEntity(id, { destination: dest, cinematic, minRadius, destinationUp: up, duration });
	}
}

export default CameraManager;
