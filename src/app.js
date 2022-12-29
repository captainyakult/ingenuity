import * as Pioneer from 'pioneer';
import CollisionController from './lib/collision_controller';
import moment from 'moment-timezone';

// Import css
import 'es6-ui-library/src/themes/default';
import 'es6-ui-library/src/themes/solar-system';

import './css/grid.css';
import './css/layout.css';
import './css/style.css';
import './css/branding.css';
import './css/settings.css';

// Import UI library managers
import {
	BaseApp, TimeManager, Settings, LoadIcon, ERTManager
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
import StoryPanel from './components/story_panel';
import StoryBackButton from './components/story_back_button';
import InfoPanel from './components/info_panel';

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
			min: 666952142.000 - 5880.000, // Min time supported by keyframes
			start: 666952075.000, // Cruise state separation is 60s before start of EDL (ET seconds)
			EDLStart: 666952142.000, // ET seconds
			landing: 666953087, // ET seconds
			end: 666952142.000 + 969.000 + 3.000 // ET seconds, 3 seconds after descent stage lands.
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
		// Pause time
		this._pioneer.setTimeRate(0);

		this._pioneer.registerControllerType('collision', CollisionController);

		// Update css vh variable
		const vh = window.innerHeight;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
		window.addEventListener('resize', () => {
			const vh = window.innerHeight;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
		});
	}

	/**
	 * Creates app managers.
	 */
	async createManagers() {
		// Time manager
		const timeManager = this.addManager('time', TimeManager);
		// Update date limits
		const min = moment.tz(Pioneer.TimeUtils.etToUnix(this.dateConstants.min) * 1000, this._timezone);
		const max = moment.tz(Pioneer.TimeUtils.etToUnix(this.dateConstants.end) * 1000, this._timezone);
		timeManager.setDefaultLimits({ min, max });
		timeManager.setLimits({ min, max });
		timeManager.setStartTime(min);
		timeManager.setToStart();

		// Scene manager
		const sceneManager = this.addManager('scene', SceneManager, this._pioneer);
		this._scene = sceneManager.main;
		await sceneManager.populate();

		// ERT manager
		const ertManager = this.addManager('ert', ERTManager, {
			isERT: true,
			ertTarget: 'sc_perseverance',
			sceneMgr: sceneManager
		});
		timeManager.registerCallback('getnow', ertManager.getNow);

		// Camera manager
		const cameraManager = this.addManager('camera', CameraManager, this._pioneer, this._scene);
		cameraManager.createViewportAndCamera();
		cameraManager.registerCallback('loading', sceneManager.addLoading);
		cameraManager.registerCallback('loaded', sceneManager.removeLoading);

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

		const clock = await this.addComponent('clock', Clock, document.getElementById('clock'), { allowEdit: false });
		this._managers.time.registerCallback('update', clock.update);
		clock.setEnabled(true);

		const clockShortcut = await this.addComponent('clockShortcut', ClockShortcut, document.getElementById('clock-shortcut'));
		this._managers.time.registerCallback('update', clockShortcut.update);
		clockShortcut.setEnabled(true);

		const timeController = await this.addComponent('timeController', TimeController, document.getElementById('time-controller'));
		this._managers.time.registerCallback('ratechange', timeController.onRateChange);
		this._managers.time.registerCallback('forcedpause', timeController.onForcedPause);
		this._managers.time.registerCallback('forcedpauseresume', timeController.onForcedPauseResume);
		timeController.setEnabled(true);

		const settings = await this.addComponent('settings', Settings, document.getElementById('settings'), { isMetric: false });

		const storyPanel = await this.addComponent('storyPanel', StoryPanel, document.getElementById('story-panel'));
		this._managers.time.registerCallback('update', storyPanel.update);
		settings.registerCallback('unitchange', storyPanel.onUnitChange);

		const storyBackButton = await this.addComponent('storyBackButton', StoryBackButton, document.getElementById('story-back-button'));
		storyPanel.registerCallback('slidechange', storyBackButton.updateText);

		await this.addComponent('infoPanel', InfoPanel, document.getElementById('info-panel'));

		const loadIcon = await this.addComponent('loadIcon', LoadIcon, document.getElementById('load-icon'));
		this._managers.scene.registerCallback('loading', loadIcon.show);
		this._managers.scene.registerCallback('loaded', loadIcon.hide);
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
