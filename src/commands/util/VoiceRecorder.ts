import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isSameVoiceChannel, isValidVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Voice recorder util",
    name: "voicerecorder",
    usage: "{prefix}voicerecorder"
})
export class VoiceRecorder extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isSameVoiceChannel()
    @isValidVoiceChannel(true)
    public async execute(message: IMessage): Promise<any> {
        return message.channel.send({ embeds: [createEmbed("info", "Coming soon.")] });

        /* if (message.guild?.me?.voice.selfDeaf) await message.guild.me.voice.setSelfDeaf(false);
        if (message.guild?.me?.voice.deaf) {
            const unDeafen = await message.guild.me.voice.setDeaf(false).catch(() => undefined);
            if (!unDeafen) return message.channel.send(createEmbed("error", "Please, undeafen me!"));
        }

        const connection = await message.member?.voice.channel?.join().catch((err: Error) => ({ error: err }));
        if (!connection || "error" in connection) return message.channel.send(createEmbed("error", `An error occured while joining the voice channel.\n\`\`\`${connection?.error.message ?? "Unknown error"}\`\`\``));

        message.guild!.recorder = new ServerVoiceRecorder(message.channel as ITextChannel, connection.channel);

        message.guild!.recorder.receiverStream = connection.receiver.createStream(message.author.id, {
            mode: "pcm",
            end: "manual"
        })
            .setEncoding("base64")
            .on("data", (chunk: string) => {
                message.guild!.recorder?.chunks.push(chunk);
            })
            .on("pause", () => {
                message.guild!.recorder!.recording = false;
            })
            .on("resume", () => {
                message.guild!.recorder!.recording = true;
            })
            .on("error", err => {
                message.guild?.recorder?.textChannel.send(createEmbed("error", `An error occured while recording\n\`\`\`${err.message}\`\`\`\nAll the recorded audio (${message.guild.recorder.chunks.length} audios) will be sent to your DM`));
                message.guild?.recorder?.voiceChannel.leave();

                for (const chunk of message.guild!.recorder!.chunks) {

                }
            });*/
    }
}
