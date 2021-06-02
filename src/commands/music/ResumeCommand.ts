import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";
import { satisfies } from "semver";

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
        if (message.guild?.queue?.playing) return message.channel.send(createEmbed("error", "The music player is not paused")).catch(() => null);

        message.guild!.queue!.playing = true;
        message.guild?.queue?.connection?.dispatcher.resume();
        // This will be reverted
        if (satisfies(process.version, ">=14.17.0")) {
            message.guild?.queue?.connection?.dispatcher.pause();
            message.guild?.queue?.connection?.dispatcher.resume();
        }

        return message.channel.send(createEmbed("info", "The music player has been resumed")).catch(() => null);
    }
}
