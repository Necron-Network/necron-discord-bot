import { NecronClient } from "../structures/NecronClient";
import { VoiceChannel } from "discord.js";
import { IGuild } from "../typings";

export interface IMemberCounter {
    guild: string;
    category: string;
    channels: {
        id: string;
        format: string;
    }[];
}

export class MemberCounterManager {
    public constructor(public readonly client: NecronClient) {}

    public loadInterval(): void {
        setInterval(async () => {
            if (!this.client.db) return this.client.logger.error("MEMBERCOUNTER_INTERVAL_ERR: Database unavailable");
            const counters = await this.client.db.collection<IMemberCounter>("membercounter").find().toArray();
            for (const counter of counters.filter(x => this.client.guilds.cache.has(x.guild))) {
                const guild = await this.client.utils.fetchGuild(counter.guild, true) ?? await this.client.utils.fetchGuild(counter.guild);
                if (!guild) continue;
                for (const ch of counter.channels) {
                    if (!(ch as any|undefined)?.id) continue;
                    const channel = await this.client.utils.fetchChannel(ch.id);
                    if (!channel) continue;
                    await (channel as VoiceChannel).setName(this.parseString(ch.format, guild));
                }
            }
        }, 60000);
    }

    public parseString(str: string, guild: IGuild): string {
        return str.replace(/{guild.member.count}/g, guild.members.cache.size.toString())
            .replace(/{guild.member.presence.online.count}/g, guild.members.cache.filter(m => m.user.presence.status === "online").size.toString())
            .replace(/{guild.member.presence.dnd.count}/g, guild.members.cache.filter(m => m.user.presence.status === "dnd").size.toString())
            .replace(/{guild.member.presence.idle.count}/g, guild.members.cache.filter(m => m.user.presence.status === "idle").size.toString())
            .replace(/{guild.member.presence.invisible.count}/g, guild.members.cache.filter(m => m.user.presence.status === "invisible").size.toString())
            .replace(/{guild.member.presence.offline.count}/g, guild.members.cache.filter(m => m.user.presence.status === "offline").size.toString())
            .replace(/{guild.bot.count}/g, guild.members.cache.filter(m => m.user.bot).size.toString())
            .replace(/{guild.bot.presence.online.count}/g, guild.members.cache.filter(m => m.user.bot && (m.user.presence.status === "online")).size.toString())
            .replace(/{guild.bot.presence.dnd.count}/g, guild.members.cache.filter(m => m.user.bot && (m.user.presence.status === "dnd")).size.toString())
            .replace(/{guild.bot.presence.idle.count}/g, guild.members.cache.filter(m => m.user.bot && (m.user.presence.status === "idle")).size.toString())
            .replace(/{guild.bot.presence.invisible.count}/g, guild.members.cache.filter(m => m.user.bot && (m.user.presence.status === "invisible")).size.toString())
            .replace(/{guild.bot.presence.offline.count}/g, guild.members.cache.filter(m => m.user.bot && (m.user.presence.status === "offline")).size.toString())
            .replace(/{guild.user.count}/g, guild.members.cache.filter(m => !m.user.bot).size.toString())
            .replace(/{guild.user.presence.online.count}/g, guild.members.cache.filter(m => !m.user.bot && (m.user.presence.status === "online")).size.toString())
            .replace(/{guild.user.presence.dnd.count}/g, guild.members.cache.filter(m => !m.user.bot && (m.user.presence.status === "dnd")).size.toString())
            .replace(/{guild.user.presence.idle.count}/g, guild.members.cache.filter(m => !m.user.bot && (m.user.presence.status === "idle")).size.toString())
            .replace(/{guild.user.presence.invisible.count}/g, guild.members.cache.filter(m => !m.user.bot && (m.user.presence.status === "invisible")).size.toString())
            .replace(/{guild.user.presence.offline.count}/g, guild.members.cache.filter(m => !m.user.bot && (m.user.presence.status === "offline")).size.toString())
            .replace(/{guild.voice.count}/g, guild.channels.cache.filter(c => c.type === "voice").size.toString())
            .replace(/{guild.text.count}/g, guild.channels.cache.filter(c => c.type === "text").size.toString())
            .replace(/{guild.category.count}/g, guild.channels.cache.filter(c => c.type === "category").size.toString());
    }
}
