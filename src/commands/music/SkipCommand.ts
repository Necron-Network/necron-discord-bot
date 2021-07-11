import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["s"],
    description: "Skip the currently playing music",
    name: "skip",
    usage: "{prefix}skip"
})
export class SkipCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicPlaying()
    @isSameVoiceChannel()
    public execute(message: IMessage): any {
        return message.channel.send({ embeds: [createEmbed("error", "Work in Progress")] });

        message.guild!.queue!.playing = true;
        // message.guild?.queue?.connection?.dispatcher.once("speaking", () => message.guild?.queue?.connection?.dispatcher.end());
        // message.guild!.queue?.connection?.dispatcher.resume();

        const song = message.guild?.queue?.songs.first();

        return message.channel.send({ embeds: [createEmbed("info", `Skipped **[${song!.title}](${song!.url})**`).setThumbnail(song!.thumbnail)] }).catch(() => null);
    }
}
