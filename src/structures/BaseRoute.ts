import { IRoutesComponent } from "../typings";
import { NecronClient } from "./NecronClient";
import { Request, Response } from "express";

export abstract class BaseRoute implements IRoutesComponent {
    public constructor(public readonly client: NecronClient, public readonly meta: IRoutesComponent["meta"]) {}

    public abstract execute(request: Request, response: Response): any;
}
