/**
 * Service to handle route persistence across page refreshes
 */

const LAST_ROUTE_KEY = 'last_route';

export class RouteService {
  /**
   * Save the current route
   */
  static saveRoute(route: string): void {
    sessionStorage.setItem(LAST_ROUTE_KEY, route);
  }

  /**
   * Get the last saved route or return default
   */
  static getLastRoute(defaultRoute = '/'): string {
    return sessionStorage.getItem(LAST_ROUTE_KEY) || defaultRoute;
  }

  /**
   * Clear the saved route
   */
  static clearRoute(): void {
    sessionStorage.removeItem(LAST_ROUTE_KEY);
  }
}
