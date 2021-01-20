import { ClockShortcut as BaseClockShortcut } from 'es6-ui-library';
import 'es6-ui-library/css/clock_shortcut.css';
import '../css/clock_shortcut.css';

/**
 * Extended ClockShortcut from es6-ui-library.
 * @class
 * @augments ClockShortcut
 */
class ClockShortcut extends BaseClockShortcut {
	/**
	 * Constructor.
	 * @param {BaseApplication} app
	 * @param {HTMLDivElement} div
	 */
	constructor(app, div) {
		super(app, div);

		/**
		 * Array of possible event names.
		 * @type {string[]}
		 * @default
		 */
		this._eventNames = ['replay'];

		/**
		 * Callbacks reference object.
		 * @type {object}
		 * @default
		 */
		this._callbacks = {};
		for (let i = 0; i < this._eventNames.length; i++) {
			this._callbacks[this._eventNames[i]] = [];
		}
	}

	/**
	 * Initialization.
	 * Called automatically by addComponent.
	 * @returns {Promise}
	 */
	async init() {
		super.init();
		this._children.live.classList.add('semi', 'color');
		this._children.replay.classList.add('semi', 'color');
		this._updateFonts();

		window.addEventListener('resize', () => {
			this._updateFonts();
		});
	}

	/**
	 * Update fonts.
	 */
	_updateFonts() {
		if (this._app.isMobile() || this._app.isLandscape()) {
			this._children.live.classList.add('x-small');
			this._children.replay.classList.add('x-small');
		}
		else {
			this._children.live.classList.remove('x-small');
			this._children.replay.classList.remove('x-small');
		}
	}

	/**
	 * Change time rate to 1s/s and time to start time.
	 */
	async _replay() {
		const navigated = await this._app.getManager('router').navigate({ __remove: 'all' }, 'home');
		if (!navigated) {
			this._app.getManager('time').setTimeRate(1);
			this._app.getManager('time').setToStart();
		}
		// Make sure camera returns to rover on replay
		const cameraTarget = this._app.getManager('camera').cameraEntity.getParent().getName();
		if (cameraTarget !== 'sc_perseverance_rover') {
			await this._app.getManager('camera').goToEntity('sc_perseverance_rover');
		}
		this.triggerCallbacks('replay');
	}

	/**
	 * Update clock on route change.
	 * @param {object} entityInfo
	 */
	onRouteChange(entityInfo) {
		// Hide back to live if has end date
		// TODO: Update this code
		if (entityInfo.end) {
			this._children.liveContainer.classList.add('hidden');
		}
		else {
			this._children.liveContainer.classList.remove('hidden');
		}
	}

	/**
	 * Registers a callback for a specific event.
	 * @param {string} eventName
	 * @param {Function} callback - A callback function to be called
	 */
	registerCallback(eventName, callback) {
		if ((typeof (callback) !== 'function') || (this._eventNames.indexOf(eventName) < 0)) {
			return;
		}

		// Prevent multiple registrations of same event with same callback
		if (!this._callbacks[eventName].includes(callback)) {
			this._callbacks[eventName].push(callback);
		}
	}

	/**
	 * Trigger all callbacks for an event.
	 * @param {string} eventName
	 * @param {Array} [params=[]] - Parameters for callback
	 */
	triggerCallbacks(eventName, params = []) {
		console.log(this._callbacks[eventName])
		for (let i = this._callbacks[eventName].length - 1; i >= 0; i--) {
			const callback = this._callbacks[eventName][i];
			callback(...params);
		}
	}
}

export default ClockShortcut;
