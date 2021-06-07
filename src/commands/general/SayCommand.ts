import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    name: "say",
    usage: "{prefix}say [channel] <content>"
})
export class SayCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!message.member?.hasPermission("ADMINISTRATOR")) return message.channel.send(createEmbed("error", "You don't have `Administrator` permission to use this command!"));

        let channel = (message.mentions.channels.first() ?? await this.client.utils.fetchChannel(args[0]).catch(() => undefined)) as ITextChannel|undefined;
        if (channel) {
            if ([(channel as { toString: () => string }).toString(), channel.id].includes(args[0])) {
                args.shift();
            } else {
                channel = message.channel as ITextChannel;
            }
        } else {
            channel = message.channel as ITextChannel;
        }

        if (!channel.permissionsFor(this.client.user!.id)?.toArray(true)?.includes("SEND_MESSAGES")) return message.channel.send(createEmbed("error", `I don't have \`Send Messages\` permission in ${(channel as { toString: () => string }).toString()}`));
        if (channel.id === message.channel.id) message.delete().catch(() => null);
        if (!args.length) return message.channel.send(message.author.toString(), { embed: createEmbed("error", "Please, give me the text you want to send").toJSON() });

        return channel.send(args.join(" ")).then(() => {
            if (channel?.id !== message.channel.id) return message.channel.send(message.author.toString(), { embed: createEmbed("success", "Sent!") });
        });
    }
}
