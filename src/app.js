import * as Pioneer from 'pioneer-js';
import { Entity, Cameras, CMTSComponent, SceneHelpers } from 'pioneer-scripts';
import { UI } from 'ui';

const landingTime = 666953087;

export class Mars2020App extends UI.App {
	/**
	 * Constructs the app.
	 */
	constructor() {
		super();

		this._pioneer = new Pioneer.Engine(document.querySelector('.pioneer'));
		this._pioneer.getDownloader().setReplacement('STATIC_ASSETS_URL', window.config.staticAssetsUrl);
		this._pioneer.getDownloader().setReplacement('DYNAMIC_ASSETS_URL', window.config.dynamicAssetsUrl);

		// Setup the scene.
		this.createScene();

		Cameras.createFullSizeViewportAndCamera(this._scene);

		this._setupRouter();
		this._createCMTS();
		this._makeTrailsBetter();
		this._setupDynamicEnvironmentMap();
		this._populateLabelEvents();

		this._router.processURL();

		this.__insertComponent(UI.TimeControl, this.__element('time-control'), undefined, {
			id: 'time-control',
			attributes: new Map([['pioneer', this._pioneer]])
		});
		this.__insertComponent(UI.TimeInterval, this.__element('time-interval'), undefined, {
			id: 'time-interval',
			attributes: new Map([['pioneer', this._pioneer], ['timeOrigin', landingTime]])
		});

		this._pioneer.addCallback(() => {
			if (this._pioneer.getTime() <= landingTime) {
				this.__element('since-until').innerHTML = 'until';
			}
			else {
				this.__element('since-until').innerHTML = 'since';
			}
		}, true);
	}

	/**
	 * Creates the scene.
	 */
	createScene() {
		this._scene = this._pioneer.addScene('main');
		Entity.createGroup('stars', this._scene, { skybox: true, starfield: false, skyboxResolution: 1024 });
		Entity.createGroup('planets', this._scene);
		Entity.createGroup('mars,moons', this._scene);
		Entity.create('sc_mars_science_laboratory_landing_site', this._scene);
		Entity.create('sc_perseverance_landing_site', this._scene);
		Entity.create('sc_perseverance', this._scene);

		// Remove the earth and sun Mars2020 dynamo, and adjust the perseverance.mars dynamo to use the custom version.
		const perseverance = this._scene.getEntity('sc_perseverance');
		for (let i = 0; ; i++) {
			const dynamo = perseverance.getControllerByType('dynamo', i);
			if (dynamo === null) {
				break;
			}
			const parent = dynamo.getParent();
			if (parent === this._scene.get('earth') || parent === this._scene.get('sun')) {
				perseverance.removeController(dynamo);
				i--;
			}
			else if (parent === this._scene.get('mars') && dynamo instanceof Pioneer.DynamoController) {
				dynamo.setBaseUrl('assets/dynamo/sc_perseverance/mars/pos');
			}
		}

		// Create other Mars2020 parts
		Entity.createFromOptions('sc_perseverance_backshell', {
			radius: 0.0045,
			label: 'Mars 2020 Backshell',
			trail: {
				length: 10000000.0
			},
			// model: {
			// 	url: '$STATIC_ASSETS_URL/models/sc_perseverance/cruise/MSLcruiseStage.gltf'
			// },
			fixed: {
				orientation: Pioneer.Quaternion.Identity
			},
			dynamo: [{
				url: 'assets/dynamo/sc_perseverance/backshell/mars/pos',
				parent: 'mars',
				customUrl: true
			}],
			postCreateFunction: (entity) => {
				const trail = entity.get('trail');
				if (trail instanceof Pioneer.TrailComponent) {
					trail.setRelativeToParentOrientation(true);
					trail.resetPoints();
				}
			}
		}, this._scene);
		Entity.createFromOptions('sc_perseverance_heatshield', {
			radius: 0.0045,
			label: 'Mars 2020 Heatshield',
			trail: {
				length: 10000000.0
			},
			// model: {
			// 	url: '$STATIC_ASSETS_URL/models/sc_perseverance/cruise/MSLcruiseStage.gltf'
			// },
			fixed: {
				orientation: Pioneer.Quaternion.Identity
			},
			dynamo: [{
				url: 'assets/dynamo/sc_perseverance/heatshield/mars/pos',
				parent: 'mars',
				customUrl: true
			}],
			postCreateFunction: (entity) => {
				const trail = entity.get('trail');
				if (trail instanceof Pioneer.TrailComponent) {
					trail.setRelativeToParentOrientation(true);
					trail.resetPoints();
				}
			}
		}, this._scene);
	}

