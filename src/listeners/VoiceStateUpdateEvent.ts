import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { IVoiceState } from "../typings";
import { createEmbed } from "../utils/createEmbed";
import { Collection, Snowflake, GuildMember } from "discord.js";
import { ServerQueue } from "../structures/ServerQueue";
import { formatMS } from "../utils/formatMS";

@DefineListener("voiceStateUpdate")
export class VoiceStateUpdateEvent extends BaseListener {
    public execute(oldState: IVoiceState, newState: IVoiceState): any {
        /* const queue = newState.guild.queue;

        if (!queue) return;

        const newVC = newState.channel;
        const oldVC = oldState.channel;
        const oldID = oldVC?.id;
        const newID = newVC?.id;
        const queueVC = queue.voiceChannel!;
        const oldMember = oldState.member;
        const member = newState.member;
        const queueVCMembers = queueVC.members.filter(m => !m.user.bot);
        const newVCMembers = newVC?.members.filter(m => !m.user.bot);
        const botID = this.client.user?.id;

        // Handle when bot gets kicked from the voice channel
        if (oldMember?.id === botID && oldID === queueVC.id && !newID) {
            try {
                if (queue.lastMusicMessageID) queue.textChannel?.messages.fetch(queue.lastMusicMessageID, false).catch(() => undefined).then(m => m?.delete());
                if (queue.lastVoiceStateUpdateMessageID) queue.textChannel?.messages.fetch(queue.lastVoiceStateUpdateMessageID, false).catch(() => undefined).then(m => m?.delete());
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Disconnected from the voice channel at ${newState.guild.name}, the queue has been deleted.`);
                queue.textChannel?.send(createEmbed("error", "I was disconnected from the voice channel, the queue has been deleted.")).catch(() => null);
                delete newState.guild.queue;
                return;
            } catch (e) {
                this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
            }
        }

        if (newState.mute !== oldState.mute || newState.deaf !== oldState.deaf) return;

        // Handle when the bot is moved to another voice channel
        if (member?.id === botID && oldID === queueVC.id && newID !== queueVC.id && newID !== undefined) {
            if (!newVCMembers) return;
            if (newVCMembers.size === 0 && queue.timeout === null) this.doTimeout(newVCMembers, queue, newState);
            else if (newVCMembers.size !== 0 && queue.timeout !== null) this.resumeTimeout(newVCMembers, queue, newState);
            newState.guild.queue!.voiceChannel = newVC;
        }

        // Handle when user leaves voice channel
        if (oldID === queueVC.id && newID !== queueVC.id && !member?.user.bot && !queue.timeout) this.doTimeout(queueVCMembers, queue, newState);

        // Handle when user joins voice channel or bot gets moved
        if (newID === queueVC.id && !member?.user.bot) this.resumeTimeout(queueVCMembers, queue, newState); */
    }

    private doTimeout(vcMembers: Collection<Snowflake, GuildMember>, queue: ServerQueue, newState: IVoiceState): any {
        /* try {
            if (vcMembers.size !== 0) return;
            clearTimeout(queue.timeout!);
            newState.guild.queue!.timeout = null;
            newState.guild.queue!.playing = false;
            queue.connection?.dispatcher.pause();
            const timeout = 300000;
            const duration = formatMS(timeout);
            if (queue.lastVoiceStateUpdateMessageID) queue.textChannel?.messages.fetch(queue.lastVoiceStateUpdateMessageID, false).catch(() => undefined).then(m => m?.delete());
            newState.guild.queue!.timeout = setTimeout(() => {
                queue.voiceChannel?.leave();
                delete newState.guild.queue;
                if (queue.lastMusicMessageID) queue.textChannel?.messages.fetch(queue.lastMusicMessageID, false).catch(() => undefined).then(m => m?.delete());
                if (queue.lastVoiceStateUpdateMessageID) queue.textChannel?.messages.fetch(queue.lastVoiceStateUpdateMessageID, false).catch(() => undefined).then(m => m?.delete());
                queue.textChannel?.send(
                    createEmbed("error", `⏹ **|** **\`${duration}\`** have passed and there's no one who joined the voice channel, the queue has deleted.`)
                        .setTitle("Queue Deleted")
                ).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
            }, timeout);
            queue.textChannel?.send(
                createEmbed("warn", "⏸ **|** Everyone has left from the voice channel. To save resources, the queue has paused. " +
                    `If there's no one who joins the voice channel in the next **\`${duration}\`**, the queue will be deleted.`)
                    .setTitle("Music Player Paused")
            ).then(m => queue.lastVoiceStateUpdateMessageID = m.id).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
        } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); } */
    }

    private resumeTimeout(vcMembers: Collection<Snowflake, GuildMember>, queue: ServerQueue, newState: IVoiceState): any {
        /* if (vcMembers.size > 0) {
            if (queue.playing) return;
            try {
                clearTimeout(queue.timeout!);
                newState.guild.queue!.timeout = null;
                const song = queue.songs.first();
                if (queue.lastVoiceStateUpdateMessageID) queue.textChannel?.messages.fetch(queue.lastVoiceStateUpdateMessageID, false).catch(() => undefined).then(m => m?.delete());
                queue.textChannel?.send(
                    createEmbed("info", `▶ **|** Someone has joined the voice channel.\nNow Playing: **[${song!.title}](${song!.url})**`)
                        .setThumbnail(song!.thumbnail)
                        .setTitle("Music Player Resumed")
                ).catch(() => undefined).then(m => queue.lastVoiceStateUpdateMessageID = m?.id);
                newState.guild.queue!.playing = true;
                newState.guild.queue?.connection?.dispatcher.resume();
            } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
        } */
    }
}
