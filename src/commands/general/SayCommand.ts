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
        if (!message.member?.permissions.has("ADMINISTRATOR") && !this.client.config.devs.includes(message.author.id)) return message.channel.send({ embeds: [createEmbed("error", "You don't have `Administrator` permission to use this command!")] });

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

        if (!channel.permissionsFor(this.client.user!.id)?.toArray(true)?.includes("SEND_MESSAGES")) return message.channel.send({ embeds: [createEmbed("error", `I don't have \`Send Messages\` permission in ${(channel as { toString: () => string }).toString()}`)] });

        const attachments = [...message.attachments.values()];

        if (channel.id === message.channel.id) message.delete().catch(() => null);
        if (!args.length && !message.attachments.size) return message.reply({ embeds: [createEmbed("error", "Please, give me the text you want to send")] });

        return channel.send({ content: args.join(" "), files: attachments }).then(() => {
            if (channel?.id !== message.channel.id) return message.reply({ embeds: [createEmbed("success", "Sent!")] });
        });
    }
}
