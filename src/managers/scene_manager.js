import * as Pioneer from 'pioneer-js';
import { Entity, Mapping } from 'pioneer-scripts';
import { SceneManager as BaseSceneManager } from 'es6-ui-library';
import { SetupSpacecraft } from '../setup_spacecraft';

/**
 * Scene Manager class.
 */
class SceneManager extends BaseSceneManager {
	/**
	 * Constructs the scene manager.
	 * @param {BaseApplication} app
	 * @param {Pioneer.Engine} engine
	 */
	constructor(app, engine) {
		super(app, engine);
		this._entityInfo = {
			sc_perseverance_landing_site: {
				clickable: false,
				label: true
			},
			sc_perseverance: {
				clickable: true,
				label: true,
				trail: true,
				fadeWhenCloseToParent: false
			},
			sc_perseverance_rover: {
				clickable: true,
				label: true
			},
			sc_perseverance_cruise_stage: {
				clickable: true,
				label: true
			},
			sc_perseverance_backshell: {
				clickable: true,
				label: true
			},
			sc_perseverance_heat_shield: {
				clickable: true,
				label: true
			},
			sc_perseverance_descent_stage: {
				clickable: true,
				label: true
			},
			sc_perseverance_ballast_0: {
				clickable: false,
				label: true
			},
			sc_perseverance_ballast_1: {
				clickable: false,
				label: true
			},
			sc_perseverance_chutecap: {
				clickable: false,
				label: true
			},
			sc_perseverance_parachute: {
				clickable: false,
				label: true
			},
			earth: {
				clickable: false,
				label: true
			},
			sc_maven: {
				clickable: false,
				trail: true,
				trailLength: 300,
				label: true
			},
			sc_mars_reconnaissance_orbiter: {
				clickable: false,
				trail: true,
				trailLength: 120,
				label: true
			}
		};

		/**
		 * Check for label click if camera is still in transition.
		 * @type {boolean}
		 */
		this._isTransitioning = false;

		/**
		 * The rocky patch color texture shared by the multiple rocky patches.
		 * @type {Pioneer.THREE.Texture}
		 * @private
		 */
		this._rockyPatchColorTexture = null;

		/**
		 * The rocky patch normal texture shared by the multiple rocky patches.
		 * @type {Pioneer.THREE.Texture}
		 * @private
		 */
		this._rockyPatchNormalTexture = null;
	}

	/**
	 * Populates the scene with objects.
	 */
	async populate() {
		this._createScene();
		this._createCMTS();
		this._makeTrailsBetter();
		this._populateLabelEvents();

		// Wait till everything is loaded, and then wait one more frame to make sure any positions are set.
		await this._scene.getLoadedPromise();
		await this._pioneer.waitUntilNextFrame();
	}

	/**
	 * Creates the scene.
	 */
	_createScene() {
		Entity.createGroup('stars', this._scene, { skybox: false, starfield: true, skyboxResolution: 1024 });
		Entity.createGroup('planets', this._scene);
		Entity.createGroup('mars,moons', this._scene);
		Entity.create('sc_maven', this._scene);
		Entity.create('sc_mars_reconnaissance_orbiter', this._scene);
		SetupSpacecraft.setup(this._scene);
		this._setupRockyPatches();
	}

	/**
	 * Creates the CMTS for mars.
	 * @private
	 */
	async _createCMTS() {
		const mars = this._scene.getEntity('mars');
		Mapping.set(this._scene, 'mars', 'cmts');
		const cmts = /** @type {Pioneer.CMTSComponent} */(mars.get('cmts'));
		cmts.setMaxLevel(12);

		// Add loading icon
		this.addLoading('mars', 'cmts');
		await this.terrainIsReady(cmts);
		this.removeLoading('mars', 'cmts');
	}

	/**
	 * Makes the trails better looking.
	 * @private
	 */
	_makeTrailsBetter() {
		for (let i = 0, l = this._scene.getNumEntities(); i < l; i++) {
			const entity = this._scene.getEntity(i);
			const trail = entity.getComponentByType('trail');
			if (trail instanceof Pioneer.TrailComponent) {
				trail.setWidths(0, 3);
				trail.setColor(new Pioneer.Color(1, 1, 1, 0.15));
			}
		}
	}

	/**
	 * Sets up the dynamic environment map for sc_perseverance.
	 * @private
	 */
	setupDynamicEnvironmentMap() {
		// Dynamic environment map
		const dynEnvMap = this._scene.get('camera').addComponent('dynEnvMap');
		if (dynEnvMap instanceof Pioneer.DynamicEnvironmentMapComponent) {
			this._scene.get('sc_perseverance_rover', 'model').setDynamicEnvironmentMapComponent(dynEnvMap);
			this._scene.get('sc_perseverance_cruise_stage', 'model').setDynamicEnvironmentMapComponent(dynEnvMap);
			this._scene.get('sc_perseverance_chutecap', 'model').setDynamicEnvironmentMapComponent(dynEnvMap);
			this._scene.get('sc_perseverance_parachute', 'model').setDynamicEnvironmentMapComponent(dynEnvMap);
			this._scene.get('sc_perseverance_backshell', 'model').setDynamicEnvironmentMapComponent(dynEnvMap);
			this._scene.get('sc_perseverance_heat_shield', 'model').setDynamicEnvironmentMapComponent(dynEnvMap);
			this._scene.get('sc_perseverance_descent_stage', 'model').setDynamicEnvironmentMapComponent(dynEnvMap);
		}
	}

