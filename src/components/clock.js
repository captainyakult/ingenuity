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
	}
}

export default Clock;
