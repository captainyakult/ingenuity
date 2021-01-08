import { BaseView, AppUtils } from 'es6-ui-library';
import moment from 'moment-timezone';
import * as Pioneer from 'pioneer-js';

/**
 *
 */
class HomeView extends BaseView {
	/**
	 * Constructor.
	 * @param {HTMLDivElement} div
	 * @param {BaseApplication} app
	 */
	constructor(div, app) {
		super(div, app);

		this._components = ['clock', 'timeController', 'clockShortcut', 'settings', 'storyPanel', 'storyBackButton', 'infoPanel', 'loadIcon'];

		this._rules = {
			rate: {
				value: (val) => this._app.getComponent('timeController').getRateLimits().includes(val),
				default: 1
			}
		};

		this._isMobileMode = this._app.isMobile() || this._app.isTablet() || this._app.isLandscape();
		this._controlsTimeout = 30 * 1000; // in milliseconds
		this._isDragging = false;
		this._controlsVisible = false;
		this._firstLoad = true;
		this._id = null;
		this._cameraInterval = null;

		this._showControls = this._showControls.bind(this);
		this._hideControls = this._hideControls.bind(this);
		this.onPhotoModeChange = this.onPhotoModeChange.bind(this);
		this.onLoaded = this.onLoaded.bind(this);

		window.addEventListener('mousedown', (event) => {
			if (this._app.isTouch()) {
				return;
			}
			this._isDragging = true;

			// Turn off guided camera
			if (event.target.id === 'main-viewport') {
				this._app.getComponent('settings').stopGuidedCamera();
			}

			// Show bottom panel
			if (event.target.id === 'main-viewport' && !this._app.getComponent('settings').getState('isPhotoMode')) {
				this._showControls();
				if (this._isMobileMode) {
					this._showSettings();
					this._app.getComponent('storyPanel').hide();
				}
			}

			// Refresh timer
			clearTimeout(this._timer);
			if (event.target.id === 'main-viewport' && !this._app.getComponent('settings').getState('isPhotoMode')) {
				this._timer = setTimeout(() => {
					if (!this._app.getComponent('settings').getState('isPhotoMode')) {
						this._hideControls();
						if (this._isMobileMode) {
							this._hideSettings();
						}
						this._app.getComponent('storyPanel').show();
					}
				}, this._controlsTimeout);
			}
		});
		window.addEventListener('mousemove', (event) => {
			if (this._isDragging) {
				// Refresh timer
				clearTimeout(this._timer);
			}
		});
		window.addEventListener('wheel', (event) => {
			if (this._app.isTouch()) {
				return;
			}
			// Refresh timer
			clearTimeout(this._timer);
		});
		window.addEventListener('mouseup', (event) => {
			if (this._app.isTouch()) {
				return;
			}
			this._isDragging = false;

			// Refresh timer
			clearTimeout(this._timer);
			if (event.target.id === 'main-viewport' && !this._app.getComponent('settings').getState('isPhotoMode')) {
				this._timer = setTimeout(() => {
					if (!this._app.getComponent('settings').getState('isPhotoMode')) {
						this._hideControls();
						if (this._isMobileMode) {
							this._hideSettings();
						}
						this._app.getComponent('storyPanel').show();
					}
				}, this._controlsTimeout);
			}
		});
		window.addEventListener('touchstart', (event) => {
			// Show bottom panel and hide story panel
			if (event.target.id === 'main-viewport' && !this._app.getComponent('settings').getState('isPhotoMode')) {
				this._showControls();
				if (this._isMobileMode) {
					this._showSettings();
					this._app.getComponent('storyPanel').hide();
				}
			}

			// Refresh timer
			clearTimeout(this._timer);
			if (event.target.id === 'main-viewport' && !this._app.getComponent('settings').getState('isPhotoMode')) {
				this._timer = setTimeout(() => {
					if (!this._app.getComponent('settings').getState('isPhotoMode')) {
						this._hideControls();
						if (this._isMobileMode) {
							this._hideSettings();
						}
						this._app.getComponent('storyPanel').show();
					}
				}, this._controlsTimeout);
			}
		});

		window.addEventListener('touchmove', (event) => {
			// Refresh timer
			clearTimeout(this._timer);
		});

		window.addEventListener('touchend', (event) => {
			// Refresh timer
			clearTimeout(this._timer);
			if (event.target.id === 'main-viewport' && !this._app.getComponent('settings').getState('isPhotoMode')) {
				this._timer = setTimeout(() => {
					if (!this._app.getComponent('settings').getState('isPhotoMode')) {
						this._hideControls();
						if (this._isMobileMode) {
							this._hideSettings();
						}
						this._app.getComponent('storyPanel').show();
					}
				}, this._controlsTimeout);
			}
		});

		window.addEventListener('resize', () => {
			if (this._app.getComponent('settings').getState('isPhotoMode')) {
				return;
			}

			const isMobileMode = this._app.isMobile() || this._app.isTablet() || this._app.isLandscape();

			if (this._isMobileMode !== isMobileMode) {
				this._isMobileMode = isMobileMode;
				// Mobile
				if (this._isMobileMode) {
					if (this._app.getComponent('storyPanel').isVisible()
						&& (this._controlsVisible || this._app.getComponent('settings').isVisible())) {
						this.resetStoryPanelMobile();
					}
				}
				else { // Desktop
					if (!this._app.getComponent('storyPanel').isVisible()) {
						this._app.getComponent('storyPanel').show();
					}
					if (!this._app.getComponent('settings').isVisible()) {
						this._app.getComponent('settings').show();
					}
				}
			}
		});
	}

