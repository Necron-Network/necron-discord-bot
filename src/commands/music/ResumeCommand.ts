import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";
import { AudioPlayerStatus } from "@discordjs/voice";

@DefineCommand({
    description: "Resume the music player",
    name: "resume",
    usage: "{prefix}resume"
})
export class ResumeCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicPlaying()
    @isSameVoiceChannel()
    public execute(message: IMessage): any {
        if (message.guild?.music?.player.state.status === AudioPlayerStatus.Playing) return message.channel.send({ embeds: [createEmbed("error", "The music player is not paused")] }).catch(() => null);

        message.guild?.music?.player.unpause();

        return message.channel.send({ embeds: [createEmbed("info", "The music player has been resumed")] }).catch(() => null);
    }
}
