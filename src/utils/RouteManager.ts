import { IRouterComponent, IRoutesComponent } from "../typings";
import { NecronClient } from "../structures/NecronClient";
import { Collection } from "discord.js";
import { resolve, parse } from "path";
import fs from "fs/promises";
import { AddressInfo } from "net";
import express from "express";
import morgan from "morgan";

export class RouteManager {
    public readonly router: Collection<string, IRouterComponent> = new Collection();
    public readonly routes: Collection<string, IRoutesComponent> = new Collection();
    public readonly app = express();

    public constructor(private readonly client: NecronClient, private readonly path: string) {}

    public load(): void {
        this.app.use(morgan("common"));
        fs.readdir(resolve(this.path))
            .then(async routes => {
                this.client.logger.info(`Loading ${routes.length} routes...`);
                for (const file of routes) {
                    const route = await this.import(resolve(this.path, file), this.client);
                    if (route === undefined) throw new Error(`File ${file} is not a valid routes file`);
                    this.client.logger.info(`Route ${route.meta.path} with method ${route.meta.method} assigned on ${route.meta.router ?? "/"} router is now loaded.`);
                    if (route.meta.router === "/" || !route.meta.router) {
                        if (route.meta.customCallback?.length) {
                            this.app[route.meta.method](route.meta.path, ...route.meta.customCallback, route.execute.bind(route));
                            continue;
                        }
                        this.app[route.meta.method](route.meta.path, route.execute.bind(route));
                        continue;
                    }
                    if (!this.router.has(route.meta.router)) {
                        this.router.set(route.meta.router, {
                            path: route.meta.router,
                            routes: [route.meta.path],
                            instance: express.Router()
                        });
                    }
                    if (this.routes.has(route.meta.name.toLowerCase())) {
                        return this.client.logger.warn("Some route has a same name, and it's conflict. Please change the conflicting routes name.");
                    }
                    this.routes.set(route.meta.name.toLowerCase(), route);
                    const router = this.router.get(route.meta.router);
                    router!.routes.push(route.meta.path);
                    if (route.meta.customCallback?.length) {
                        router!.instance[route.meta.method](route.meta.path, ...route.meta.customCallback, route.execute.bind(route));
                    } else {
                        router!.instance[route.meta.method](route.meta.path, route.execute.bind(route));
                    }
                }
            })
            .catch(err => this.client.logger.error("LISTENER_LOADER_ERR:", err))
            .finally(() => {
                this.client.logger.info("Done loading routes.");
                for (const router of this.router.values()) {
                    this.app.use(router.path, router.instance);
                    this.client.logger.info(`Registered ${router.path} router.`);
                }
                const listener = this.app.listen(this.client.config.port, () => {
                    this.client.logger.info(`Your app is listening on port ${(listener.address() as AddressInfo).port}`);
                });
            });
    }

    private async import(path: string, ...args: any[]): Promise<IRoutesComponent | undefined> {
        const file = (await import(resolve(path)).then(m => m[parse(path).name]));
        return file ? new file(...args) : undefined;
    }
}
