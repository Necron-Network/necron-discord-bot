import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { Snowflake } from "discord.js";

@DefineCommand({
    aliases: ["ava"],
    description: "Get user avatar",
    name: "avatar",
    usage: "{prefix}avatar [@mention|id]"
})
export class AvatarCommand extends BaseCommand {
    public execute(message: IMessage, args: string[]): any {
        const user = message.mentions.users.first() ?? this.client.users.cache.get(args[0] as Snowflake) ?? message.author;

        return message.channel.send({ embeds: [createEmbed("success", `${user.tag}'s avatar`).setImage(user.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))] });
    }
}
