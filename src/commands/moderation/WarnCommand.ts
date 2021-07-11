import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Warn member",
    name: "warn",
    usage: "{prefix}warn <@mention|id> [reason]"
})
export class WarnCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!message.member?.permissions.has("MANAGE_GUILD")) return message.channel.send({ embeds: [createEmbed("error", "You don't have permission to use this command")] });

        const user = message.mentions.users.first() ?? await this.client.utils.fetchUser(args[0]);
        if (!user || ((args[0] as string|undefined)?.replace(/[^0-9]/g, "") !== user.id)) return message.channel.send({ embeds: [createEmbed("error", "Invalid user")] });

        args.shift();

        const reason = args.join(" ") === "" ? undefined : args.join(" ");
        const infractions = await this.client.infraction.addInfraction({ userID: user.id, guildID: message.guild!.id }, reason);
        return message.channel.send({
            embeds: [createEmbed("success").setTitle(`${user.username} has been warned!`).addField("Reason", reason ?? "No Reason")
                .setFooter(`This is their ${this.client.utils.toOrdinal(infractions.length)} warning`)
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))
                .setThumbnail(user.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))]
        });
    }
}
