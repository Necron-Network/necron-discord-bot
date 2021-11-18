import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

@DefineCommand({
    devOnly: true,
    name: "sayembed",
    usage: "{prefix}say <JSON message or embed data>"
})
export class SayEmbedCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        try {
            const parsed = JSON.parse(args.join(" ")) as { content?: string; embeds?: MessageEmbedOptions[] };
            const embeds = (parsed.embeds ?? []).map(e => new MessageEmbed(e));
            const content = parsed.content ?? "";

            return message.channel.send({ content, embeds });
        } catch (err) {
            return message.channel.send("Unable to send message");
        }
    }
}
