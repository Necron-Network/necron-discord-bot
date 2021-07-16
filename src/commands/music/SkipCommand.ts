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
        const song = message.guild?.music?.songs.first();

        message.guild?.music?.player.stop();

        return message.channel.send({ embeds: [createEmbed("info", `Skipped **[${song!.data.title}](${song!.data.url})**`).setThumbnail(song!.data.thumbnail)] }).catch(() => null);
    }
}
