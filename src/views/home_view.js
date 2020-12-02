import { BaseView } from 'es6-ui-library';
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

		this._components = ['clock', 'timeController', 'breadcrumb', 'clockShortcut', 'settings', 'storyPanel', 'storyBackButton'];

		this._rules = {
			rate: {
				value: (val) => this._app.getComponent('timeController').getRateLimits().includes(val),
				default: 1
			}
		};

		this._controlsTimeout = 4 * 1000; // in milliseconds
		this._isDragging = false;

		this._showControls = this._showControls.bind(this);
		this._hideControls = this._hideControls.bind(this);
		this.onPhotoModeChange = this.onPhotoModeChange.bind(this);

		window.addEventListener('mousedown', (event) => {
			if (this._app.isTouch()) {
				return;
			}
			this._isDragging = true;

			// Show bottom panel
			if (event.target.id === 'main-viewport' && !this._app.getComponent('settings').getState('isPhotoMode')) {
				this._showControls();
			}

			// Refresh timer
			clearTimeout(this._timer);
			if (!this._app.getComponent('settings').getState('isPhotoMode')) {
				this._timer = setTimeout(() => {
					this._hideControls();
					this._app.getComponent('storyPanel').show();
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
			if (!this._app.getComponent('settings').getState('isPhotoMode')) {
				this._timer = setTimeout(() => {
					this._hideControls();
					this._app.getComponent('storyPanel').show();
				}, this._controlsTimeout);
			}
		});
		window.addEventListener('touchstart', (event) => {
			// Show bottom panel and hide story panel
			if (event.target.id === 'main-viewport' && !this._app.getComponent('settings').getState('isPhotoMode')) {
				this._showControls();
				this._app.getComponent('storyPanel').hide();
			}

			// Refresh timer
			clearTimeout(this._timer);
			if (!this._app.getComponent('settings').getState('isPhotoMode')) {
				this._timer = setTimeout(() => {
					this._hideControls();
					this._app.getComponent('storyPanel').show();
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
			if (!this._app.getComponent('settings').getState('isPhotoMode')) {
				this._timer = setTimeout(() => {
					this._hideControls();
					this._app.getComponent('storyPanel').show();
				}, this._controlsTimeout);
			}
		});
	}

	/**
	 * Initialization.
	 * @param {object} params - Parameters and queries from url
	 */
	async init(params) {
		console.log('home view');
		console.log(params);

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

		await this.updateCamera();
	}

	/**
	 * Transition to a target.
	 * @param {string} target
	 */
	async updateCamera(target) {
		if (!target) {
			target = 'sc_perseverance_rover';
		}
		if (this._target !== target) {
			this._target = target;
			await this._app.getManager('camera').goToEntity(target);
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
		}
	}

	/**
	 * Show control panel (clock, time controls).
	 */
	_showControls() {
		document.getElementById('float-mid-bottom').classList.add('active');
		document.getElementById('float-mid-bottom').classList.remove('hidden');
		if (this._app.isMobile()) {
			this._app.getComponent('settings').show();
		}
	}

	/**
	 * Hide control panel (clock, time controls).
	 */
	_hideControls() {
		document.getElementById('float-mid-bottom').classList.add('hidden');
		document.getElementById('float-mid-bottom').classList.remove('active');
		if (this._app.isMobile()) {
			this._app.getComponent('settings').hide();
		}
	}

	resetStoryPanel() {
		this._hideControls();
		if (!this._app.getComponent('storyPanel').isVisible()) {
			this._app.getComponent('storyPanel').show();
		}
		if (this._timer) {
			clearTimeout(this._timer);
		}
	}
}

export default HomeView;
