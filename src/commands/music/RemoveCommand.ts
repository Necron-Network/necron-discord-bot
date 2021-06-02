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
        if (isNaN(Number(args[0]))) return message.channel.send(createEmbed("error", "Invalid number"));

        const songs = message.guild!.queue!.songs.array();
        const current = message.guild!.queue!.songs.first()!;
        const song = songs[parseInt(args[0]) - 1];

        if (current.id === song.id) {
            message.guild!.queue!.playing = true;
            message.guild?.queue?.connection?.dispatcher.once("speaking", () => message.guild?.queue?.connection?.dispatcher.end());
            message.guild!.queue?.connection?.dispatcher.resume();
        } else {
            message.guild?.queue?.songs.delete(message.guild.queue.songs.findKey(x => x.id === song.id)!);
        }

        message.channel.send(createEmbed("info", `Remove **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail)).catch(() => null);
    }
}
