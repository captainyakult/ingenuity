import { TimeController as BaseTimeController } from 'es6-ui-library';
import '../css/time_controller.css';

/**
 * Extended TimeController from es6-ui-library.
 * @class
 * @augments TimeController
 */
class TimeController extends BaseTimeController {
	/**
	 * Constructor.
	 * @param {BaseApplication} app
	 * @param {HTMLDivElement} div
	 */
	constructor(app, div) {
		super(app, div);

		this._children.decreaseContainer.classList.add('bg-color', 'gray', 'dark');
		this._children.increaseContainer.classList.add('bg-color', 'gray', 'dark');
		this._children.label.classList.add('semi');
		this._children.rateDisplay.classList.add('semi');
	}
}

export default TimeController;
