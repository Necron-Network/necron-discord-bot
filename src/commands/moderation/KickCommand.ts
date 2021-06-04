import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Kick someone from the server",
    name: "kick",
    usage: "{prefix}kick <@mention|id>"
})
export class KickCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!message.member?.hasPermission("KICK_MEMBERS")) return message.channel.send(createEmbed("error", "You don't have `Kick Member` permission to use this command!"));

        const member = message.mentions.members?.first() ?? message.guild?.members.cache.get(args[0]) ?? await message.guild?.members.fetch(args[0]).catch(() => undefined);
        if (!member) return message.channel.send(createEmbed("error", "Invalid user"));
        if (!member.kickable) return message.channel.send(createEmbed("error", "I can't kick that user"));

        const kick = await member.kick().catch((error: Error) => ({ error }));
        if ("error" in (kick as { error: Error})) return message.channel.send(createEmbed("error", `An error occured\n\`\`\`${(kick as { error: Error }).error.message}\`\`\``));

        return message.channel.send(createEmbed("success", "Successfully kicked").setAuthor(member.user.tag, member.user.displayAvatarURL({ format: "png", size: 2048, dynamic: true })));
    }
}
