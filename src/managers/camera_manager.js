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
	async goToEntity(name) {
		const cameraEntity = this._defaultScene.get('camera');
		const focusEntity = this._defaultScene.get(name);
		await SceneHelpers.waitTillEntitiesInPlace(this._defaultScene, new Set([focusEntity.getName()]));
		const distance = Cameras.getDistanceToFitEntities(cameraEntity, cameraEntity.getOrientation(), focusEntity, []);
		await Cameras.goToEntity(cameraEntity, focusEntity, {
			up: false,
			distance: distance
		});
		const orbit = cameraEntity.get('orbit');
		if (orbit instanceof Pioneer.OrbitController) {
			orbit.slowWhenCloseToParent(true);
		}
		const zoom = cameraEntity.get('zoom');
		if (zoom instanceof Pioneer.ZoomController) {
			zoom.setUseSpheroidRadiusForDistance(true);
		}
		cameraEntity.addController('roll');
		// Apply the target text.
		// const div = focusEntity.getComponentByType('div');
		// if (div instanceof Pioneer.DivComponent) {
		// 	this.__element('target').innerHTML = div.getDiv().innerHTML;
		// }

		const cameraComponent = cameraEntity.getComponentByType('camera');
		this._pioneer.addCallback(() => {
			const distance = cameraEntity.getPosition().magnitude();
			cameraComponent.setNearDistance(Math.max(0.001, distance * 0.1));
			cameraComponent.setMidDistance(Math.max(0.1, distance * 10));
		}, true);
	}
}

export default CameraManager;
