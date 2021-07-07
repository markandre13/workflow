/*
 *  workflow - A collaborative real-time white- and kanban board
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export class IndexedDB {
    db?: IDBDatabase
    stores: ObjectStore<any>[] = []

    delete(databaseName: string) {
        return new Promise<Event>((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(databaseName)
            request.onerror = () => reject(request.error)
            request.onsuccess = resolve
        })
    }

    open(databaseName: string, version: number) {
        return new Promise<Event>((resolve, reject) => {
            const request = window.indexedDB.open(databaseName, version)
            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                this.db = (event.target as IDBRequest).result
                this.stores.forEach(store => store.upgrade(this.db!))
            }
            request.onerror = () => reject(request.error)
            request.onsuccess = (event: Event) => {
                this.db = request.result
                resolve(event)
            }
        })
    }
}

export class ObjectStore<T> {
    db: IndexedDB
    storeName: string
    upgrade: (db: IDBDatabase) => void

    constructor(db: IndexedDB, storeName: string, upgrade: (db: IDBDatabase) => void) {
        this.db = db
        this.storeName = storeName
        this.upgrade = upgrade
        db.stores.push(this)
    }

    async add(entity: T): Promise<IDBValidKey> {
        const transaction = this.db.db!.transaction(this.storeName, "readwrite")
        const store = transaction.objectStore(this.storeName)
        const request = store.add(entity)
        return new Promise<IDBValidKey>((resolve, reject) => {
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    }

    async put(entity: T, key?: IDBValidKey): Promise<IDBValidKey> {
        const transaction = this.db.db!.transaction(this.storeName, "readwrite")
        const store = transaction.objectStore(this.storeName)
        const request = store.put(entity, key)
        return new Promise<IDBValidKey>((resolve, reject) => {
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    }

    async get(query: IDBValidKey | IDBKeyRange): Promise<T | undefined> {
        const transaction = this.db.db!.transaction(this.storeName, "readonly")
        const store = transaction.objectStore(this.storeName)
        const request = store.get(query)
        return new Promise<T | undefined>((resolve, reject) => {
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    }

    async getAll(query?: IDBValidKey | IDBKeyRange, count?: number): Promise<T[]> {
        const transaction = this.db.db!.transaction(this.storeName, "readonly")
        const store = transaction.objectStore(this.storeName)
        const request = store.getAll(query, count)
        return new Promise<T[]>((resolve, reject) => {
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    }

    async getAllKeys(query?: IDBValidKey | IDBKeyRange, count?: number): Promise<IDBValidKey[]> {
        const transaction = this.db.db!.transaction(this.storeName, "readonly")
        const store = transaction.objectStore(this.storeName)
        const request = store.getAllKeys(query, count)
        return new Promise<IDBValidKey[]>((resolve, reject) => {
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)
        })
    }

    async delete(index: IDBValidKey): Promise<Event> {
        const transaction = this.db.db!.transaction(this.storeName, "readwrite")
        const store = transaction.objectStore(this.storeName)
        const request = store.delete(index)
        return new Promise<Event>((resolve, reject) => {
            request.onerror = () => reject(request.error)
            request.onsuccess = resolve
        })
    }
}
