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
        if (message.guild?.music?.lastMusicMessageID) void message.guild.music.textChannel.messages.fetch(message.guild.music.lastMusicMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());
        if (message.guild?.music?.lastVoiceStateUpdateMessageID) void message.guild.music.textChannel.messages.fetch(message.guild.music.lastVoiceStateUpdateMessageID, { cache: false }).catch(() => undefined).then(m => m?.delete());

        message.guild?.music?.connection.destroy();
        delete message.guild?.music;

        return message.channel.send({ embeds: [createEmbed("info", "The music player has been stopped")] }).catch(() => null);
    }
}
