import { BaseComponent } from 'es6-ui-library';
import '../css/info_panel.css';

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
			visibleClass: 'hidden'
		};

		/**
		 * The children/grandchildren of element.
		 * @type {object}
		 */
		this._children = {

		};

		this._isVisible = false;
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
		this._children.closeButton.addEventListener('click', () => {
			this.setState({ visibleClass: 'hidden' });
		});

		// Add toggle button
		this._children.toggle = document.createElement('div');
		this._children.toggle.className = 'icon icon-info clickable';
		this._children.toggle.addEventListener('click', () => {
			this.setState({ visibleClass: 'active' });
		});
		this._div.appendChild(this._children.toggle);

		this._setVariables(this._div);
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
			this._children.panelContent.classList.add('small');
		}
		else {
			this._children.panelContent.classList.remove('small');
		}
	}
}

export default InfoPanel;