	/**
	 * Moves the camera to an entity.
	 * @param {string} name
	 */
	async goToEntity(name) {
		const cameraEntity = this._scene.get('camera');
		const focusEntity = this._scene.get(name);
		await SceneHelpers.waitTillEntitiesInPlace(this._scene, new Set([focusEntity.getName()]));
		const distance = Cameras.getDistanceToFitEntities(cameraEntity, cameraEntity.getOrientation(), focusEntity, []);
		await Cameras.goToEntity(cameraEntity, focusEntity, {
			up: false,
			distance: distance
		});
		const select = cameraEntity.addController('select');
		select.setCallback(async (entity) => {
			if (entity !== null) {
				await this.goToEntity(entity.getName());
				this._target = entity.getName();
				this._router.pushQuery({
					target: this._target
				}, true);
			}
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
		const div = focusEntity.getComponentByType('div');
		if (div instanceof Pioneer.DivComponent) {
			this.__element('target').innerHTML = div.getDiv().innerHTML;
		}
	}

	/**
	 * Sets up the router.
	 * @private
	 */
	_setupRouter() {
		this.router.addCallback(async (query) => {
			if (query.target) {
				if (this._target !== query.target) {
					this._target = query.target;
					this.goToEntity(query.target);
				}
			}
			else {
				this.goToEntity('sc_perseverance');
			}
			if (query.time) {
				let date;
				if (query.time.indexOf('U') !== -1) { // UTC
					date = new Date(query.time + (query.time.indexOf(':') !== -1 ? 'Z' : ''));
					// this._timeScrubber.setTime(date);
				}
				else { // ET
					const time = Number.parseFloat(query.time);
					date = new Date(Pioneer.TimeUtils.etToUnix(time) * 1000);
					// this._timeScrubber.setTime(new Date(Pioneer.TimeUtils.etToUnix(time) * 1000));
				}
				this._pioneer.setTime(Pioneer.TimeUtils.unixToEt(date.getTime() / 1000.0));
			}
			else {
				this._pioneer.setTime(666951475.928640);
				// this._timeScrubber.setTime(date);
			}
			if (query.rate) {
				this._pioneer.setTimeRate(Number.parseFloat(query.rate));
				// this._timeScrubber.setTimeRate(query.rate);
			}
			if (query.light) {
				this._scene.setCameraLightIntensity(Number.parseFloat(query.light));
			}
		});
	}

	/**
	 * Populates all of the labels click events.
	 * @private
	 */
	_populateLabelEvents() {
		// Populate labels
		const clickableEntities = ['sc_perseverance_landing_site', 'sc_perseverance', 'mars', 'earth', 'phobos', 'deimos'];
		for (let i = 0, l = this._scene.getNumEntities(); i < l; i++) {
			const entity = this._scene.getEntity(i);
			const divComponent = entity.get('div');
			if (divComponent instanceof Pioneer.DivComponent) {
				const div = divComponent.getDiv();
				if (clickableEntities.includes(entity.getName())) {
					div.addEventListener('click', async (event) => {
						await this.goToEntity(entity.getName());
						this._target = entity.getName();
						this._router.pushQuery({
							target: this._target
						}, true);
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
		const spheroid = mars.getComponentByType('spheroid').getSpheroid();
		// Remove the spheroid component.
		mars.getComponentByType('spheroid').setEnabled(false);
		// mars.removeComponent(mars.getComponentByType('spheroid'));
		// mars.get('atmosphere').setEnabled(false);
		/** @type {CMTSComponent} */
		const cmts = mars.addComponent('cmts');
		cmts.setMaxLevel(9);
		cmts.setLightSource(this._scene.get('sun', 'lightSource'));
		cmts.setRadii(spheroid.equatorialRadius, spheroid.polarRadius);
		cmts.setBaseUrl('color', '/cmts/mars/color');
		cmts.setBaseUrl('height', '/cmts/mars/height');
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
	_setupDynamicEnvironmentMap() {
		// Dynamic environment map
		const dynEnvMap = this._scene.get('camera').addComponent('dynEnvMap');
		if (dynEnvMap instanceof Pioneer.DynamicEnvironmentMapComponent) {
			this._scene.get('sc_perseverance', 'model').setDynamicEnvironmentMapComponent(dynEnvMap);
		}
	}
}

Mars2020App.html = /* html */`
	<div class="pioneer"></div>
	<div class="ui">
		<div id="header">
			<h1 id="title">Mars 2020</h1>
			<div id="time-control"></div>
			</div>
		<div id="footer">
			<div id="left">
				<p>Looking at: <span id="target"></span>
				<p>Time <span id="since-until"></span> landing: <span id="time-interval"></span></p>
			</div>
		</div>
	</div>
	`;

Mars2020App.register();

UI.App.setAppClass(Mars2020App);
