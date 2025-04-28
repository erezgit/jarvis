/**
 * Service to handle route persistence across page refreshes
 */
const LAST_ROUTE_KEY = 'last_route';
export class RouteService {
    /**
     * Save the current route
     */
    static saveRoute(route) {
        sessionStorage.setItem(LAST_ROUTE_KEY, route);
    }
    /**
     * Get the last saved route or return default
     */
    static getLastRoute(defaultRoute = '/') {
        return sessionStorage.getItem(LAST_ROUTE_KEY) || defaultRoute;
    }
    /**
     * Clear the saved route
     */
    static clearRoute() {
        sessionStorage.removeItem(LAST_ROUTE_KEY);
    }
}
