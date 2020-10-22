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
	 * Update fonts.
	 */
	_updateFonts() {
		if (this._app.isMobile()) {
			this._children.label.classList.add('tiny');
			this._children.rateDisplay.classList.add('tiny');
		}
		else {
			this._children.label.classList.remove('tiny');
			this._children.rateDisplay.classList.remove('tiny');
		}
	}
}

export default TimeController;
