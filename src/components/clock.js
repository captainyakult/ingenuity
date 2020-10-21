import { Clock as BaseClock } from 'es6-ui-library';
import '../css/clock.css';

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
}

export default Clock;
