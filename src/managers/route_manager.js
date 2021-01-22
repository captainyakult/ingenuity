import { RouteManager as BaseRouteManager } from 'es6-ui-library';

/**
 * Route Manager class.
 */
class RouteManager extends BaseRouteManager {
	/**
	 * Start the routing
	 */
	start() {
		this._router
			.on('/', (query) => {
				if (query) {
					query = '?' + query;
				}
				history.replaceState(query, '', '/#/home' + query);
				this._router.resolve();
			})
			.on('/home', (params, query) => {
				this.resetView('home');
				if (query) {
					query = this.parseQuery(query);
				}
				this._app.getView('home').init({ ...params, ...query });
			})
			.notFound((query) => {
				// Called when there is path specified but
				// there is no route matching
				let newRoute = '/home';
				// Try to pass the query stored in the params
				// to the new route
				if (query) {
					newRoute += '?' + query;
				}
				this._router.navigate(newRoute);
			})
			.resolve();
	}
}

export default RouteManager;
