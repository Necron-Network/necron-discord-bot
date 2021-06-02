import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["vol"],
    description: "Show or change the music player's volume",
    name: "volume",
    usage: "{prefix}volume [new volume]"
})
export class VolumeCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicPlaying()
    @isSameVoiceChannel()
    public execute(message: IMessage, args: string[]): any {
        const volume = parseInt(args[0]);

        if (isNaN(volume)) return message.channel.send(createEmbed("info", `The current volume is **\`${message.guild!.queue!.volume}\`**`));

        if (volume <= 0) return message.channel.send(createEmbed("error", `Please, pause the music instead of setting the volume to **\`${volume}\`**`));
        if (volume > 100) return message.channel.send(createEmbed("error", "You can't set the volume above **\`100\`**"));

        message.guild!.queue!.volume = volume;
        message.guild!.queue!.connection?.dispatcher.setVolume(volume / 100);

        return message.channel.send(createEmbed("info", `Volume set to **\`${volume}\`**`)).catch(() => null);
    }
}
