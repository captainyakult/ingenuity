import { Carousel } from 'es6-ui-library';

/**
 * Story panel.
 * @class
 * @augments Carousel
 */
class StoryPanel extends Carousel {
	/**
	 * Constructor.
	 * @param {BaseApplication} app
	 * @param {HTMLDivElement} div
	 * @param {object} options
	 */
	constructor(app, div, options) {
		super(app, div, options);

		this._state = {
			...this._state,
			liveClass: 'hidden',
			distance: 0,
			velocity: 0,
			touchdown: 0
		};

		this._settings.navigationButtons.prev.text = 'Scroll for previous phase';
		this._settings.navigationButtons.next.text = 'Scroll for next phase';

		this.update = this.update.bind(this);
	}

	/**
	 * Create content for a slide.
	 * @param {object} info
	 * @param {object} nextInfo - Info for next slide
	 * @returns {string} - HTML string
	 */
	_createSlideContent(info, nextInfo) {
		const descriptionClass = info.description ? '' : 'hidden';

		let html = `
			<div class="live-container {{liveClass}}">
				<span class="icon icon-live"></span>
				<span class="live semi color">live</span>
			</div>
			<h1 class="title">${info.title}</h1>
			<div class="description ${descriptionClass}">${info.description}</div>
			<div class="distance">{{distance}}<span> from Mars</span></div>
			<div class="velocity">{{velocity}}</div>
			<div class="touchdown"><span>Touchdown in </span>{{touchdown}}</div>
		`;
		if (nextInfo) {
			html += `
				<div>Next phase:</div>
				<div><span>${nextInfo.title} in</span><span class="timer"></span></div>
			`;
		}

		return html;
	}

	/**
	 * Initialization.
	 */
	async init() {
		// Populate panel with all slides once since it doesn't change.
		const info = await AppUtils.loadJSON('/assets/story.json');

		info.forEach(({ id, title, description }, index) => {
			const nextInfo = index + 1 < info.length
				? info[index + 1]
				: null;
			this.addSlide({
				id,
				text: this._createSlideContent({ title, description }, nextInfo)
			});
		});
	}

	/**
	 * Update UI on route change.
	 * @param {string} phaseId - Phase id
	 */
	onRouteChange(phaseId) {
		// TODO: Get panel index using phaseId as id, if no id, index = 0
		// TODO: Go to panel with index
	}

	/**
	 * Update every frame.
	 */
	update() {
		const isNow = this._app.getManager('time').isNow();

		this.setState({
			liveClass: isNow ? '' : 'hidden'
		});
	}
}

export default StoryPanel;
