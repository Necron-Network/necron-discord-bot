import { DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { MessageActionRow, MessageSelectMenu, VoiceChannel } from "discord.js";
import { decodeHTML } from "entities";
import { BaseCommand } from "../../structures/BaseCommand";
import { MusicHandler } from "../../structures/MusicHandler";
import { Song } from "../../structures/Song";
import { IMessage, ISong, ITextChannel } from "../../typings";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    devOnly: true,
    name: "testplay"
})
export class TestPlayCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!args.length) return message.channel.send({ embeds: [createEmbed("error", `Please, give me the name or link of the video you want to play.`)] });

        const voiceChannel = message.member!.voice.channel!;
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        if (message.guild?.music && voiceChannel.id !== message.guild.music.voiceChannel.id) return message.channel.send({ embeds: [createEmbed("error", `I'm currently playing music in \`${message.guild.music.voiceChannel.name}\` voice channel.`)] });

        let songData: ISong;
        try {
            const fetchUrl = new URL(url);

            if (/(www.|m\.)?(soundcloud|snd)(\.com|\.sc|\.app|\.goo|\.gl)/.test(fetchUrl.hostname)) {
                const data = await this.client.soundcloud.tracks.getV2(fetchUrl.toString());

                songData = {
                    duration: data.full_duration,
                    id: data.id.toString(),
                    thumbnail: data.artwork_url,
                    title: data.title,
                    type: "soundcloud",
                    url: data.uri
                };
            } else if (this.client.youtube.Regex.VIDEO_URL.test(fetchUrl.toString())) {
                const data = await this.client.youtube.getVideo(fetchUrl.toString());

                songData = {
                    duration: data.duration,
                    id: data.id!,
                    thumbnail: data.thumbnail!.url!,
                    title: data.title!,
                    type: "youtube",
                    url: data.url
                };
            } else {
                songData = {
                    duration: 0,
                    id: "",
                    thumbnail: "",
                    title: "Unknown Song",
                    type: "unknown",
                    url: fetchUrl.toString()
                };
            }
        } catch (err) {
            try {
                const videos = await this.client.youtube.search(searchString, { type: "video", limit: 10 });
                if (!videos.length) return message.channel.send({ embeds: [createEmbed("error", "No result.")] });

                const selection = new MessageSelectMenu().setCustomId("MUSIC_SELECT_MENU");

                selection.addOptions(videos.map((v, i) => ({
                    label: decodeHTML(v.title!).slice(0, 100),
                    value: `MUSIC-${i}`
                })));
                selection.addOptions({
                    label: "Cancel music selection",
                    value: "CANCEL"
                });

                const row = new MessageActionRow().addComponents(selection);
                const msg = await message.channel.send({
                    embeds: [createEmbed("info", "Please, select one of the results from the dropdown/select menu. You can select `Cancel music selection` if you want to cancel the music selection.")],
                    components: [row]
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

                const data = await this.client.youtube.getVideo(videos[parseInt(response.values[0].replace("MUSIC-", ""))].url);
                songData = {
                    duration: data.duration,
                    id: data.id!,
                    thumbnail: data.thumbnail!.url!,
                    title: data.title!,
                    type: "youtube",
                    url: data.url
                };
            } catch (err) {
                this.client.logger.error("YT_SEARCH_ERR:", err);
                return message.channel.send({ embeds: [createEmbed("error", `An error occured\n\`\`\`${err.message}\`\`\``)] });
            }
        }

        const song = new Song(songData);
        if (message.guild?.music) {
            message.guild.music.songs.addSong(song);
            message.channel.send({ embeds: [createEmbed("info", `**[${song.data.title}](${song.data.url})** has been added to the queue`).setThumbnail(song.data.thumbnail)] }).catch(() => null);
        } else {
            try {
                message.guild!.music = new MusicHandler(joinVoiceChannel({
                    adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator,
                    channelId: voiceChannel.id,
                    guildId: message.guild!.id
                }), message.guild!, message.channel as ITextChannel, voiceChannel as VoiceChannel);
                await entersState(message.guild!.music.connection, VoiceConnectionStatus.Ready, 30000);
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
    }
}
