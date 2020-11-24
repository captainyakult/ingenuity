import * as Pioneer from 'pioneer-js';
import { Entity, CMTSComponent } from 'pioneer-scripts';
import { SceneManager as BaseSceneManager } from 'es6-ui-library';
import { SetupSpacecraft } from '../setup_spacecraft';

/**
 * Scene Manager class.
 */
class SceneManager extends BaseSceneManager {
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
		Entity.createGroup('stars', this._scene, { skybox: true, starfield: false, skyboxResolution: 1024 });
		Entity.createGroup('planets', this._scene);
		Entity.createGroup('mars,moons', this._scene);
		Entity.create('sc_mars_science_laboratory_landing_site', this._scene);
		Entity.create('sc_perseverance_landing_site', this._scene);
		SetupSpacecraft.setup(this._scene);
	}

	/**
	 * Creates the CMTS for mars.
	 * @private
	 */
	_createCMTS() {
		this._pioneer.registerComponentType('cmts', CMTSComponent);
		const mars = this._scene.getEntity('mars');
		mars.addComponent('gizmo');
		// Get the spheroid from the spheroid coomponent.
		/** @type {Pioneer.Spheroid} */
		// Remove the spheroid component.
		mars.getComponentByType('spheroid').setEnabled(false);
		// mars.removeComponent(mars.getComponentByType('spheroid'));
		// mars.get('atmosphere').setEnabled(false);
		/** @type {CMTSComponent} */
		const cmts = mars.addComponent('cmts');
		cmts.setMaxLevel(11);
		cmts.setLightSource(this._scene.get('sun', 'lightSource'));
		cmts.setRadii(3396.190 - 0.01549952582, 3396.190 - 0.01549952582); // Offset to get the rover landing on its wheels.
		cmts.setBaseUrl('color', '$DYNAMIC_ASSETS_URL/cmts/mars/color');
		cmts.setBaseUrl('height', '$DYNAMIC_ASSETS_URL/cmts/mars/height');
		cmts.setHeightScale(1);
		cmts.setPlanetographic(false);

		cmts.addTileOffset(new Pioneer.Vector3(700.6128653358727, 3140.020080650305, 1073.622947405036), 1, 15, 12727, 21985, 12729, 21987);
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
		// Populate labels
		const clickableEntities = [
			'sc_perseverance_landing_site',
			'sc_perseverance_rover',
			'sc_perseverance_cruise_stage',
			'sc_perseverance_backshell',
			'sc_perseverance_heat_shield',
			'sc_perseverance_descent_stage',
			'mars', 'earth', 'phobos', 'deimos'];
		for (let i = 0, l = this._scene.getNumEntities(); i < l; i++) {
			const entity = this._scene.getEntity(i);
			const divComponent = entity.get('div');
			if (divComponent instanceof Pioneer.DivComponent) {
				const div = divComponent.getDiv();
				if (clickableEntities.includes(entity.getName())) {
					div.addEventListener('click', async (event) => {
						await this.goToEntity(entity.getName());
						this._target = entity.getName();
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

export default SceneManager;
