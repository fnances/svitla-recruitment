export interface ModuleInstance {
  onModuleInit: () => Promise<void>;
  onModuleShutdown?: () => Promise<void>;
}