	/**
	 * Sets up a single rocky patch on the ground.
	 * @param {Pioneer.Vector3} offset
	 * @private
	 */
	_setupRockyPatch(number, offset, rotation) {
		const entity = this._scene.addEntity('patch_entity_' + number);
		entity.setExtentsRadius(0.1);
		entity.addParentingTableEntry(Number.NEGATIVE_INFINITY, 'mars');
		// entity.addComponent('gizmo');
		const model = entity.addComponent('model');
		if (model instanceof Pioneer.ModelComponent) {
			model.setUrl('assets/models/RockyPatch/edl2020_rockPatch.gltf');
			model.setResourcesLoadedCallback(() => {
				const oldMaterial = model.getMaterial('RockPatch');
				const newMaterial = Pioneer.MaterialUtils.get();
				if (oldMaterial !== null && this._rockyPatchColorTexture === null) {
					this._rockyPatchColorTexture = oldMaterial.uniforms['colorTexture'].value;
					this._rockyPatchNormalTexture = oldMaterial.uniforms['normalTexture'].value;
				}
				newMaterial.uniforms['colorTexture'].value = this._rockyPatchColorTexture;
				newMaterial.uniforms['normalTexture'].value = this._rockyPatchNormalTexture;
				if (oldMaterial !== null) {
					newMaterial.uniforms['normalScale'].value = oldMaterial.uniforms['normalScale'].value;
				}
				newMaterial.defines['normalMap'] = true;
				newMaterial.transparent = true;
				newMaterial.blending = Pioneer.THREE.NormalBlending;
				newMaterial.depthWrite = false;
				newMaterial.needsUpdate = true;
				model.updateMaterial('RockPatch', newMaterial);
				model.getThreeJsObjects()[0].renderOrder = number - 1000;
			});
		}
		const fixedGround = entity.addController('fixed');
		if (fixedGround instanceof Pioneer.FixedController) {
			const rot90 = new Pioneer.Quaternion();
			rot90.setFromAxisAngle(Pioneer.Vector3.XAxis, -Math.PI / 2.0);
			// Landing orientation of perseverance
			const orientation = new Pioneer.Quaternion(-0.3687957252164953, -0.6453124355946519, -0.5010749764034842, 0.44326678372193135);
			orientation.mult(orientation, rot90);
			const rot = new Pioneer.Quaternion();
			rot.setFromAxisAngle(Pioneer.Vector3.ZAxis, -1 * Math.PI / 180);
			orientation.mult(orientation, rot);
			offset.y -= 0.0008;
			offset.rotate(orientation, offset);
			rot.setFromAxisAngle(Pioneer.Vector3.YAxis, rotation * Math.PI / 180);
			orientation.mult(orientation, rot);
			fixedGround.setOrientation(orientation);
			const position = new Pioneer.Vector3(700.0259352242308, 3140.146926550959, 1074.6136518279732);
			position.add(position, offset);
			fixedGround.setPosition(position);
		}
		const rotateByEntityOrientationSeparated = entity.addController('rotateByEntityOrientation');
		if (rotateByEntityOrientationSeparated instanceof Pioneer.RotateByEntityOrientationController) {
			rotateByEntityOrientationSeparated.setRotatingOrientation(true);
		}
	}

	/**
	 * Sets up rocky patches on the ground.
	 * @private
	 */
	_setupRockyPatches() {
		for (let i = 0; i < 1; i++) {
			const radius = 0.04 * Math.random();
			const angle = Math.random() * Math.PI * 2.0;
			const rotation = Math.random() * 360;
			this._setupRockyPatch(i, new Pioneer.Vector3(0, 0, 0), 0);
		}
	}

	/**
	 * Populates all of the labels click events.
	 * @private
	 */
	_populateLabelEvents() {
		for (let i = 0, l = this._scene.getNumEntities(); i < l; i++) {
			const entity = this._scene.getEntity(i);
			const entityName = entity.getName();
			const divComponent = entity.get('div');
			const trailComponent = entity.get('trail');

			if (trailComponent instanceof Pioneer.TrailComponent) {
				if (this._entityInfo[entityName] === undefined || !this._entityInfo[entityName].trail) {
					trailComponent.setEnabled(false);
				}
				if (this._entityInfo[entityName] !== undefined && this._entityInfo[entityName].trailLength !== undefined) {
					if (entity.get('coverage') !== null) {
						entity.get('coverage').clearCoverages();
					}
					trailComponent.setStartTime(this._entityInfo[entityName].trailLength);
				}
			}

			if (divComponent instanceof Pioneer.DivComponent) {
				if (this._entityInfo[entityName] === undefined || !this._entityInfo[entityName].label) {
					divComponent.setEnabled(false);
				}
				else {
					if (this._entityInfo[entityName] !== undefined && this._entityInfo[entityName].fadeWhenCloseToParent !== undefined
						&& this._entityInfo[entityName].fadeWhenCloseToParent === false) {
						divComponent.setFadeWhenCloseToEntity('sun');
					}
					const div = divComponent.getDiv();
					if (this._entityInfo[entityName] !== undefined && this._entityInfo[entityName].clickable === true) {
						div.addEventListener('click', async (event) => {
							// Don't execute further if it's already in transition
							if (this._isTransitioning) {
								return;
							}
							this._isTransitioning = true;
							await this._app.getManager('camera').goToEntity(entity.getName());
							this._isTransitioning = false;
							event.preventDefault();
						}, false);
						div.addEventListener('mousemove', (event) => {
							event.preventDefault();
						}, true);
						div.style.cursor = 'pointer';
					}
					else {
						div.classList.add('disabled');
					}
				}
			}
		}
	}
}

export default SceneManager;
