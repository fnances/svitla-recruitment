import { Channel, User, Direct } from "@shared-interfaces";

export class FakeDatabase<T> {
  storage: Map<string, T>;

  constructor() {
    this.storage = new Map();
  }

  getAll(): Array<T> {
    const obj = {};
    const entries = Array.from(this.storage.entries());
    for (let [key, value] of entries) {
      obj[key] = value;
    }
    return Object.values(obj);
  }

  get(key: string): T {
    return this.storage.get(key);
  }

  exists(key: string): boolean {
    return this.storage.has(key);
  }

  create(key: string, value: any): void {
    this.storage.set(key, value);
  }

  createOrUpdate(key, newValue): T {
    const exists = this.get(key);

    if (exists) {
      const updated = { ...exists, ...newValue };
      this.storage.set(key, updated);
      return updated;
    } else {
      this.create(key, newValue);
    }
  }

  update(key, newValue: any) {
    this.storage.set(key, newValue);
  }

  delete(key: string) {
    return this.storage.delete(key);
  }

  findBy(property: string) {
    const all = this.getAll();
  }
}

export interface FakeDatabaseOptions {
  persistPath: string;
}

export type DatabaseModelType = User | Channel | Direct;

export class FakeDatabaseProvider {
  tables: { [index: string]: FakeDatabase<DatabaseModelType> } = {};
  persistPath: string;

  constructor(opts?: FakeDatabaseOptions) {
    if (opts) {
      this.persistPath = opts.persistPath;
    }
  }

  table<T>(tableName: string): FakeDatabase<T> {
    if (!this.tables[tableName]) {
      this.tables[tableName] = new FakeDatabase();
    }
    return this.tables[tableName] as FakeDatabase<T>;
  }

  load(path: string) {}
  dump(path: string) {}
}

let provider: FakeDatabaseProvider;

export const createFakeDatabaseProviderFactory = (): FakeDatabaseProvider => {
  if (!provider) {
    provider = new FakeDatabaseProvider();
  }

  return provider;
};
