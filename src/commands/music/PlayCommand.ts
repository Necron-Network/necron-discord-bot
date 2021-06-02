import { BaseCommand } from "../../structures/BaseCommand";
import { ServerQueue } from "../../structures/ServerQueue";
import { IGuild, IMessage, ISong, ITextChannel } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isSameVoiceChannel, isValidVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";
import { Video } from "youtube-sr";
import { Util, VoiceChannel } from "discord.js";
import { decodeHTML } from "entities";
import ytdl from "discord-ytdl-core";
let disconnectTimer: NodeJS.Timeout;

@DefineCommand({
    aliases: ["p"],
    description: "Play some music",
    name: "play",
    usage: "{prefix}play <query|video url>"
})
export class PlayCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isValidVoiceChannel()
    @isSameVoiceChannel()
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!args.length) return message.channel.send(createEmbed("error", `Please, give me the name or link of the video/playlist you want to play.`));

        const voiceChannel = message.member!.voice.channel!;
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        if (message.guild?.queue && voiceChannel.id !== message.guild.queue.voiceChannel?.id) return message.channel.send(createEmbed("error", `I'm currently playing music in \`${message.guild.queue.voiceChannel!.name}\` voice channel.`));

        let video: Video;
        try {
            video = await this.client.youtube.getVideo(url);
        } catch (e) {
            try {
                const videos = await this.client.youtube.search(searchString, { type: "video", limit: 10 });
                if (!videos.length) return message.channel.send(createEmbed("error", "No result."));

                const msg = await message.channel.send(createEmbed("info", `\`\`\`${videos.map((x, i) => `${i + 1} - ${Util.escapeMarkdown(decodeHTML(x.title!))}`).join("\n")}\`\`\`\nPlease, select one of the results.`)
                    .setFooter("Type \"cancel\" to cancel the music selection"));

                const response = await message.channel.awaitMessages((m: IMessage) => (message.author.id === m.author.id) && (m.content === "cancel" || (Number(m.content) >= 1 && Number(m.content) <= videos.length)), {
                    errors: ["time"],
                    max: 1,
                    time: 15000
                }).catch(() => undefined);

                if (!response) return message.channel.send(createEmbed("error", "No valid input was given, music selection canceled"));

                msg.delete().catch(() => null);
                setTimeout(() => response.first()?.delete().catch(() => null), 3000);

                if (response.first()?.content === "cancel") return message.channel.send(createEmbed("warn", "Music selection canceled"));
                video = await this.client.youtube.getVideo(videos[parseInt(response.first()!.content) - 1].url);
            } catch (err) {
                this.client.logger.error("YT_SEARCH_ERR:", err);
                return message.channel.send(createEmbed("error", `An error occured\n\`\`\`${err.message}\`\`\``));
            }
        }
        return this.handleVideo(video, message, voiceChannel);
    }

    private async handleVideo(video: Video, message: IMessage, voiceChannel: VoiceChannel): Promise<any> {
        const song: ISong = {
            duration: video.duration,
            id: video.id!,
            thumbnail: video.thumbnail!.url!,
            title: video.title!,
            url: video.url
        };

        if (message.guild?.queue) {
            message.guild.queue.songs.addSong(song);
            message.channel.send(createEmbed("info", `**[${song.title}](${song.url})** has been added to the queue`).setThumbnail(song.thumbnail)).catch(() => null);
        } else {
            message.guild!.queue = new ServerQueue(message.channel as ITextChannel, voiceChannel);
            message.guild?.queue.songs.addSong(song);

            message.channel.send(createEmbed("info", `**[${song.title}](${song.url})** has been added to the queue`).setThumbnail(song.thumbnail)).catch(() => null);

            try {
                const connection = await message.guild!.queue.voiceChannel!.join();
                message.guild!.queue.connection = connection;
            } catch (error) {
                message.guild!.queue.songs.clear();
                delete message.guild?.queue;
                this.client.logger.error("PLAY_CMD_ERR:", error);
                message.channel.send(createEmbed("error", `An error occured while joining the voice channel, reason: **\`${error.message}\`**`)).catch(() => null);
                return;
            }
            this.play(message.guild!).catch(err => {
                message.channel.send(createEmbed("error", `An error occurred while trying to play music, reason: **\`${err.message}\`**`)).catch(() => null);
            });
        }
        return message;
    }

    private async play(guild: IGuild): Promise<any> {
        const serverQueue = guild.queue!;
        const song = serverQueue.songs.first();
        const timeout = 60000;
        clearTimeout(disconnectTimer);

        if (!song) {
            if (serverQueue.lastMusicMessageID) serverQueue.textChannel?.messages.fetch(serverQueue.lastMusicMessageID, false).catch(() => undefined).then(m => m?.delete());
            if (serverQueue.lastVoiceStateUpdateMessageID) serverQueue.textChannel?.messages.fetch(serverQueue.lastVoiceStateUpdateMessageID, false).catch(() => undefined).then(m => m?.delete());

            serverQueue.textChannel?.send(createEmbed("info", "The music has ended.")).catch(() => null);
            disconnectTimer = setTimeout(() => {
                serverQueue.connection?.disconnect();
                serverQueue.textChannel?.send(createEmbed("info", "Inactive for too long, leaving voice channel...")).catch(() => undefined).then(m => {
                    if (!m) return;

                    setTimeout(() => m.delete().catch(() => null), 5000);
                });
            }, timeout);
            delete guild.queue;
            return;
        }

        serverQueue.connection?.voice?.setSelfDeaf(true).catch(() => null);
        serverQueue.connection?.play(ytdl(song.url, {
            filter: "audioonly",
            quality: "highestaudio",
            opusEncoded: true
        }).on("error", err => { err.message = `YTDLError: ${err.message}`; serverQueue.connection?.dispatcher.emit("error", err); }), {
            type: "opus",
            bitrate: "auto",
            highWaterMark: 1
        }).on("start", () => {
            serverQueue.playing = true;
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Music: "${song.title}" on ${guild.name} has started`);
            if (serverQueue.lastMusicMessageID) serverQueue.textChannel?.messages.fetch(serverQueue.lastMusicMessageID, false).catch(() => undefined).then(m => m?.delete());
            serverQueue.textChannel?.send(createEmbed("info", `Started playing: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail))
                .catch(() => undefined)
                .then(m => serverQueue.lastMusicMessageID = m?.id);
        }).on("finish", () => {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Music: "${song.title}" on ${guild.name} has ended`);
            serverQueue.songs.deleteFirst();
            if (serverQueue.lastMusicMessageID) serverQueue.textChannel?.messages.fetch(serverQueue.lastMusicMessageID, false).catch(() => undefined).then(m => m?.delete());
            serverQueue.textChannel?.send(createEmbed("info", `Started playing: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail))
                .catch(() => undefined)
                .then(m => serverQueue.lastMusicMessageID = m?.id)
                .finally(() => {
                    this.play(guild).catch(e => {
                        serverQueue.textChannel?.send(createEmbed("error", `An error occured while trying to play music\n\`\`\`${e.message}\`\`\``)).catch(() => null);
                        serverQueue.connection?.dispatcher.end();
                    });
                });
        })
            .on("error", (err: Error) => {
                serverQueue.textChannel?.send(createEmbed("error", `An error occurred while playing music, reason: **\`${err.message}\`**`)).catch(() => null);
                guild.queue?.voiceChannel?.leave();
                delete guild.queue;
            });
    }
}
