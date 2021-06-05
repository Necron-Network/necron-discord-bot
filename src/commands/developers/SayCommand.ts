import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    name: "say",
    usage: "{prefix}say [channel] <content>"
})
export class SayCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        let channel = (message.mentions.channels.first() ?? await this.client.utils.fetchChannel(args[0]).catch(() => undefined)) as ITextChannel|undefined;
        if (channel) {
            if ([(channel as { toString: () => string }).toString(), channel.id].includes(args[0])) {
                args.pop();
            } else {
                channel = message.channel as ITextChannel;
            }
        } else {
            channel = message.channel as ITextChannel;
        }


        if (channel.id === message.channel.id) message.delete().catch(() => null);
        if (!args.length) return message.channel.send(`${message.author.toString()}, please give me the text you want to send`);

        return channel.send(args.join(" ")).then(() => {
            if (channel?.id !== message.channel.id) return message.channel.send(`${message.author.toString()}, sent!`);
        });
    }
}
