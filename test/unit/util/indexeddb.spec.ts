import { IndexedDB, ObjectStore } from "client/utils/indexeddb"

import { expect, use } from "chai"
import chaiAsPromised = require('chai-as-promised')
use(chaiAsPromised)

interface Shape {
    type: string
}

interface MyDocument {
    name: string
    content: Shape[]
}

/*
Generally they only commit when the last success/error callback fires and that callback schedules no more requests.
-- https://stackoverflow.com/questions/10484965/how-can-i-put-several-requests-in-one-transaction-in-indexeddb

we need some API to handle multiple operations within a single transaction:

db.transaction([store1, store2], "readwrite", ([store1, store2]) => []
    store1.add(...)
    store2.add(...)
})
*/

describe("IndexedDB", function () {
    it("works as promised", async function () {
        let result

        const db = new IndexedDB()
        const store = new ObjectStore<MyDocument>(db, "document", (db: IDBDatabase) => {
            const objectStore = db.createObjectStore("document", {
                // keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("name", "name", { unique: true })
        })

        result = await db.delete("workflow")
        result = await db.open("workflow", 1)

        // we can add an entry
        const id1 = await store.add({ name: "Untitled.wf", content: [{ type: "rectangle" }, { type: "circle" }] })
        expect(id1).to.equal(1)

        // and retrieve it again using the returned id
        let entity = await store.get(id1)
        expect(entity?.name).to.equal("Untitled.wf")

        // when we violate the index constraint we get an exception
        expect(store.add({ name: "Untitled.wf", content: [{ type: "rectangle" }, { type: "circle" }] })).to.be.rejectedWith(Error)

        // but we add another entry which does not violate the index constraint
        const id2 = await store.add({ name: "Untitled-1.wf", content: [{ type: "rectangle" }, { type: "circle" }] })
        expect(id2).to.equal(2)

        // we can replace an existing entry
        result = await store.put({ name: "Untitled.wf", content: [{ type: "circle" }, { type: "text" }] }, id1)

        entity = await store.get(id1)
        expect(entity?.content[0].type).to.equal("circle")

        // we can retrieve all stored entries at once
        const allEntries = await store.getAll()
        expect(allEntries.length).to.equal(2)
        expect(allEntries[0].name).to.equal("Untitled.wf")
        expect(allEntries[1].name).to.equal("Untitled-1.wf")

        // we can retrieve all stored keys at once
        const allKeys = await store.getAllKeys()
        expect(allKeys.length).to.equal(2)
        expect(allKeys[0]).to.equal(id1)
        expect(allKeys[1]).to.equal(id2)

        // we can delete an existing entry
        result = await store.delete(id1)

        // retrieving a deleted entry returns undefined
        entity = await store.get(id1)
        expect(entity).to.be.undefined

        // deleting a deleted entry does not cause an error
        result = await store.delete(id1)
    })
})
