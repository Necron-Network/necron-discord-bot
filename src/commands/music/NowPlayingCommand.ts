import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMusicPlaying } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["np"],
    description: "Show information about the currently playing music",
    name: "nowplaying",
    usage: "{prefix}nowplaying"
})
export class NowPlayingCommand extends BaseCommand {
    @isMusicPlaying()
    public execute(message: IMessage): any {
        const song = message.guild!.queue!.songs.first()!;
        return message.channel.send({ embeds: [createEmbed("info", `${message.guild?.queue?.playing ? "Paused" : "Playing"}: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail)] });
    }
}
