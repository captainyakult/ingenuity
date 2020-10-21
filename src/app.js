import * as Pioneer from 'pioneer-js';

// Import css
import 'es6-ui-library/css/grid_layout.css';
import 'es6-ui-library/css/style.css';
import 'es6-ui-library/css/clock.css';
import 'es6-ui-library/css/time_controller.css';
import './css/grid.css';
import './css/sprite.css';
import './css/color.css';
import './css/layout.css';
import './css/style.css';
import './css/clock.css';
import './css/time_controller.css';

// Import UI library managers
import {
	BaseApp, TimeManager
} from 'es6-ui-library';

// Overriden managers
import SceneManager from './managers/scene_manager';
import CameraManager from './managers/camera_manager';
import RouteManager from './managers/route_manager';

// Import components
import HomeView from './views/home_view';
import Clock from './components/clock';
import TimeController from './components/time_controller';

class App extends BaseApp {
	/**
	 * Constructs the Mars 2020 EDL app.
	 */
	constructor() {
		super();

		/**
		 * Pioneer engine.
		 * @type {Pioneer.Engine}
		 * @private
		 */
		this._pioneer = null;

		/**
		 * The router.
		 * @type {RouteManager}
		 * @private
		 */
		this._router = null;

		/**
		 * Date constants.
		 * @type {object}
		 */
		this.dateConstants = {
			start: 666952132.045910,
			landing: 666953087
		};
	}

	/**
	 * Inits the app.
	 */
	async init() {
		this._pioneer = new Pioneer.Engine(document.querySelector('.pioneer'));
		this._pioneer.getDownloader().setReplacement('STATIC_ASSETS_URL', window.config.staticAssetsUrl);
		this._pioneer.getDownloader().setReplacement('DYNAMIC_ASSETS_URL', window.config.dynamicAssetsUrl);
		// Set the time to 'now'
		this._pioneer.setTime(Pioneer.TimeUtils.now());
		// Set the timerate to realtime
		this._pioneer.setTimeRate(1.0);
	}

	/**
	 * Creates app managers.
	 */
	async createManagers() {
		// Time manager
		const timeManager = this.addManager('time', TimeManager);
		timeManager.setDisplayERT(true);
		// TODO: update limits
		// const min = moment.tz('1949-12-31', 'Etc/UTC'); // Dec 31st 1949
		// const max = moment.tz('2049-12-31', 'Etc/UTC'); // Dec 31st 2049
		// timeMgr.setDefaultLimits({ min, max });
		// timeMgr.setLimits({ min, max });

		// Scene manager
		const sceneManager = this.addManager('scene', SceneManager, this._pioneer);
		this._scene = sceneManager.main;
		await sceneManager.populate();

		// Camera manager
		const cameraManager = this.addManager('camera', CameraManager, this._pioneer, this._scene);
		cameraManager.createViewportAndCamera();

		sceneManager.setupDynamicEnvironmentMap();

		// Route manager
		const routeManager = this.addManager('router', RouteManager);
		routeManager.setValidQueries(['time', 'rate']);
		routeManager.init();
	}

	/**
	 * Creates UI components.
	 */
	async createComponents() {
		this.addView('home', HomeView, document.querySelector('.ui'));

		const clock = await this.addComponent('clock', Clock, document.getElementById('clock'));
		this._managers.time.registerCallback('update', clock.update);
		this._managers.time.registerCallback('earthreceivedtime', clock.update);
		clock.setEnabled(true);

		const timeController = await this.addComponent('timeController', TimeController, document.getElementById('time-controller'));
		this._managers.time.registerCallback('ratechange', timeController.onRateChange);
		timeController.setEnabled(true);
	}

	/**
	 * Gets pioneer engine.
	 */
	get pioneer() {
		return this._pioneer;
	}
}

const app = new App();
export default app;
