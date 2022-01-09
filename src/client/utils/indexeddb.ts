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

// FIXME: we might get success before upgradeneeded is finished?

export async function openDatabase(name: string, version: number, upgrade: (event: IDBVersionChangeEvent) => void): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(name, version) as IDBOpenDBRequest
        request.onupgradeneeded = (event) => {
            upgrade(event)
        }
        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result)
        request.onerror = (error) => reject((error.target as IDBOpenDBRequest).error)
    })
}

export async function deleteDatabase(name: string) {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.deleteDatabase(name)
        request.onsuccess = (event) => resolve(event)
        request.onerror = (error) => reject(error)
    })
}

export async function add(db: IDBDatabase, storeName: string, value: any) {
    return new Promise((resolve, reject) => {
        // console.log(`${db.name}.${storeName}.add(${value})`)
        const transaction = db.transaction([storeName], "readwrite")
        transaction.oncomplete = (event) => resolve(event)
        transaction.onerror = (error) => reject(error)
        const store = transaction.objectStore(storeName)
        store.add(value)
    })
}

export async function put(db: IDBDatabase, storeName: string, value: any) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite")
        transaction.oncomplete = (event) => resolve(event)
        transaction.onerror = (error) => reject(error)
        const store = transaction.objectStore(storeName)
        store.put(value)
    })
}

export async function get(db: IDBDatabase, storeName: string, key: any) {
    return new Promise((resolve, reject) => {
        try {
            const request = db
                .transaction([storeName], "readonly")
                .objectStore(storeName)
                .get(key)
            request.onsuccess = (event) => resolve((event.target as IDBRequest).result)
            request.onerror = (error) => reject(error)
        }
        catch (error) {
            resolve(undefined)
        }
    })
}

export async function deleteRow(db: IDBDatabase, storeName: string, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = db
            .transaction([storeName], "readwrite").objectStore(storeName)
            .delete(key)
        request.onsuccess = () => resolve()
        request.onerror = (error) => reject(error)
    })
}
