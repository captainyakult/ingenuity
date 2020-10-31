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
