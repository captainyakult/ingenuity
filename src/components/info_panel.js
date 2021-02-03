import { BaseComponent } from 'es6-ui-library';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import '../css/info_panel.css';

import OverlayScrollbars from 'overlayscrollbars';

/**
 * Info panel class.
 * @class
 */
class InfoPanel extends BaseComponent {
	/**
	 * Constructor.
	 * @param {BaseApplication} app
	 * @param {HTMLDivElement} div
	 */
	constructor(app, div) {
		super(app, div);

		this._state = {
			visibleClass: ''
		};

		/**
		 * The children/grandchildren of element.
		 * @type {object}
		 */
		this._children = {

		};

		/**
		 * Scrollbar library instance.
		 * @type {OverlayScrollbars}
		 */
		this._scrollbar = null;

		this.openPanel = this.openPanel.bind(this);
		this.closePanel = this.closePanel.bind(this);
	}

	/**
	 * Initialization.
	 * Called automatically by addComponent.
	 * @returns {Promise}
	 */
	async init() {
		this._div.classList.add('info-panel');

		// Load info panel html
		await this.loadHTML('info.html');
		// Add on click function
		this._children.closeButton.addEventListener('click', this.closePanel);

		// Add toggle button
		this._children.toggle = document.createElement('div');
		this._children.toggle.className = 'icon icon-info clickable toggle';
		this._children.toggle.addEventListener('click', this.openPanel);
		this._div.appendChild(this._children.toggle);

		// Add animation end callback
		this._children.infoPanelOverlay.addEventListener('animationend', () => {
			// Listen to css animation end to update div display
			const computedStyle = window.getComputedStyle(this._children.infoPanelOverlay);
			if (computedStyle.opacity === '0') {
				this._children.infoPanelOverlay.style.display = 'none';
			}
			else {
				this._children.infoPanelOverlay.style.display = 'block';
			}
		}, true);

		this._setVariables(this._div);
		this._updateFonts();

		window.addEventListener('resize', () => {
			this._updateFonts();
		});
	}

	/**
	 * Update content on route change
	 * @param {string} objectId
	 */
	onRouteChange() {
		// Scrollbar
		if (this._scrollbar === null) {
			// Setup Scrollbar
			this._scrollbar = new OverlayScrollbars(document.getElementById('info-panel-overlay'), {
				className: 'os-theme-dark',
				resize: 'none',
				sizeAutoCapable: false,
				clipAlways: false,
				normalizeRTL: false,
				paddingAbsolute: true,
				autoUpdate: false,
				overflowBehavior: {
					x: 'hidden',
					y: 'scroll'
				},
				scrollbars: {
					clickScrolling: true
				}
			});
		}
		else {
			// Reset scroll to top
			this._scrollbar.scroll(0);
		}
	}

	/**
	 * Update fonts.
	 */
	_updateFonts() {
		if (this._app.isMobile() || this._app.isLandscape()) {
			this._children.panelContent.classList.add('small');
		}
		else {
			this._children.panelContent.classList.remove('small');
		}
	}

	/**
	 * Opens info panel.
	 */
	openPanel() {
		this._children.infoPanelOverlay.style.display = 'block';
		this.setState({ visibleClass: 'active' });
	}

	/**
	 * Closes info panel.
	 */
	closePanel() {
		this.setState({ visibleClass: 'hidden' });
	}
}

export default InfoPanel;
