import { createEmbed } from "../utils/createEmbed";
import { SongManager } from "../utils/SongManager";
import { IGuild, ITextChannel } from "../typings";
import { VoiceConnection, AudioPlayer, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus, AudioPlayerState } from "@discordjs/voice";
import { Snowflake, VoiceChannel } from "discord.js";

export class MusicHandler {
    public readonly player: AudioPlayer;
    public readonly songs = new SongManager();
    public lastMusicMessageID: Snowflake|undefined = undefined;
    public lastVoiceStateUpdateMessageID: Snowflake|undefined = undefined;
    public timeout: NodeJS.Timeout|undefined = undefined;
    public loopMode = false;
    public readyLock = false;
    private disconnectTimer: NodeJS.Timeout|undefined = undefined;

    public constructor(public readonly connection: VoiceConnection, public readonly guild: IGuild, public readonly textChannel: ITextChannel, public voiceChannel: VoiceChannel) {
        this.player = createAudioPlayer();

        this.connection.on("stateChange", async (oldState, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                this.connection.destroy();
            } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                this.stop();
            }
        });

        this.player.on("stateChange", (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                const song = this.songs.first()!;

                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                this.guild.client.logger.info(`${this.guild.client.shard ? `[Shard #${this.guild.client.shard.ids}]` : ""} Music: "${song.data.title}" on ${this.guild.name} has ended`);
                this.songs.deleteFirst();
                this.textChannel.send({ embeds: [createEmbed("info", `Started playing: **[${song.data.title}](${song.data.url})**`).setThumbnail(song.data.thumbnail)] })
                    .catch(() => undefined)
                    .finally(() => {
                        this.play().catch(e => {
                            this.textChannel.send({ embeds: [createEmbed("error", `An error occured while trying to play music\n\`\`\`${e.message}\`\`\``)] }).catch(() => null);
                            this.connection.destroy();
                        });
                    });
            } else if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
                const song = this.songs.first()!;

                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                this.guild.client.logger.info(`${this.guild.client.shard ? `[Shard #${this.guild.client.shard.ids}]` : ""} Music: "${song.data.title}" on ${this.guild.name} has started`);
                if (this.lastMusicMessageID) void this.textChannel.messages.fetch(this.lastMusicMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
                void this.textChannel.send({ embeds: [createEmbed("info", `Started playing: **[${song.data.title}](${song.data.url})**`).setThumbnail(song.data.thumbnail)] })
                    .catch(() => undefined)
                    .then(m => this.lastMusicMessageID = m?.id);
            }
        });
    }

    public stop(): void {
        this.songs.clear();
        this.player.stop();
    }

    public async play(oldState?: AudioPlayerState): Promise<void> {
        if ((oldState ? (oldState.status !== AudioPlayerStatus.Idle) : true) && this.player.state.status === AudioPlayerStatus.Playing) return;

        const song = this.songs.first();
        const timeout = 60000;
        clearTimeout(this.disconnectTimer!);
        this.disconnectTimer = undefined;

        if (!song) {
            if (this.lastMusicMessageID) void this.textChannel.messages.fetch(this.lastMusicMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
            if (this.lastVoiceStateUpdateMessageID) void this.textChannel.messages.fetch(this.lastVoiceStateUpdateMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());

            this.textChannel.send({ embeds: [createEmbed("info", "The music has ended.")] }).catch(() => null);
            this.disconnectTimer = setTimeout(() => {
                this.connection.destroy();
                void this.textChannel.send({ embeds: [createEmbed("info", "Inactive for too long, leaving voice channel...")] }).catch(() => undefined).then(m => {
                    if (!m) return;

                    setTimeout(() => m.delete().catch(() => null), 5000);
                });
            }, timeout);
            delete this.guild.music;
            return;
        }

        const resource = await song.download();
        this.player.play(resource);
    }
}
