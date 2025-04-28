import { networkInterfaces } from 'os';
import logger from '../config/logger';

interface NetworkInfo {
  interface: string;
  address: string;
  family: string;
  internal: boolean;
}

interface ConnectionInfo {
  timestamp: string;
  localAddress: string;
  remoteAddress: string;
  state: string;
}

/**
 * Get all network interfaces
 */
export function getNetworkInterfaces(): NetworkInfo[] {
  const interfaces = networkInterfaces();
  const result: NetworkInfo[] = [];

  Object.entries(interfaces).forEach(([name, addresses]) => {
    addresses?.forEach(addr => {
      result.push({
        interface: name,
        address: addr.address,
        family: `IPv${addr.family}`,
        internal: addr.internal
      });
    });
  });

  return result;
}

/**
 * Track connection information
 */
export class ConnectionTracker {
  private static instance: ConnectionTracker;
  private connections: ConnectionInfo[] = [];

  private constructor() {}

  static getInstance(): ConnectionTracker {
    if (!ConnectionTracker.instance) {
      ConnectionTracker.instance = new ConnectionTracker();
    }
    return ConnectionTracker.instance;
  }

  trackConnection(localAddress: string, remoteAddress: string, state: string): void {
    const info: ConnectionInfo = {
      timestamp: new Date().toISOString(),
      localAddress,
      remoteAddress,
      state
    };
    this.connections.push(info);
    logger.debug('Connection tracked:', info);
  }

  getConnections(): ConnectionInfo[] {
    return [...this.connections];
  }

  clear(): void {
    this.connections = [];
  }
}

/**
 * Log network debug information
 */
export function logNetworkInfo(): void {
  logger.info('=== Network Debug Information ===');
  
  // Log network interfaces
  const interfaces = getNetworkInterfaces();
  logger.info('Network Interfaces:', interfaces);
  
  // Log environment variables related to networking
  logger.info('Network Environment:', {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    REPL_SLUG: process.env.REPL_SLUG,
    REPL_OWNER: process.env.REPL_OWNER
  });
  
  // Log connection tracking
  const tracker = ConnectionTracker.getInstance();
  logger.info('Active Connections:', tracker.getConnections());
  
  logger.info('================================');
} 