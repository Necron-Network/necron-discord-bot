import { NecronClient } from "../structures/NecronClient";
import { Channel, User } from "discord.js";
import { IGuild } from "../typings";

export class NecronUtils {
    public constructor(public readonly client: NecronClient) {}

    public async fetchGuild(id: string, fromShard?: boolean): Promise<IGuild|undefined> {
        let data: IGuild|undefined;
        if (fromShard) {
            const fetchData = (await this.client.shard?.broadcastEval(c => c.guilds.cache.get(id))) as (IGuild|undefined)[]|undefined;
            data = fetchData?.find(g => g?.id === id);
        } else {
            data = this.client.guilds.cache.get(id) ?? this.client.guilds.fetch(id).catch(() => undefined);
        }

        return data;
    }

    public async fetchChannel(id: string): Promise<Channel|undefined> {
        return this.client.channels.cache.get(id) ?? this.client.channels.fetch(id).catch(() => undefined);
    }

    public async fetchUser(id: string): Promise<User|undefined> {
        return this.client.users.cache.get(id) ?? this.client.users.fetch(id).catch(() => undefined);
    }

    public toOrdinal(num: number): string {
        const ends: Record<string, string> = {
            1: "st",
            2: "nd",
            3: "rd"
        };

        return `${num}${ends[String(num).slice(-1)] as string|undefined ?? "th"}`;
    }

    public delay(ms: number): Promise<unknown> {
        return new Promise(res => setTimeout(res, ms));
    }
}
