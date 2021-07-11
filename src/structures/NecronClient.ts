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
import { VoteReminder } from "../utils/VoteReminder";
import { WelcomeMessageManager } from "../utils/WelcomeMessageManager";
import { InfractionManager } from "../utils/InfractionManager";
import { GuildLogsManager } from "../utils/GuildLogsManager";
import { Db } from "mongodb";
import Youtube from "youtube-sr";

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
    public readonly voteReminder = new VoteReminder(this);
    public readonly youtube = Youtube;
    public readonly welcomer = new WelcomeMessageManager(this);
    public readonly infraction = new InfractionManager(this);
    public readonly logs = new GuildLogsManager(this);

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
