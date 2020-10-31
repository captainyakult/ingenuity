import { TimeController as BaseTimeController } from 'es6-ui-library';
import 'es6-ui-library/css/time_controller.css';
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
		this._rates = [
			-300, // 5 mins
			-60,
			-10,
			-1,
			0,
			1,
			10,
			60,
			300
		];
	}

	/**
	 * Initialization.
	 * Called automatically by addComponent.
	 * @returns {Promise}
	 */
	async init() {
		this._children.decreaseContainer.classList.add('bg-color', 'gray', 'dark');
		this._children.increaseContainer.classList.add('bg-color', 'gray', 'dark');
		this._children.label.classList.add('semi');
		this._children.rateDisplay.classList.add('semi');

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
