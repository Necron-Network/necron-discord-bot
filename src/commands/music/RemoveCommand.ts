import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["rm"],
    description: "Remove a song from queue",
    name: "remove",
    usage: "{prefix}remove <number>"
})
export class RemoveCommand extends BaseCommand {
    @isMusicPlaying()
    @isUserInTheVoiceChannel()
    @isSameVoiceChannel()
    public execute(message: IMessage, args: string[]): any {
        if (isNaN(Number(args[0]))) return message.channel.send({ embeds: [createEmbed("error", "Invalid number")] });

        const songs = message.guild!.music!.songs.array();
        const current = message.guild!.music!.songs.first()!;
        const song = songs[parseInt(args[0]) - 1];

        if (current.data.id === song.data.id) {
            message.guild?.music?.player.stop();
        } else {
            message.guild?.music?.songs.delete(message.guild.music.songs.findKey(x => x.data.id === song.data.id)!);
        }

        message.channel.send({ embeds: [createEmbed("info", `Remove **[${song.data.title}](${song.data.url})**`).setThumbnail(song.data.thumbnail)] }).catch(() => null);
    }
}
