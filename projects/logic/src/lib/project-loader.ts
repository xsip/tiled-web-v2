import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

interface MyDB {
  binaries: {
    key: string;
    value: Uint8Array;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProjectLoader {
  private dbInstance!: IDBPDatabase<MyDB>;
  private initialized = false;
  constructor() {
  }

  public async initDB(): Promise<IDBPDatabase<MyDB>> {
    this.dbInstance = await openDB<MyDB>('TiledWeb', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects');
        }
      }
    });
    this.initialized = true;
    return this.dbInstance
  }

  async setBinary(key: string, value: Uint8Array): Promise<void> {
    await this.dbInstance.put('projects', value, key);
  }

  async getBinary(key: string): Promise<Uint8Array | undefined> {
    return await this.dbInstance.get('projects', key);
  }

  async deleteBinary(key: string): Promise<void> {
    await this.dbInstance.delete('projects', key);
  }

  async clearStore(): Promise<void> {
    await this.dbInstance.clear('projects');
  }
}
