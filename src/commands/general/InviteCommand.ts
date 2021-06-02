import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Show my invite link",
    name: "invite",
    usage: "{prefix}invite"
})
export class InviteCommand extends BaseCommand {
    public async execute(message: IMessage): Promise<any> {
        const invite = await this.client.generateInvite(["SEND_MESSAGES", "ADD_REACTIONS", "MANAGE_MESSAGES", "MANAGE_CHANNELS"]);

        return message.channel.send(createEmbed("info", `You can invite me using **[this link](${invite})**`));
    }
}
