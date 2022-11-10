export class DomainStore {
  private static _instance: DomainStore;
  private _domains: Set<string>;

  constructor() {
    this._domains = new Set();
  }

  public add(...domains: string[]) {
    domains.forEach((d) => this._domains.add(d));
  }

  public clear(): void {
    this._domains.clear();
  }

  public getAll(): string[] {
    return [...this._domains];
  }

  public has(domain: string): boolean {
    return this._domains.has(domain);
  }

  public static clear(): void {
    DomainStore.getInstance().clear();
  }

  public static getInstance(): DomainStore {
    if (!DomainStore._instance) DomainStore._instance = new DomainStore();
    return DomainStore._instance;
  }
}
