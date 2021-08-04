import { NecronClient } from "../structures/NecronClient";
import { ITextChannel } from "../typings";
import { Collection } from "discord.js";
import { createEmbed } from "./createEmbed";

export interface IGiveawayRoleRequirement {
    type: "role";
    roleID: string;
    guildID: string;
}

export interface IGiveawayGuildRequirement {
    type: "guild";
    guildID: string;
}

export interface IGiveawayRoleEntry {
    type: "role";
    roleID: string;
    guildID: string;
    entries: number;
}

export interface IGiveawayGuildEntry {
    type: "guild";
    guildID: string;
    entries: number;
}

export type IGiveawayRequirement = IGiveawayRoleRequirement|IGiveawayGuildRequirement;
export type IGiveawayEntry = IGiveawayRoleEntry|IGiveawayGuildEntry;

export interface IGiveawayProps {
    item: string;
    winners: number;
    requirements: IGiveawayRequirement[];
    entries: IGiveawayEntry[];
}

export interface IGiveaway {
    giveawayID: string;
    endsAt: number;
    guildID: string;
    channelID: string;
    messageID: string;
    props: IGiveawayProps;
    ended: boolean;
}

export class GiveawayManager {
    public readonly cache: Collection<string, IGiveaway> = new Collection();
    private readonly collection = this.client.db?.collection<IGiveaway>("giveaway");
    private readonly intervals: Collection<string, NodeJS.Timeout> = new Collection();

    public constructor(public readonly client: NecronClient) {}

    public async initialize(): Promise<void> {
        if (!this.collection) throw Error("Couldn't contact database");

        const giveaways = await this.collection.find().toArray();
        for (const giveaway of giveaways.filter(g => this.client.guilds.cache.has(g.guildID))) {
            this.cache.set(giveaway.giveawayID, giveaway);
            this.loadInterval(giveaway.giveawayID);
        }
    }

    public async fetchGiveaway(giveawayID: string, cache: boolean): Promise<IGiveaway|null|undefined> {
        const data = await this.collection?.findOne({ giveawayID });

        if (cache && data) {
            this.cache.set(data.giveawayID, data);
        }

        return data;
    }

    public loadInterval(giveawayID: string): void {
        if (this.intervals.has(giveawayID)) return;

        const interval = setInterval(async () => {
            const giveaway = this.cache.get(giveawayID);
            if (!giveaway || Date.now() > giveaway.endsAt) return;

            void this.end(giveawayID);
        }, 3000);

        this.intervals.set(giveawayID, interval);
    }

    public async end(giveawayID: string): Promise<void> {
        const data = this.cache.get(giveawayID) ?? await this.fetchGiveaway(giveawayID, false);
        if (!data) return;

        const guild = await this.client.utils.fetchGuild(data.guildID, true);
        const channel = (this.client.channels.cache.get(data.channelID) ?? await this.client.utils.fetchChannel(data.channelID)) as ITextChannel|undefined;
        const message = await channel?.messages.fetch(data.messageID).catch(() => undefined);
        if (!message) return;

        const users = message.reactions.cache.get("🎉")?.users.cache.filter(x => x.id !== this.client.user!.id);
        if (users?.size && (users.size > data.props.winners)) {
            const entries: string[] = [];

            for (const user of [...users.values()]) {
                entries.push(user.id);

                if (data.props.entries.length) {
                    for (const entryReq of data.props.entries) {
                        const entryGuild = entryReq.guildID === guild?.id ? guild : (await this.client.utils.fetchGuild(entryReq.guildID, true) ?? await this.client.utils.fetchGuild(entryReq.guildID));
                        const entryGuildMember = entryGuild?.members.cache.get(user.id) ?? await entryGuild?.members.fetch(user.id).catch(() => undefined);

                        if (!entryGuild) continue;
                        if (!entryGuildMember || entryGuildMember.deleted) continue;
                        if (entryReq.type === "role" && !entryGuildMember.roles.cache.has(entryReq.roleID)) continue;

                        for (let n = 0; n < entryReq.entries; n++) {
                            entries.push(user.id);
                        }
                    }
                }
            }

            // The rest will be added later
        } else {
            channel?.send({ embeds: [createEmbed("error")] });
        }
    }
}
