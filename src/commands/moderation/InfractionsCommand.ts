import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { IInfraction } from "../../utils/InfractionManager";
import { chunk } from "../../utils/chunk";
import { MessageReaction, User } from "discord.js";

@DefineCommand({
    description: "Show lists of member infraction",
    name: "infractions",
    usage: "{prefix}infractions [@mention|id]"
})
export class InfractionsCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!message.member?.hasPermission("MANAGE_GUILD")) return message.channel.send(createEmbed("error", "You don't have permission to use this command"));

        const user = message.mentions.users.first() ?? await this.client.utils.fetchUser(args[0]) ?? message.author;
        const infractions = await this.client.infraction.fetchUserInfractions({ userID: user.id, guildID: message.guild!.id });

        return this.initializePaging(message, infractions, user.id);
    }

    private async initializePaging(message: IMessage, infractions: IInfraction[], userID: string): Promise<void> {
        const user = await this.client.utils.fetchUser(userID);
        if (infractions.length <= 10) {
            const description = infractions.length ? infractions.map((x, i) => `${i + 1} - ${x.reason ?? "No reason"}`).join("\n") : "No infraction";

            await message.channel.send(createEmbed("info", description).setAuthor(`${user?.tag ?? "Unknown User#0000"} infractions`, user?.displayAvatarURL({ format: "png", size: 2048, dynamic: true })));
        } else {
            let page = 0;
            const pages = chunk(infractions, 10);
            const embed = createEmbed("info").setAuthor(`${user?.tag ?? "Unknown User#0000"} infractions`, user?.displayAvatarURL({ format: "png", size: 2048, dynamic: true }));

            function syncEmbed(): void {
                embed.setDescription(pages[page].map((x, i) => `${(page * 10) + (i + 1)} - ${x.reason ?? "No reason"}`).join("\n")).setFooter(`Page ${page}/${pages.length}`);
            }

            syncEmbed();

            const msg = await message.channel.send(embed);
            const reactions = ["◀️", "▶️"];

            await msg.react("◀️").catch(() => null);
            await msg.react("▶️").catch(() => null);

            const collector = msg.createReactionCollector((r: MessageReaction, u: User) => (u.id === message.author.id) && (reactions.includes(r.emoji.name)));
            collector.on("collect", async (reaction: MessageReaction) => {
                switch (reaction.emoji.name) {
                    case "◀️":
                        page--;
                        if (page < 0) page = 0;
                        break;
                    case "▶️":
                        page++;
                        if (page >= pages.length) page = pages.length - 1;
                        break;
                }

                syncEmbed();
                await msg.edit(embed);
            });
        }
    }
}
