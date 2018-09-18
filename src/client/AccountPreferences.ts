import { Dialog } from "toad.js"

export class AccountPreferences extends Dialog
{
    constructor(user: any) {
        super()

        this.open("src/client/AccountPreferences.html")
        
        this.bind("fullname", user.fullname)
        this.bind("email", user.email)
        
        this.action("cancel", () => {
          this.close()
        })
        this.action("save", () => {
          this.close()
        })
    }
}
