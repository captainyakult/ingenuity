import app from './app';
import * as Pioneer from 'pioneer-js';

document.addEventListener('DOMContentLoaded', async () => {
	await app.init();
	window.app = app;
	window.Pioneer = Pioneer;

	try {
		// await app.createManagers();
		// await app.createComponents();
		// app.getManager('router').start();
	}
	catch (error) {
		console.log(error);
	}
});
