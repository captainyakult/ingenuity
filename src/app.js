import * as Pioneer from 'pioneer-js';
import moment from 'moment-timezone';

// Import css
import 'es6-ui-library/css/grid_layout.css';
import 'es6-ui-library/css/style.css';
import 'es6-ui-library/css/clock.css';
import 'es6-ui-library/css/clock_shortcut.css';
import 'es6-ui-library/css/time_controller.css';
import './css/grid.css';
import './css/sprite.css';
import './css/color.css';
import './css/layout.css';
import './css/style.css';

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
import ClockShortcut from './components/clock_shortcut';
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
		// Update date limits
		const min = moment.tz(Pioneer.TimeUtils.etToUnix(this.dateConstants.start) * 1000, this._timezone);
		const max = moment.tz(Pioneer.TimeUtils.etToUnix(this.dateConstants.landing) * 1000, this._timezone);
		timeManager.setDefaultLimits({ min, max });
		timeManager.setLimits({ min, max });
		timeManager.setStartTime(min);

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

		const clockShortcut = await this.addComponent('clockShortcut', ClockShortcut, document.getElementById('clock-shortcut'));
		this._managers.time.registerCallback('update', clockShortcut.update);
		clockShortcut.setEnabled(true);

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

	/**
	 * Returns true if the media query is mobile.
	 * @returns {boolean}
	 */
	isMobile() {
		if (window.matchMedia('(max-width: 991px)').matches) {
			return true;
		}
		else {
			return false;
		}
	}

	/**
	 * Returns trueif the media query is landascape.
	 * @returns {boolean}
	 */
	isLandscape() {
		if (window.matchMedia('(orientation: landscape)').matches
			&& window.matchMedia('(max-height: 600px)').matches) {
			return true;
		}
		else {
			return false;
		}
	}

	/**
	 * Returns true if the media query is 2K.
	 * @returns {boolean}
	 */
	is2K() {
		if (window.matchMedia('(min-width: 2880px) and (min-height: 1024px)').matches) {
			return true;
		}
		else {
			return false;
		}
	}

	/**
	 * Returns true if the media query is 4K.
	 * @returns {boolean}
	 */
	is4K() {
		if (window.matchMedia('(min-width: 3200px) and (min-height: 1440px)').matches) {
			return true;
		}
		else {
			return false;
		}
	}
}

const app = new App();
export default app;
