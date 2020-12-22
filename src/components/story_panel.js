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

		this._units = {
			metric: {
				distanceUnit: 'km',
				speedUnit: 'km/h'
			},
			imperial: {
				distanceUnit: 'mi',
				speedUnit: 'mph'
			}
		};

		this._state = {
			...this._state,
			liveClass: 'hidden',
			distance: 0,
			velocity: 0,
			altitude: 0,
			touchdown: 0,
			touchdownClass: '',
			isMetric: false,
			...this._units.imperial,
			textClass: ''
		};

		this._timestamps = [];
		this._touchdown = 0;
		this._keywords = {
			nextPhase: id => id + '-next-phase'
		};
		this._formatOpts = [undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }];

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
		this._settings.timeout = 500;

		this.update = this.update.bind(this);
		this.onUnitChange = this.onUnitChange.bind(this);
	}

	/**
	 * Create content for a slide.
	 * @param {object} info
	 * @param {object} nextInfo - Info for next slide
	 * @returns {string} - HTML string
	 */
	_createSlideContent(info, nextInfo) {
		const descriptionClass = info.description ? '' : 'hidden';
		info.mobileDescription = (info.mobileDescription !== undefined) ? info.mobileDescription : info.description;

		let html = `
			<div class="live-container {{liveClass}}">
				<span class="icon icon-live"></span>
				<span class="live semi color">live</span>
			</div>
			<h2 class="title">${info.title}</h2>
			<div class="body">
				<div class="distance {{textClass}}"><span key="distanceValue_${info.index}" class="value semi">{{distance}}</span><span class="unit">{{distanceUnit}}</span><span class="label">from landing site.</span></div>
				<div class="altitude {{textClass}}"><span class="label semi">Altitude: </span><span key="altitudeValue_${info.index}" class="value semi">{{altitude}}</span><span class="unit">{{distanceUnit}}</span></div>
				<div class="velocity {{textClass}}"><span class="label semi">Velocity: </span><span key="velocityValue_${info.index}" class="value semi">{{velocity}}</span><span class="unit">{{speedUnit}}</span></div>
				<div class="description ${descriptionClass} {{textClass}}">${info.description}</div>
				<div class="description mobile ${descriptionClass} {{textClass}}">${info.mobileDescription}</div>
			</div>
			<div class="footer">
				<div class="touchdown {{textClass}} {{touchdownClass}}"><span class="label">Touchdown in </span><span class="value semi">{{touchdown}}</span></div>
		`;

		if (nextInfo) {
			html += `
				<div class="phase">
					<div class="label {{textClass}}">Next phase:</div>
					<div class="{{textClass}}"><span>${nextInfo.title} in </span><span class="timer" key="${this._keywords.nextPhase(info.id)}">0:0</span></div>
				</div></div>
			`;
		}
		else {
			html += `
				</div>
			`;
		}

		return html;
	}

	/**
	 * Initialization.
	 */
	async init() {
		// Populate panel with all slides once since it doesn't change.
		const info = await AppUtils.loadJSON('./assets/story.json');

		const startTime = this._app.getManager('time').etToMoment(this._app.dateConstants.EDLStart).valueOf();

		info.forEach(({ id, title, description, mobileDescription, timestamp }, index) => {
			const nextInfo = index + 1 < info.length
				? info[index + 1]
				: null;
			const time = startTime + timestamp * 1000;
			this._timestamps.push(time);
			if (id === 'touchdown_flyaway') {
				this._touchdown = time;
			}
			this.addSlide({
				id,
				text: this._createSlideContent({ id, title, description, mobileDescription, index }, nextInfo)
			});
		});

		// Store time limits once since it doesn't change for this app.
		this._timeLimits = this._app.getManager('time').getLimits();

		window.addEventListener('resize', () => {
			this._updateFonts();
		});
		this._updateFonts();

		this._interval = setInterval(() => {
			// Return if not needed

			// Update distance
			const distance = this._app.getManager('scene').getDistance('sc_perseverance_rover', 'sc_perseverance_landing_site', { subtractRadius: false });

			// Update velocity
			const velocity = this._app.getManager('scene').getSpeed('sc_perseverance_rover', 'mars');

			// Update altitude
			const marsSpheroid = this._app.pioneer.get('main', 'mars', 'spheroid').getSpheroid();
			const lla = Pioneer.LatLonAlt.pool.get();
			const position = Pioneer.Vector3.pool.get();
			const mars = this._app.pioneer.get('main', 'mars');
			const perseverance = this._app.pioneer.get('main', 'sc_perseverance_rover');

			perseverance.getPositionRelativeToEntity(position, Pioneer.Vector3.Zero, mars);

			marsSpheroid.llaFromXYZ(lla, position, false);

			Pioneer.Vector3.pool.release(position);
			Pioneer.LatLonAlt.pool.release(lla);

			const { currentIndex } = this._state;
			// Update state
			this.setState({
				distance: this._formatDistance(distance, `distanceValue_${currentIndex}`),
				velocity: this._formatSpeed(velocity, `velocityValue_${currentIndex}`),
				altitude: this._formatDistance(lla.alt, `altitudeValue_${currentIndex}`)
			});
		}, 200);
	}

	/**
	 * Formats distance.
	 * @param {number} distance
	 * @param {string} elementKey
	 * @returns {string}
	 */
	_formatDistance(distance, elementKey) {
		distance = Number.parseFloat(distance);
		if (!this._state.isMetric) {
			distance = distance * AppUtils.conversionTable.kmToMi;
		}
		distance = distance.toFixed(2);
		const length = distance.toString().length;
		const width = length * 10;
		this._children[elementKey].style.width = width;

		const output = Number(distance).toLocaleString(...this._formatOpts);
		return output;
	}

	/**
	 * Formats speed.
	 * @param {number} speed
	 * @param {string} elementKey
	 * @returns {string}
	 */
	_formatSpeed(speed, elementKey) {
		speed = Number.parseFloat(speed * 3600);
		if (!this._state.isMetric) {
			speed = speed * AppUtils.conversionTable.kmToMi;
		}
		speed = speed.toFixed(2);
		const length = speed.toString().length;
		const width = length * 10;
		this._children[elementKey].style.width = width;

		const output = Number(speed).toLocaleString(...this._formatOpts);
		return output;
	}

	/**
	 * Handle unit change.
	 * @param {boolean} system
	 */
	onUnitChange(isMetric) {
		this.setState({
			isMetric,
			...(isMetric ? this._units.metric : this._units.imperial)
		});
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
			this._children[nextPhaseId].textContent = `${nextPhase.minute}:${nextPhase.second.toString().padStart(2, '0')}`;
		}
		this.setState({
			liveClass: isNow ? '' : 'hidden',
			touchdown: `${touchdown.hour}:${touchdown.minute.toString().padStart(2, '0')}:${touchdown.second.toString().padStart(2, '0')}`,
			touchdownClass: (this._touchdown - time) <= 0 ? 'hidden ' : ''
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
			this.setState({ textClass: 'small' });
		}
		else {
			this.setState({ textClass: '' });
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
