import { BaseComponent } from 'es6-ui-library';
import '../css/story_back_button.css';

/**
 * Extended ClockShortcut from es6-ui-library.
 * @class
 * @augments ClockShortcut
 */
class StoryBackButton extends BaseComponent {
	/**
	 * Constructor.
	 * @param {BaseApplication} app
	 * @param {HTMLDivElement} div
	 */
	constructor(app, div) {
		super(app, div);

		this._state = {
		};

		/**
		 * The children/grandchildren of element.
		 * @type {object}
		 */
		this._children = {
			container: null,
			icon: null,
			text: null
		};

		this._isVisible = false;

		this.updateText = this.updateText.bind(this);
	}

	/**
	 * Initialization.
	 * Called automatically by addComponent.
	 * @returns {Promise}
	 */
	async init() {
		this._div.classList.add('story-back');

		this._container = document.createElement('div');
		this._container.className = 'container clickable';
		this._container.addEventListener('click', () => {
			this._app.getView('home').resetStoryPanelMobile();
		});
		this._div.appendChild(this._container);

		this._children.icon = document.createElement('div');
		this._children.icon.className = 'icon icon-story';
		this._container.appendChild(this._children.icon);

		this._children.text = document.createElement('h5');
		this._container.appendChild(this._children.text);

		this._setVariables(this._div);
	}

	/**
	 * Update the display text.
	 * @param {object} info - Current slide's info
	 */
	updateText(info) {
		this._children.text.innerHTML = info.title;
	}
}

export default StoryBackButton;