	/**
	 * Initialization.
	 * @param {object} params - Parameters and queries from url
	 */
	async init(params) {
		this._resetStatus();

		this._app.getManager('time').resetLimits();

		this.processQuery(params);

		if (!params.time) {
			const startTime = moment.tz(Pioneer.TimeUtils.etToUnix(this._app.dateConstants.start) * 1000, 'Etc/UTC');
			this._app.getManager('time').setTime(startTime);
		}

		// Update story panel
		this._app.getComponent('storyPanel').onRouteChange(params);

		// Register callback for photo mode
		this._app.getComponent('settings').registerCallback('photomodechange', this.onPhotoModeChange);

		this._app.getComponent('infoPanel').onRouteChange();

		this._firstLoad = false;
		await this.updateCamera(params.target, params.id);
	}

	/**
	 * Update time rate on scene loaded.
	 */
	onLoaded() {
		// Remove callback
		this._app.getManager('scene').removeCallback('loaded', this.onLoaded);
		super.updateTimeRate(this._app.getManager('router').query);
	}

	/**
	 * Overwritten updateTimeRate.
	 */
	updateTimeRate(query) {
		const sceneManager = this._app.getManager('scene');
		if (sceneManager.isLoading) {
			// Add callback
			sceneManager.registerCallback('loaded', this.onLoaded);
		}
		else {
			super.updateTimeRate(query);
		}
	}

	/**
	 * Update camera.
	 * @param {string} target
	 * @param {string} phaseId
	 */
	async updateCamera(target, phaseId) {
		if (!target) {
			target = 'sc_perseverance_rover';
		}

		const info = this._app.getComponent('storyPanel').currentInfo;

		clearInterval(this._cameraInterval);
		const rate = this._app.getManager('time').getTimeRate();

		// Get the presets depending on time rate
		const presets = rate < 0
			? info.reverseCamera || info.camera
			: info.camera;

		// Preset camera
		if (presets && this._app.getComponent('settings').getState('isGuidedCamera')) {
			this._target = target;
			// Only update camera if story phase changes
			if (this._id !== phaseId) {
				this._id = phaseId;
				let i = 0;
				const startTime = this._app.getManager('time').etToMoment(this._app.dateConstants.EDLStart).valueOf();

				// Execute a camera preset
				const executePreset = async () => {
					// End of phase, clear interval
					if (i >= presets.length) {
						clearInterval(this._cameraInterval);
						return;
					}
					const preset = presets[i];
					const options = preset.params[preset.length - 1];
					if (AppUtils.isObject(options) && ('duration' in options)) {
						preset.params[preset.length - 1].duration = options.duration * 1.0 / rate;
					}
					// Preset has timestamp
					if ('timestamp' in preset) {
						// Get current timestamp from current time - EDL start time
						const timestamp = this._app.getManager('time').getTime().valueOf() - startTime;
						// Current timestamp is at or more than preset's timestamp
						if (rate < 0) {
							if (timestamp <= preset.timestamp * 1000) {
								i++;
								await this._app.getManager('camera')[preset.func](...preset.params);
							}
						}
						else {
							if (timestamp >= preset.timestamp * 1000) {
								i++;
								await this._app.getManager('camera')[preset.func](...preset.params);
							}
						}
					}
					// Preset doesn't have timestamp
					else {
						i++;
						await this._app.getManager('camera')[preset.func](...preset.params);
					}
				};
				// Execute each camera preset in a phase on an interval
				this._cameraInterval = setInterval(executePreset, 30);
			}
		}
		// Normal camera
		else {
			if (this._target !== target) {
				this._target = target;
				await this._app.getManager('camera').goToEntity(target);
			}
		}
	}

	/**
	 * Show/hide components on photo mode change.
	 * @param {boolean} isPhotoMode
	 */
	onPhotoModeChange(isPhotoMode) {
		if (isPhotoMode) {
			this._hideControls();
			this._app.getComponent('storyPanel').hide();
		}
		else {
			this._app.getComponent('storyPanel').show();
			if (this._isMobileMode) {
				this._hideSettings();
			}
		}
	}

	/**
	 * Shows control panel (clock, time controls).
	 */
	_showControls() {
		this._controlsVisible = true;
		this._app.getComponent('clock').show();
		this._app.getComponent('clockShortcut').show();
		document.getElementById('float-mid-bottom').classList.add('active');
		document.getElementById('float-mid-bottom').classList.remove('hidden');
	}

	/**
	 * Hides control panel (clock, time controls).
	 */
	_hideControls() {
		this._controlsVisible = false;
		this._app.getComponent('clock').hide();
		this._app.getComponent('clockShortcut').hide();
		document.getElementById('float-mid-bottom').classList.add('hidden');
		document.getElementById('float-mid-bottom').classList.remove('active');
	}

	/**
	 * Shows settings panel.
	 */
	_showSettings() {
		this._app.getComponent('settings').show();
	}

	/**
	 * Hides settings panel.
	 */
	_hideSettings() {
		this._app.getComponent('settings').hide();
	}

	/**
	 * Resets the story panel for mobile.
	 */
	resetStoryPanelMobile() {
		this._hideControls();
		this._hideSettings();
		if (!this._app.getComponent('storyPanel').isVisible()) {
			this._app.getComponent('storyPanel').show();
		}
		if (this._timer) {
			clearTimeout(this._timer);
		}
	}
}

export default HomeView;
