import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { MessageAttachment } from "discord.js";
import { status } from "minecraft-server-util";

@DefineCommand({
    name: "ip",
    usage: "{prefix}ip"
})
export class IpCommand extends BaseCommand {
    public async execute(message: IMessage): Promise<any> {
        const serverStatus = await status("necron-network.com").catch(() => undefined);
        if (!serverStatus) return;

        const thumbnail = new MessageAttachment(Buffer.from(serverStatus.favicon?.replace("data:image/png;base64,", "") ?? "", "base64"), "favicon.png");

        return message.channel.send(createEmbed("info").addFields([
            {
                name: "IP Address",
                value: `${serverStatus.host}`,
                inline: true
            },
            {
                name: "Players",
                value: `${serverStatus.onlinePlayers ?? "?"}/${serverStatus.maxPlayers ?? "?"}`,
                inline: true
            },
            {
                name: "MOTD",
                value: `${serverStatus.description?.toString() ?? "No Information"}`,
                inline: false
            }
        ]).attachFiles([thumbnail])
            .setThumbnail("attachment://favicon.png"));
    }
}
