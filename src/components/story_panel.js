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
			live: 'hidden',
			distance: 0,
			velocity: 0,
			touchdown: 0
		};

		this._settings.navigationButtons.prev.text = 'Scroll for previous phase';
		this._settings.navigationButtons.next.text = 'Scroll for next phase';
	}

	/**
	 * Create content for a slide.
	 * @param {object} info
	 * @param {object} nextInfo - Info for next slide
	 * @returns {string} - HTML string
	 */
	_createSlideContent(info, nextInfo) {
		let html = `
			<div class="live-container {{live}}">
				<span class="icon icon-live"></span>
				<span class="live semi color">live</span>
			</div>
			<h1 class="title">${info.title}</h1>
			<div class="descrition">${info.description}</div>
			<div class="distance">{{distance}}<span> from Mars</span></div>
			<div class="velocity">{{velocity}}</div>
			<div class="touchdown"><span>Touchdown in </span>{{touchdown}}</div>
		`;
		if (nextInfo) {
			html += `
				<div>Next phase:</div>
				<div><span>${info.title} in</span><span class="timer"></span></div>
			`;
		}

		return html;
	}

	/**
	 * Initialization.
	 */
	init() {
		// Populate panel with all slides once since it doesn't change.
		// TODO: Get story info from file
		this.addSlides([
			{
				id: 'section_1',
				text: this._createSlideContent({
					title: 'Cruise Stage Separation',
					description: 'About ten minutes before entering the atmosphere, the spacecraft sheds its Cruise Stage, which houses solar panels, radios, and fuel tanks during its flight to Mars.'
				})
			},
			{ id: 'section_2', text: 'Section 2' },
			{ id: 'section_3', text: 'Section 3' },
			{ id: 'section_4', text: 'Section 4' },
			{ id: 'section_5', text: 'Section 5' },
			{ id: 'section_6', text: 'Section 6' },
			{ id: 'section_7', text: 'Section 7' },
			{ id: 'section_8', text: 'Section 8' },
			{ id: 'section_9', text: 'Section 9' },
			{ id: 'section_10', text: 'Section 10' }
		]);
	}

	/**
	 * Update UI on route change.
	 * @param {string} phaseId - Phase id
	 */
	onRouteChange(phaseId) {
		// TODO: Get panel index using phaseId as id, if no id, index = 0
		// TODO: Go to panel with index
	}
}

export default StoryPanel;
