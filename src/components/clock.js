import { Clock as BaseClock } from 'es6-ui-library';
import '../css/clock.css';
import moment from 'moment-timezone';

/**
 * Extended TimeController from es6-ui-library.
 * @class
 * @augments Clock
 */
class Clock extends BaseClock {
	/**
	 * Constructor.
	 * @param {BaseApplication} app
	 * @param {HTMLDivElement} div
	 */
	constructor(app, div) {
		super(app, div);

		this._children.live.classList.add('semi', 'color');
		this._children.date.classList.add('semi');
		this._children.time.classList.add('semi');
		this._children.meridiem.classList.add('semi');
		this._children.timeInput.classList.add('semi');

		this._handleTimeUpdate = this._handleTimeUpdate.bind(this);
		this.setTimeCallback(this._handleTimeUpdate);

		window.addEventListener('resize', () => {
			this._updateFonts();
		});
	}

	/**
	 * Initialization.
	 * Called automatically by addComponent.
	 * @returns {Promise}
	 */
	async init() {
		this._updateFonts();
	}

	/**
	 * Handles time update.
	 * @param {Moment.moment} time
	 */
	_handleTimeUpdate(time) {
		// Change time to Earth Received Time
		if (this._app.getManager('time').isERT()) {
			this._setEarthReceivedTime(time, 'sc_perseverance');
		}
	}

	/**
	 * Update fonts.
	 */
	_updateFonts() {
		if (this._app.isMobile() || this._app.isLandscape()) {
			this._children.live.classList.add('x-small');
			this._children.date.classList.add('small');
			this._children.time.classList.add('small');
			this._children.meridiem.classList.add('small');
			this._children.timeInput.classList.add('small');
		}
		else {
			this._children.live.classList.remove('x-small');
			this._children.date.classList.remove('small');
			this._children.time.classList.remove('small');
			this._children.meridiem.classList.remove('small');
			this._children.timeInput.classList.remove('small');
		}
	}
}

export default Clock;
