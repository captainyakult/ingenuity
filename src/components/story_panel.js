import { Carousel, AppUtils } from 'es6-ui-library';
import 'es6-ui-library/css/carousel.css';
import '../css/story_panel.css';
import * as Pioneer from 'pioneer-js';

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
			altitude: 0,
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
		this._isMetric = true;
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
			<h2 class="title">${info.title}</h2>
			<div class="distance semi">{{distance}}<span> from landing site.</span></div>
			<div class="altitude semi"><span>Altitude: </span>{{altitude}}</div>
			<div class="velocity semi"><span>Velocity: </span>{{velocity}}</div>
			<div class="description ${descriptionClass}">${info.description}</div>
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

		window.addEventListener('resize', () => {
			this._updateFonts();
		});

		this._interval = setInterval(() => {
			// Return if not needed

			// Update distance
			const distance = this._app.getManager('scene').getDistance('sc_perseverance', 'sc_perseverance_landing_site', { subtractRadius: false });

			// Update velocity
			const velocity = this._app.getManager('scene').getSpeed('sc_perseverance');

			// Update altitude
			const marsSpheroid = this._app.pioneer.get('main', 'mars', 'spheroid').getSpheroid();
			const lla = Pioneer.LatLonAlt.pool.get();
			const position = Pioneer.Vector3.pool.get();
			const mars = this._app.pioneer.get('main', 'mars');
			const perseverance = this._app.pioneer.get('main', 'sc_perseverance');

			perseverance.getPositionRelativeToEntity(position, Pioneer.Vector3.Zero, mars);

			marsSpheroid.llaFromXYZ(lla, position, false);

			Pioneer.Vector3.pool.release(position);
			Pioneer.LatLonAlt.pool.release(lla);

			// Update state
			this.setState({
				distance: this._formatDistance(distance),
				velocity: this._formatSpeed(velocity),
				altitude: this._formatDistance(lla.alt)
			});
		}, 200);
	}

	/**
	 * Formats distance.
	 * @param {number} distance
	 * @returns {string}
	 */
	_formatDistance(distance) {
		const unit = this._isMetric ? 'km' : 'mi';

		distance = Number.parseFloat(distance);
		if (!this._isMetric) {
			distance = distance * AppUtils.conversionTable.kmToMi;
		}
		distance = distance.toFixed(2);
		const length = distance.toString().length + unit.length;
		const width = length * 11 + 5;

		let output = '<span class="value" style="width: ' + width + 'px;">';
		output += Number(distance).toLocaleString() + '<span class="unit">' + unit + '</span>';
		output += '</span>';
		return output;
	}

	/**
	 * Formats speed.
	 * @param {number} speed
	 * @returns {string}
	 */
	_formatSpeed(speed) {
		const unit = this._isMetric ? 'km/h' : 'mph';

		speed = Number.parseFloat(speed * 3600);
		if (!this._isMetric) {
			speed = speed * AppUtils.conversionTable.kmToMi;
		}
		speed = Math.floor(speed);

		let output = '<span>';
		output += Number(speed).toLocaleString() + '<span class="unit">' + unit + '</span>';
		output += '</span>';
		return output;
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

	/**
	 * Update fonts.
	 */
	_updateFonts() {
		if (this._app.isMobile() || this._app.isLandscape()) {
		}
		else {
		}
	}

	/**
	 * Create navigation buttons.
	 * @param {string} buttonType - 'prev' or 'next'
	 * @param {HTMLElement} parent - Parent element to add button to
	 */
	_createNavigationButton(buttonType, parent) {
		const button = document.createElement('button');
		button.setAttribute('type', 'button');
		button.classList.add('navigation-button', buttonType, 'small');
		button.textContent = this._settings.navigationButtons[buttonType].text;
		button.addEventListener('click', () => {
			if (buttonType === 'next') {
				this.goToNextSlide();
			}
			else {
				this.goToPrevSlide();
			}
		});
		parent.appendChild(button);

		const icon = document.createElement('span');
		icon.className = 'icon ' + this._settings.navigationButtons[buttonType].icon;
		button.appendChild(icon);
	}
}

export default StoryPanel;
