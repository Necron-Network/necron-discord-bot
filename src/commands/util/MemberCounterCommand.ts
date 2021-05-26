import { BaseCommand } from "../../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    aliases: [],
    description: "Member counter utility",
    name: "membercounter"
})
export class MemberCounterCommand extends BaseCommand {
    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
        setup: async (message: IMessage, args: string[]) => {
            if (!this.client.db) return message.channel.send("Couldn't contact database. Please, try again later.");
        }
    };

    public async execute(message: IMessage, args: string[]): Promise<any> {
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send("Invalid option");
        args.shift();
        return opt(message, args);
    }
}
