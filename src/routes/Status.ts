import { BaseRoute } from "../structures/BaseRoute";
import { DefineRoute } from "../utils/decorators/DefineRoute";
import { Request, Response } from "express";

@DefineRoute({
    method: "get",
    name: "status",
    path: "/status"
})
export class Status extends BaseRoute {
    public execute(request: Request, response: Response): any {
        return response.send({ message: "Coming soon." });
    }
}
