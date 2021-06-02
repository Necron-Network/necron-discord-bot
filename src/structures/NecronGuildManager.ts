import { GuildManager, Snowflake, Collection, Client } from "discord.js";
import { IGuild } from "../typings";

export class NecronGuildManager extends GuildManager {
    public readonly cache: Collection<Snowflake, any> = new Collection<Snowflake, IGuild>();

    public constructor(client: unknown, iterable?: Iterable<any>) { super(client as Client, iterable); }
}
