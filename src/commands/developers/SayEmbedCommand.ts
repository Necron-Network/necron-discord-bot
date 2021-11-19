import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function carefulEval<T>(text: string, context: any): T|undefined {
    try {
        // eslint-disable-next-line no-eval
        return eval(text);
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
        const parsed = carefulEval<{ content?: string; embeds?: MessageEmbedOptions[]; channel_id?: string; tts?: boolean }>(args.join(" "), context);
        if (!parsed) throw Error();
        for (const x of Object.keys(parsed)) {
            if (!["embeds", "content"].includes(x)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete parsed[x as "channel_id"|"tts"];
            }
        }

        const embeds = (parsed.embeds ?? []).map(e => new MessageEmbed(e));
        const content = parsed.content ?? "";

        return message.channel.send({ content, embeds });
    }
}
