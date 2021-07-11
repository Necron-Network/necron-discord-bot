import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["st", "disconnect", "dc"],
    description: "Stop the music player",
    name: "stop",
    usage: "{prefix}stop"
})
export class StopCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicPlaying()
    @isSameVoiceChannel()
    public execute(message: IMessage): any {
        return message.channel.send({ embeds: [createEmbed("error", "Work in Progress")] });

        // if (message.guild?.queue?.lastMusicMessageID) message.guild.queue.textChannel?.messages.fetch(message.guild.queue.lastMusicMessageID, false).catch(() => undefined).then(m => m?.delete());
        // if (message.guild?.queue?.lastVoiceStateUpdateMessageID) message.guild.queue.textChannel?.messages.fetch(message.guild.queue.lastVoiceStateUpdateMessageID, false).catch(() => undefined).then(m => m?.delete());

        // message.guild?.queue?.voiceChannel?.leave();
        // delete message.guild?.queue;

        // return message.channel.send(createEmbed("info", "The music player has been stopped")).catch(() => null);
    }
}
