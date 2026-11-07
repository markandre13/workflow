import { add, deleteDatabase, deleteRow, get, openDatabase, put } from "client/utils/indexeddb"

import { expect, use } from "chai"
import chaiAsPromised from "chai-as-promised"
use(chaiAsPromised)

interface Shape {
    type: string
}

interface MyDocument {
    id?: number
    name: string
    content: Shape[]
}

describe("IndexedDB", function () {
    it("works as promised", async function () {
        await deleteDatabase("workflow")
        const db = await openDatabase("workflow", 1, (event) => {
            const objectStore = (event.target as IDBOpenDBRequest).result.createObjectStore("document", {
                keyPath: "id",
                autoIncrement: true
            })
            objectStore.createIndex("name", "name", { unique: true })
        })

        // we can add an entry
        const doc1: MyDocument = { name: "Untitled.wf", content: [{ type: "rectangle" }, { type: "circle" }] }
        await add(db, "document", doc1)

        // and retrieve it again using its id
        let entity = await get(db, "document", 1) as MyDocument | undefined
        expect(entity?.name).to.equal("Untitled.wf")

        // we can add another entry with a different name
        await add(db, "document", { name: "Untitled-1.wf", content: [{ type: "rectangle" }, { type: "circle" }] })
        entity = await get(db, "document", 2) as MyDocument | undefined
        expect(entity?.name).to.equal("Untitled-1.wf")

        // we can replace an existing entry
        await put(db, "document", { id: 1, name: "Untitled.wf", content: [{ type: "circle" }, { type: "text" }] })
        entity = await get(db, "document", 1) as MyDocument | undefined
        expect(entity?.content[0].type).to.equal("circle")

        // when we violate the index constraint we get an exception
        await expect(add(db, "document", { name: "Untitled.wf", content: [] })).to.be.rejected

        // we can delete an existing entry
        await deleteRow(db, "document", 1)

        // retrieving a deleted entry returns undefined
        entity = await get(db, "document", 1) as MyDocument | undefined
        expect(entity).to.be.undefined

        // deleting a deleted entry does not cause an error
        await deleteRow(db, "document", 1)

        db.close()
    })
})
