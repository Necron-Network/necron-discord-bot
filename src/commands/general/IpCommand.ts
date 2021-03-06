import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { MessageAttachment, EmbedFieldData } from "discord.js";
import { status } from "minecraft-server-util";

@DefineCommand({
    name: "ip",
    usage: "{prefix}ip"
})
export class IpCommand extends BaseCommand {
    public async execute(message: IMessage): Promise<any> {
        const serverStatus = await status("necron-network.xyz").catch(() => undefined);
        if (!serverStatus) return;

        const thumbnail = new MessageAttachment(Buffer.from(serverStatus.favicon?.replace("data:image/png;base64,", "") ?? "", "base64"), "favicon.png");

        return message.channel.send({
            embeds: [createEmbed("info").addFields([
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
                    value: `${serverStatus.description?.toRaw() ?? "No Information"}`,
                    inline: false
                },
                {
                    name: "Version",
                    value: serverStatus.version,
                    inline: false
                }
            ] as EmbedFieldData[])
                .setThumbnail("attachment://favicon.png")],
            files: [thumbnail]
        });
    }
}
