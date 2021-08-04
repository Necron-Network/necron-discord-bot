import { BaseCommand } from "../../structures/BaseCommand";
import { Song } from "../../structures/Song";
import { MusicHandler } from "../../structures/MusicHandler";
import { IMessage, ISong, ITextChannel } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isSameVoiceChannel, isValidVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from "@discordjs/voice";
import { Video } from "youtube-sr";
import { VoiceChannel, MessageSelectMenu } from "discord.js";
import { decodeHTML } from "entities";

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
        if (!args.length) return message.channel.send({ embeds: [createEmbed("error", `Please, give me the name or link of the video you want to play.`)] });

        const voiceChannel = message.member!.voice.channel!;
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        if (message.guild?.music && voiceChannel.id !== message.guild.music.voiceChannel.id) return message.channel.send({ embeds: [createEmbed("error", `I'm currently playing music in \`${message.guild.music.voiceChannel.name}\` voice channel.`)] });

        let video: Video;
        try {
            video = await this.client.youtube.getVideo(url);
        } catch (e) {
            try {
                const videos = await this.client.youtube.search(searchString, { type: "video", limit: 10 });
                if (!videos.length) return message.channel.send({ embeds: [createEmbed("error", "No result.")] });

                const selection = new MessageSelectMenu().setCustomId("MUSIC_SELECT_MENU");

                selection.addOptions(videos.map((v, i) => ({
                    label: decodeHTML(v.title!).slice(0, 25),
                    value: `MUSIC-${i}`
                })));
                selection.addOptions({
                    label: "Cancel music selection",
                    value: "CANCEL"
                });

                const msg = await message.channel.send({
                    embeds: [createEmbed("info", "Please, select one of the results from the dropdown/select menu. You can select `Cancel music selection` if you want to cancel the music selection.")],
                    components: [{ components: [selection] }]
                });

                const response = await message.channel.awaitMessageComponent({
                    time: 15000,
                    filter: i => {
                        void i.deferUpdate();
                        if (!i.isSelectMenu()) return false;

                        return (message.author.id === i.user.id) && (i.values.includes("CANCEL") || i.values.some(x => x.startsWith("MUSIC-")));
                    }
                }).catch(() => undefined);

                if (!response || !response.isSelectMenu()) return message.channel.send({ embeds: [createEmbed("error", "No valid input was given, music selection canceled")] });

                msg.delete().catch(() => null);

                if (response.customId === "CANCEL") return message.channel.send({ embeds: [createEmbed("warn", "Music selection canceled")] });
                video = await this.client.youtube.getVideo(videos[parseInt(response.values[0].replace("MUSIC-", ""))].url);
            } catch (err) {
                this.client.logger.error("YT_SEARCH_ERR:", err);
                return message.channel.send({ embeds: [createEmbed("error", `An error occured\n\`\`\`${err.message}\`\`\``)] });
            }
        }
        return this.handleVideo(video, message, voiceChannel as VoiceChannel);
    }

    private async handleVideo(video: Video, message: IMessage, voiceChannel: VoiceChannel): Promise<any> {
        const data: ISong = {
            duration: video.duration,
            id: video.id!,
            thumbnail: video.thumbnail!.url!,
            title: video.title!,
            url: video.url
        };
        const song = new Song(data);

        if (message.guild?.music) {
            message.guild.music.songs.addSong(song);
            message.channel.send({ embeds: [createEmbed("info", `**[${song.data.title}](${song.data.url})** has been added to the queue`).setThumbnail(song.data.thumbnail)] }).catch(() => null);
        } else {
            try {
                message.guild!.music = new MusicHandler(joinVoiceChannel({
                    adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator,
                    channelId: voiceChannel.id,
                    guildId: message.guild!.id
                }), message.guild!, message.channel as ITextChannel, voiceChannel);
            } catch (error) {
                delete message.guild?.music;
                this.client.logger.error("PLAY_CMD_ERR:", error);
                message.channel.send({ embeds: [createEmbed("error", `An error occured while joining the voice channel, reason: **\`${error.message}\`**`)] }).catch(() => null);
                return;
            }

            message.guild?.music.songs.addSong(song);
            message.channel.send({ embeds: [createEmbed("info", `**[${song.data.title}](${song.data.url})** has been added to the queue`).setThumbnail(song.data.thumbnail)] }).catch(() => null);
            message.guild?.music.play().catch(err => {
                message.channel.send({ embeds: [createEmbed("error", `An error occurred while trying to play music, reason: **\`${err.message}\`**`)] }).catch(() => null);
            });
        }
        return message;
    }
}
