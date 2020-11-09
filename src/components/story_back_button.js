import { BaseComponent } from 'es6-ui-library';
import 'es6-ui-library/css/clock_shortcut.css';
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
			this._app.getView('home').resetStoryPanel();
		});
		this._div.appendChild(this._container);

		this._children.icon = document.createElement('div');
		this._children.icon.className = 'icon  icon-arrow-left';
		this._container.appendChild(this._children.icon);

		this._children.text = document.createElement('div');
		this._children.text.className = 'text small';
		this._children.text.innerHTML = 'Back to current phase';
		this._container.appendChild(this._children.text);

		this._setVariables(this._div);
	}
}

export default StoryBackButton;
