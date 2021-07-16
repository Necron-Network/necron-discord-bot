import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { MusicHandler } from "../structures/MusicHandler";
import { IVoiceState } from "../typings";
import { createEmbed } from "../utils/createEmbed";
import { AudioPlayerStatus } from "@discordjs/voice";
import { Collection, Snowflake, GuildMember, VoiceChannel } from "discord.js";
import { formatMS } from "../utils/formatMS";

@DefineListener("voiceStateUpdate")
export class VoiceStateUpdateEvent extends BaseListener {
    public execute(oldState: IVoiceState, newState: IVoiceState): any {
        const music = newState.guild.music;

        if (!music) return;

        const newVC = newState.channel;
        const oldVC = oldState.channel;
        const oldID = oldVC?.id;
        const newID = newVC?.id;
        const queueVC = music.voiceChannel;
        const oldMember = oldState.member;
        const member = newState.member;
        const queueVCMembers = queueVC.members.filter(m => !m.user.bot);
        const newVCMembers = newVC?.members.filter(m => !m.user.bot);
        const botID = this.client.user?.id;

        // Handle when bot gets kicked from the voice channel
        if (oldMember?.id === botID && oldID === queueVC.id && !newID) {
            try {
                if (music.lastMusicMessageID) void music.textChannel.messages.fetch(music.lastMusicMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
                if (music.lastVoiceStateUpdateMessageID) void music.textChannel.messages.fetch(music.lastVoiceStateUpdateMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Disconnected from the voice channel at ${newState.guild.name}, the queue has been deleted.`);
                music.textChannel.send({ embeds: [createEmbed("error", "I was disconnected from the voice channel, the queue has been deleted.")] }).catch(() => null);
                delete newState.guild.music;
                return;
            } catch (e) {
                this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
            }
        }

        if (newState.mute !== oldState.mute || newState.deaf !== oldState.deaf) return;

        // Handle when the bot is moved to another voice channel
        if (member?.id === botID && oldID === queueVC.id && newID !== queueVC.id && newID !== undefined) {
            if (!newVCMembers) return;
            if (newVCMembers.size === 0 && !music.timeout) this.doTimeout(newVCMembers, music, newState);
            else if (newVCMembers.size !== 0 && music.timeout) this.resumeTimeout(newVCMembers, music, newState);
            newState.guild.music!.voiceChannel = newVC as VoiceChannel;
        }

        // Handle when user leaves voice channel
        if (oldID === queueVC.id && newID !== queueVC.id && !member?.user.bot && !music.timeout) this.doTimeout(queueVCMembers, music, newState);

        // Handle when user joins voice channel or bot gets moved
        if (newID === queueVC.id && !member?.user.bot) this.resumeTimeout(queueVCMembers, music, newState);
    }

    private doTimeout(vcMembers: Collection<Snowflake, GuildMember>, music: MusicHandler|undefined, newState: IVoiceState): any {
        try {
            if (vcMembers.size !== 0) return;
            clearTimeout(music!.timeout!);
            newState.guild.music!.timeout = undefined;
            music!.player.pause();
            const timeout = 300000;
            const duration = formatMS(timeout);
            if (music?.lastVoiceStateUpdateMessageID) void music.textChannel.messages.fetch(music.lastVoiceStateUpdateMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
            newState.guild.music!.timeout = setTimeout(() => {
                music?.connection.destroy();
                delete newState.guild.music;
                if (music?.lastMusicMessageID) void music.textChannel.messages.fetch(music.lastMusicMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
                if (music?.lastVoiceStateUpdateMessageID) void music.textChannel.messages.fetch(music.lastVoiceStateUpdateMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
                music!.textChannel.send({ embeds: [createEmbed("error", `⏹ **|** **\`${duration}\`** have passed and there's no one who joined the voice channel, the queue has deleted.`).setTitle("Queue Deleted")] }).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
            }, timeout);
            music!.textChannel.send({ embeds: [createEmbed("warn", `⏸ **|** Everyone has left from the voice channel. To save resources, the queue has paused. If there's no one who joins the voice channel in the next **\`${duration}\`**, the queue will be deleted.`).setTitle("Music Player Paused")] }).then(m => music!.lastVoiceStateUpdateMessageID = m.id).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
        } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
    }

    private resumeTimeout(vcMembers: Collection<Snowflake, GuildMember>, music: MusicHandler, newState: IVoiceState): any {
        if (vcMembers.size > 0) {
            if (music.player.state.status === AudioPlayerStatus.Playing) return;
            try {
                clearTimeout(music.timeout!);
                newState.guild.music!.timeout = undefined;
                const song = music.songs.first();
                if (music.lastVoiceStateUpdateMessageID) void music.textChannel.messages.fetch(music.lastVoiceStateUpdateMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
                void music.textChannel.send({ embeds: [createEmbed("info", `▶ **|** Someone has joined the voice channel.\nNow Playing: **[${song!.data.title}](${song!.data.url})**`).setThumbnail(song!.data.thumbnail).setTitle("Music Player Resumed")] }).catch(() => undefined).then(m => music.lastVoiceStateUpdateMessageID = m?.id);
                newState.guild.music?.player.unpause();
            } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
        }
    }
}
