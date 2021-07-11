import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { Snowflake } from "discord.js";

@DefineCommand({
    description: "Ban someone from the server",
    name: "ban",
    usage: "{prefix}ban <@mention|id>"
})
export class BanCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!message.member?.permissions.has("BAN_MEMBERS")) return message.channel.send({ embeds: [createEmbed("error", "You don't have `Ban Member` permission to use this command!")] });

        const user = message.mentions.users.first() ?? this.client.users.cache.get(args[0] as Snowflake) ?? await this.client.users.fetch(args[0] as Snowflake).catch(() => undefined);
        if (!user) return message.channel.send({ embeds: [createEmbed("error", "Invalid user")] });

        const ban = await message.guild!.members.ban(user.id).catch((error: Error) => ({ error }));
        if ("error" in (ban as { error: Error })) return message.channel.send({ embeds: [createEmbed("error", `An error occured\n\`\`\`${(ban as { error: Error }).error.message}\`\`\``)] });

        return message.channel.send({ embeds: [createEmbed("success", `Successfully banned`).setAuthor(user.tag, user.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))] });
    }
}
