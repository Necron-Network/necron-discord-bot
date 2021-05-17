import { IListener } from "../typings";
import { NecronClient } from "./NecronClient";

export class BaseListener implements IListener {
    public constructor(public client: NecronClient, public readonly name: IListener["name"]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public execute(...args: any): any {}
}
