import { Carousel, AppUtils } from 'es6-ui-library';
import 'es6-ui-library/css/carousel.css';
import '../css/story_panel.css';

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

		this._timestamps = [];
		this._touchdown = 0;
		this._keywords = {
			nextPhase: id => id + '-next-phase'
		};

		this._onSlideChange = async (index, includeTime = false) => {
			const query = {
				id: this._children.slides[index].dataset.id
			};
			if (includeTime) {
				query.time = this._app.getManager('time').getTimeUrl();
			}
			else {
				query.__remove = ['time'];
			}
			await this._app.getManager('router').navigate(query);
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
			<div class="touchdown"><span>Touchdown in </span><span>{{touchdown}}</span></div>
		`;

		if (nextInfo) {
			html += `
				<div>Next phase:</div>
				<div><span>${nextInfo.title} in </span><span class="timer" key="${this._keywords.nextPhase(info.id)}">0:0</span></div>
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

		const startTime = this._app.getManager('time').etToMoment(this._app.dateConstants.start).valueOf();

		info.forEach(({ id, title, description, timestamp }, index) => {
			const nextInfo = index + 1 < info.length
				? info[index + 1]
				: null;
			const time = startTime + timestamp * 1000;
			this._timestamps.push(time);
			if (id === 'touchdown') {
				this._touchdown = time;
			}
			this.addSlide({
				id,
				text: this._createSlideContent({ id, title, description }, nextInfo)
			});
		});

		// Store time limits once since it doesn't change for this app.
		this._timeLimits = this._app.getManager('time').getLimits();
	}

	/**
	 * Update UI on route change.
	 * @param {object} params
	 * @param {string} params.id
	 * @param {string} params.time
	 */
	async onRouteChange(params) {
		// Go to slide using id, or first slide if no id
		const index = Math.max(0, this._children.slides.findIndex(x => x.dataset.id === params.id));
		this.goToSlide(index);
		const time = params.time ? params.time : this._timestamps[index];
		this._app.getManager('time').setTime(time);

		this.updatePanel(index, this._app.getManager('time').getTime().valueOf());
	}

	updatePanel(currentIndex, time) {
		const isNow = this._app.getManager('time').isNow();
		const id = this._children.slides[currentIndex].dataset.id;
		const nextIndex = currentIndex + 1;
		const nextPhase = nextIndex < this._timestamps.length
			? AppUtils.msToTime(this._timestamps[nextIndex] - time)
			: 0;
		const touchdown = AppUtils.msToTime(this._touchdown - time);

		const nextPhaseId = this._keywords.nextPhase(id);
		if (this._children[nextPhaseId]) {
			this._children[nextPhaseId].textContent = `${nextPhase.minute}:${nextPhase.second}`;
		}

		this.setState({
			liveClass: isNow ? '' : 'hidden',
			touchdown: `${touchdown.hour}:${touchdown.minute}:${touchdown.second}`
		});
	}

	/**
	 * Update every frame.
	 */
	async update() {
		const time = this._app.getManager('time').getTime().valueOf();
		const rate = this._app.getManager('time').getTimeRate();
		const { currentIndex } = this._state;
		let index = currentIndex;

		// Find the slide index to go to as needed
		if (rate > 0) {
			index = this._timestamps.findIndex(x => time < x);
			if (index < 0) {
				index = this._timestamps.length;
			}
			if (index !== 0) {
				index -= 1;
			}
		}
		else if (rate < 0) {
			index = this._timestamps.findIndex(x => time < x);
			if (index <= 0) {
				if (currentIndex === this._timestamps.length - 1) {
					index = this._timestamps.length;
				}
				else {
					index = 1;
				}
			}
			index -= 1;
		}
		// In case of forced pause
		else {
			// Reached start limit
			if (time <= this._timeLimits.min.valueOf()) {
				index = 0;
			}
			// Reached end limit
			else if (time >= this._timeLimits.max.valueOf()) {
				index = this._timestamps.length - 1;
			}
		}

		if (currentIndex !== index) {
			await this._onSlideChange(index, true);
		}
		else {
			if (rate !== 0) {
				this.updatePanel(currentIndex, time);
			}
		}
	}
}

export default StoryPanel;
