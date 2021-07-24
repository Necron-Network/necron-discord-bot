import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Ticket utility",
    name: "ticket",
    usage: "{prefix}ticket help"
})
export class TicketCommand extends BaseCommand {
    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
        help: message => message.channel.send({ embeds: [createEmbed("info", "Coming soon!")] })
    };

    public execute(message: IMessage, args: string[]): any {
        if (!message.member!.permissions.has("MANAGE_GUILD")) return message.channel.send({ embeds: [createEmbed("error", "You don't have `Manage Server` permission to use this command!")] });
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send({ embeds: [createEmbed("error", `Invalid option. Use \`${this.client.config.prefix}ticket help\` to see list of options.`)] });
        args.shift();
        return opt(message, args);
    }
}
