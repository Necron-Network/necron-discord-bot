import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["welc", "welcome", "welcomemsg"],
    description: "Welcome message utility",
    name: "welcomemessage",
    usage: "{prefix}welcomemessage help"
})
export class WelcomeMessageCommand extends BaseCommand {
    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
        help: (message: IMessage) => message.channel.send(createEmbed("info", "Coming soon!"))
    };

    public execute(message: IMessage, args: string[]): any {
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send(createEmbed("error", `Invalid option. Use \`${this.client.config.prefix}serverstats help\` to see list of options.`));
        args.shift();
        return opt(message, args);
    }
}
