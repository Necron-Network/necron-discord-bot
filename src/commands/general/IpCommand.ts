import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    name: "ip",
    usage: "{prefix}ip"
})
export class IpCommand extends BaseCommand {
    public execute(message: IMessage): any {
        if (message.guild?.id !== "735020665861832756") return;

        return message.channel.send(createEmbed("info", "necron-network.com"));
    }
}
