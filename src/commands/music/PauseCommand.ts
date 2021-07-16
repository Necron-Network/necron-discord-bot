import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";
import { AudioPlayerStatus } from "@discordjs/voice";

@DefineCommand({
    description: "Pause the music player",
    name: "pause",
    usage: "{prefix}pause"
})
export class PauseCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicPlaying()
    @isSameVoiceChannel()
    public execute(message: IMessage): any {
        if (message.guild?.music?.player.state.status === AudioPlayerStatus.Playing) {
            message.guild.music.player.pause();
            return message.channel.send({ embeds: [createEmbed("info", "The music player has been paused")] }).catch(() => null);
        }
        message.channel.send({ embeds: [createEmbed("error", "The music player is already paused")] }).catch(() => null);
    }
}
