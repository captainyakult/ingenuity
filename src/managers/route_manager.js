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
				this.resetView('home');
				if (query) {
					query = this.parseQuery(query);
				}
				this._app.getView('home').init({ ...query });
			})
			.notFound((query) => {
				// Called when there is path specified but
				// there is no route matching
				let newRoute = '/';
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
