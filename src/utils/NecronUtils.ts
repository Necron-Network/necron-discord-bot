import { NecronClient } from "../structures/NecronClient";
import { Guild, Channel, User } from "discord.js";

export class NecronUtils {
    public constructor(public readonly client: NecronClient) {}

    public async fetchGuild(id: string): Promise<Guild|undefined> {
        return this.client.guilds.cache.get(id) ?? this.client.guilds.fetch(id).catch(() => undefined);
    }

    public async fetchChannel(id: string): Promise<Channel|undefined> {
        return this.client.channels.cache.get(id) ?? this.client.channels.fetch(id).catch(() => undefined);
    }

    public async fetchUser(id: string): Promise<User|undefined> {
        return this.client.users.cache.get(id) ?? this.client.users.fetch(id).catch(() => undefined);
    }
}
