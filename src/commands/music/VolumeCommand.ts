import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";
import { AudioPlayerPlayingState } from "@discordjs/voice";

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
        const resource = (message.guild!.music?.player.state as AudioPlayerPlayingState).resource;

        if (isNaN(volume)) return message.channel.send({ embeds: [createEmbed("info", `The current volume is **\`${resource.volume!.volume}\`**`)] });

        if (volume <= 0) return message.channel.send({ embeds: [createEmbed("error", `Please, pause the music instead of setting the volume to **\`${volume}\`**`)] });
        if (volume > 100) return message.channel.send({ embeds: [createEmbed("error", "You can't set the volume above **\`100\`**")] });

        resource.volume?.setVolume(volume);
        return message.channel.send({ embeds: [createEmbed("info", `Volume set to **\`${volume}\`**`)] }).catch(() => null);
    }
}
