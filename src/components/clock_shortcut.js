import { ClockShortcut as BaseClockShortcut } from 'es6-ui-library';
import '../css/clock_shortcut.css';
import moment from 'moment-timezone';
import * as Pioneer from 'pioneer-js';

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
		this._eventNames.push('replay');
		this._initCallbacks();
	}

	/**
	 * Initialization.
	 * Called automatically by addComponent.
	 * @returns {Promise}
	 */
	async init() {
		super.init();
		this._children.live.classList.add('semi', 'color');
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
		}
		else {
			this._children.live.classList.remove('x-small');
		}
	}

	/**
	 * Change time rate to 1s/s and time to start time.
	 */
	async _replay() {
		const startTime = moment.tz(Pioneer.TimeUtils.etToUnix(this._app.dateConstants.start) * 1000, 'Etc/UTC');
		const time = this._app.getManager('time').getTimeUrl(startTime);
		const navigated = this._app.getManager('router').navigate({
			time,
			__remove: ['rate', 'id']
		}, 'home');

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
}

export default ClockShortcut;
