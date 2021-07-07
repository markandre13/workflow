// import { IDBPDatabase, openDB } from 'idb';

class IndexDB {
    db?: IDBDatabase

    constructor() {
        // const deleteRequest = window.indexedDB.deleteDatabase(this.databaseName)
        // deleteRequest.onerror = this.onError
        // deleteRequest.onsuccess = (event) => {
        //   console.log("Database deleted")
        //   this.openDatabase()
        // }
    }

    // IDBVersionChangeEvent
    deleteDatabase(databaseName: string) {
        return new Promise<Event>((resolve, reject) => {
            const deleteRequest = window.indexedDB.deleteDatabase(databaseName)
            deleteRequest.onerror = reject
            deleteRequest.onsuccess = resolve
        })
    }

    open(databaseName: string, version: number, onupgrade: (db: IDBDatabase) => void) {
        return new Promise<Event>((resolve, reject) => {
            const openRequest = window.indexedDB.open(databaseName, version)
            openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                this.db = (event.target as IDBRequest).result
                onupgrade(this.db!)
            }
            openRequest.onerror = reject
            openRequest.onsuccess = (event: Event) => {
                this.db = (event.target as IDBRequest).result
                resolve(event)
            }
        })
    }

    // TODO: add a list of entities?
    add(storeName: string, entity: any) {
        if (!this.db)
            throw Error("no database")
        const transaction = this.db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.add(entity)
        return new Promise<Event>((resolve, reject) => {
            request.onerror = reject
            request.onsuccess = resolve
        })
    }

    // put(, key)  // the key is needed for autoincrement indexes. there the key isn't part of the record/entity, if ommited, put() will work like add()

    get(storeName: string, index: number) {
        if (!this.db)
            throw Error("no database")
        const transaction = this.db.transaction(storeName, "readwrite") // storeName can be a list of stores involved in the transaction!
        const store = transaction.objectStore(storeName)
        const request = store.get(index)
        return new Promise<Event>((resolve, reject) => {
            request.onerror = reject
            request.onsuccess = resolve
        })

        // store.
    }
}

describe("IndexedDB", function () {
    it.only("promise", async function () {
        const db = new IndexDB()
        // TODO: create objectstores and register them in db?
        let result

        result = await db.deleteDatabase("workflow")

        result = await db.open("workflow", 1, (db: IDBDatabase) => {
            // db.objectStoreNames contains a list of object stores which already exist
            const objectStore = db.createObjectStore("document", {
                keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("name", "name", { unique: false })
        })
        // console.log(result)

        result = await db.add("document", { name: "Untitled.wf", content: [{ type: "rectangle" }, { type: "circle" }] })
        const id = (result.target as IDBRequest).result as number
        // console.log(id)

        result = await db.get("document", id)
        const entity = (result.target as IDBRequest).result
        console.log(entity)
    })
})
