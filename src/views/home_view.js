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

		this._components = ['clock', 'timeController', 'breadcrumb', 'clockShortcut', 'storyPanel'];

		this._rules = {
			rate: {
				value: (val) => this._app.getComponent('timeController').getRateLimits().includes(val),
				default: 1
			}
		};
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

		await this.updateCamera(params.target);
	}

	/**
	 * Transition to a target.
	 * @param {string} target
	 */
	async updateCamera(target) {
		if (target) {
			if (this._target !== target) {
				this._target = target;
				await this._app.getManager('camera').goToEntity(target);
			}
		}
		else {
			await this._app.getManager('camera').goToEntity('sc_perseverance');
		}
	}
}

export default HomeView;