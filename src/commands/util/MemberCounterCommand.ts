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
    public async execute(message: IMessage, args: string[]): Promise<any> {

    }
}
