import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function carefulEval<T>(text: string, context: any): Promise<T|undefined> {
    try {
        // eslint-disable-next-line no-eval
        return eval(`const a = ${text}; a;`);
    } catch (err) {
        return undefined;
    }
}

@DefineCommand({
    devOnly: true,
    name: "sayembed",
    usage: "{prefix}say <JSON message or embed data>"
})
export class SayEmbedCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        const context: {params: {event: {channel_id: string}}} = { params: { event: { channel_id: message.channel.id } } };
        const parsed = await carefulEval<{ content?: string; embeds?: MessageEmbedOptions[]; channel_id?: string; tts?: boolean }>(args.join(" "), context);
        if (!parsed) return message.channel.send("Unable to send message");

        const embeds = (parsed.embeds ?? []).map(e => new MessageEmbed(e));
        const content = parsed.content ?? "";

        return message.channel.send({ content, embeds });
    }
}
