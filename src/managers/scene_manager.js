import * as Pioneer from 'pioneer-js';
import { Entity, CMTSComponent } from 'pioneer-scripts';
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
				label: true
			},
			sc_mars_reconnaissance_orbiter: {
				clickable: false,
				trail: true,
				label: true
			}
		};

		/**
		 * Check for label click if camera is still in transition.
		 * @type {boolean}
		 */
		this._isTransitioning = false;
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
		Entity.create('sc_mars_science_laboratory_landing_site', this._scene);
		Entity.create('sc_perseverance_landing_site', this._scene);
		Entity.create('sc_maven', this._scene);
		Entity.create('sc_mars_reconnaissance_orbiter', this._scene);
		SetupSpacecraft.setup(this._scene);
	}

	/**
	 * Creates the CMTS for mars.
	 * @private
	 */
	async _createCMTS() {
		this._pioneer.registerComponentType('cmts', CMTSComponent);
		const mars = this._scene.getEntity('mars');
		// Get the spheroid from the spheroid coomponent.
		/** @type {Pioneer.Spheroid} */
		// Remove the spheroid component.
		mars.getComponentByType('spheroid').setEnabled(false);
		// mars.removeComponent(mars.getComponentByType('spheroid'));
		// mars.get('atmosphere').setEnabled(false);
		/** @type {CMTSComponent} */
		const cmts = mars.addComponent('cmts');
		cmts.setMaxLevel(12);
		cmts.setLightSource(this._scene.get('sun', 'lightSource'));
		cmts.setRadii(3396.190 - 0.01469, 3396.190 - 0.01469); // Offset to get the rover landing on its wheels.
		cmts.setBaseUrl('color', '$DYNAMIC_ASSETS_URL/cmts/mars/color');
		cmts.setBaseUrl('height', '$DYNAMIC_ASSETS_URL/cmts/mars/height');
		cmts.setHeightScale(1);
		cmts.setPlanetographic(false);

		cmts.addTileOffset(new Pioneer.Vector3(700.6128653358727, 3140.020080650305, 1073.622947405036), 1, 12, 1590, 2747, 1592, 2749);

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
				trail.setWidths(0, 5);
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
			}

			if (divComponent instanceof Pioneer.DivComponent) {
				if (this._entityInfo[entityName] === undefined || !this._entityInfo[entityName].label) {
					divComponent.setEnabled(false);
				}
				else {
					if (this._entityInfo[entityName] !== undefined && this._entityInfo[entityName].fadeWhenCloseToParent !== undefined
						&& this._entityInfo[entityName].fadeWhenCloseToParent === false) {
						divComponent.setFadeWhenCloseToParent(false);
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
						div.addEventListener('mouseup', (event) => {
							event.preventDefault();
							event.stopPropagation();
						}, true);
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
