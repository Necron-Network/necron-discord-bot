import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Show support server of this bot",
    name: "support",
    usage: "{prefix}usage"
})
export class SupportCommand extends BaseCommand {
    public execute(message: IMessage): any {
        return message.channel.send({ embeds: [createEmbed("info", "You want to join our support server? **[Click Here](https://discord.com/invite/stfp26mhr4)**")] });
    }
}
