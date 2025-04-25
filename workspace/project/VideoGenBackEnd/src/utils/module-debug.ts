import logger from '../config/logger';

interface ModuleInfo {
  id: string;
  filename: string;
  parent?: string;
  children: string[];
  loadTimestamp: string;
  loadOrder: number;
}

class ModuleDependencyTracker {
  private static instance: ModuleDependencyTracker;
  private modules: Map<string, ModuleInfo> = new Map();
  private loadCounter: number = 0;

  private constructor() {}

  static getInstance(): ModuleDependencyTracker {
    if (!ModuleDependencyTracker.instance) {
      ModuleDependencyTracker.instance = new ModuleDependencyTracker();
    }
    return ModuleDependencyTracker.instance;
  }

  trackModule(moduleObj: NodeModule): void {
    const moduleId = moduleObj.id;
    if (this.modules.has(moduleId)) {
      return;
    }

    this.loadCounter++;
    const moduleInfo: ModuleInfo = {
      id: moduleId,
      filename: moduleObj.filename,
      parent: moduleObj.parent?.filename,
      children: [],
      loadTimestamp: new Date().toISOString(),
      loadOrder: this.loadCounter
    };

    // Update parent's children list
    if (moduleObj.parent) {
      const parentInfo = this.modules.get(moduleObj.parent.id);
      if (parentInfo) {
        parentInfo.children.push(moduleId);
      }
    }

    this.modules.set(moduleId, moduleInfo);
    this.logModuleLoad(moduleInfo);
  }

  private logModuleLoad(moduleInfo: ModuleInfo): void {
    logger.debug('Module loaded:', {
      loadOrder: moduleInfo.loadOrder,
      filename: moduleInfo.filename,
      parent: moduleInfo.parent || 'none',
      timestamp: moduleInfo.loadTimestamp
    });
  }

  getDependencyChain(moduleId: string): string[] {
    const chain: string[] = [];
    let currentModule = this.modules.get(moduleId);
    
    while (currentModule) {
      chain.unshift(currentModule.filename);
      if (!currentModule.parent) break;
      currentModule = this.modules.get(currentModule.parent);
    }
    
    return chain;
  }

  printDependencyTree(rootModuleId: string, indent: string = ''): void {
    const moduleInfo = this.modules.get(rootModuleId);
    if (!moduleInfo) return;

    logger.info(`${indent}${moduleInfo.filename} (${moduleInfo.loadOrder})`);
    for (const childId of moduleInfo.children) {
      this.printDependencyTree(childId, indent + '  ');
    }
  }

  getLoadSequence(): ModuleInfo[] {
    return Array.from(this.modules.values())
      .sort((a, b) => a.loadOrder - b.loadOrder);
  }
}

export const trackModule = (moduleObj: NodeModule): void => {
  ModuleDependencyTracker.getInstance().trackModule(moduleObj);
};

export const getDependencyChain = (moduleId: string): string[] => {
  return ModuleDependencyTracker.getInstance().getDependencyChain(moduleId);
};

export const printModuleTree = (rootModuleId: string): void => {
  ModuleDependencyTracker.getInstance().printDependencyTree(rootModuleId);
};

export const getModuleLoadSequence = (): ModuleInfo[] => {
  return ModuleDependencyTracker.getInstance().getLoadSequence();
}; 