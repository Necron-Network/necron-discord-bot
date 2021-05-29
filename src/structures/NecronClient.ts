/* eslint-disable @typescript-eslint/no-misused-promises */
import { Client, ClientOptions } from "discord.js";
import got from "got";
import { resolve } from "path";
import * as config from "../config";
import { CommandManager } from "../utils/CommandManager";
import { createLogger } from "../utils/Logger";
import { formatMS } from "../utils/formatMS";
import { ListenerLoader } from "../utils/ListenerLoader";
import { NecronUtils } from "../utils/NecronUtils";
import { MemberCounterManager } from "../utils/MemberCounterManager";
import { Db } from "mongodb";

export class NecronClient extends Client {
    public readonly config = config;
    public readonly logger = createLogger("bot", this.config.isProd);
    public readonly request = got;
    public readonly commands = new CommandManager(this, resolve(__dirname, "..", "commands"));
    // @ts-expect-error override
    public readonly listeners = new ListenerLoader(this, resolve(__dirname, "..", "listeners"));
    public db: Db|null = null;
    public readonly utils = new NecronUtils(this);
    public readonly memberCounter = new MemberCounterManager(this);

    public constructor(opt: ClientOptions) { super(opt); }

    public async build(token: string): Promise<NecronClient> {
        const start = Date.now();
        this.listeners.load();
        this.on("ready", () => {
            this.logger.info(`Ready took ${formatMS(Date.now() - start)}`);
        });
        await this.login(token);
        return this;
    }
}
