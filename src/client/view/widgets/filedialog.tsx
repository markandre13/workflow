import { bind } from "bind-decorator"

export function openFile() {
    if (!window.indexedDB) {
        console.log("No IndexedDB available.")
        return
    }

    const fs = new Filesystem()

    const filedialog = <div>
        A FileDialog!!!
        <br />
        <button>Cancel</button>
        <button>Open</button>
    </div>
    // document.body.appendChild(filedialog)
}

// id parent name data
//
//

// make this a subclass of Model
class Filesystem {
    db!: IDBDatabase
    databaseName = "workflow"

    // use Promise instead!
    commandQueue: (()=>void)[] = []

    constructor() {

        // delete
        // open
        // write
        // read
        // signal

        // this.openDatabase()

        const deleteRequest = window.indexedDB.deleteDatabase(this.databaseName)
        deleteRequest.onerror = this.onError
        deleteRequest.onsuccess = (event) => {
          console.log("Database deleted")
          this.openDatabase()
        }
    }

    openDatabase() {
        var openRequest = window.indexedDB.open(this.databaseName, 3)
        openRequest.onerror = this.onError
        openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            this.db = openRequest.result
            this.db.onerror = this.onError
            this.onUpgrade(event)
        }
        openRequest.onsuccess = (event: Event) => {
            this.db = openRequest.result
            this.db.onerror = this.onError
            this.onOpen(event)
        }
        // const x = openRequest.result

        // (event: IDBVersionChangeEvent) => {
        //     console.log("Initializing/Upgrading database")
        //     var db = event.target.result;
        //     db.onerror = function(event) {
        //       console.log("Error opening database")
        //       console.log(event)
        //     }
        //     var objectStore = db.createObjectStore("document", {
        //       keyPath: "id",
        //       autoIncrement: true
        //     })
        //     // indexed fields
        //     objectStore.createIndex("name", "name", { unique: false })
        //     // objectStore.createIndex("content", "content", { unique: false })
        //     console.log("object store created")
        // }
    }

    @bind onError(event: Event) {
        console.log("ERROR")
        console.log(event)
    }

    @bind onUpgrade(event: IDBVersionChangeEvent) {
        console.log("UPGRADE")
        console.log(event)

        const objectStore = this.db.createObjectStore("document", {
            keyPath: "id",
            autoIncrement: true
        })
        // indexed fields
        objectStore.createIndex("name", "name", { unique: false })
        // objectStore.createIndex("content", "content", { unique: false })
        console.log("object store created")
    }

    @bind onOpen(event: Event) {
        console.log("OPEN")
        console.log(event)
    }
}
