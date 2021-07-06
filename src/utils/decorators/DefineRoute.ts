import { NecronClient } from "../../structures/NecronClient";
import { IRoutesComponent } from "../../typings";

export function DefineRoute(meta: IRoutesComponent["meta"]): any {
    return function decorate<T extends IRoutesComponent>(target: new (...args: any[]) => T): new (client: NecronClient) => T {
        return new Proxy(target, {
            construct: (ctx, [client]): T => new ctx(client, meta)
        });
    };
}
