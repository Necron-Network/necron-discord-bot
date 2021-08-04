import { BaseCommand } from "../../structures/BaseCommand";
import { MessageEmbed, EmbedFieldData, MessageSelectMenu } from "discord.js";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    aliases: ["commands", "cmds", "info"],
    name: "help",
    description: "Shows the help menu or help for specific command.",
    usage: "{prefix}help [command]"
})
export class HelpCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<void> {
        const command = message.client.commands.get(args[0]) ?? message.client.commands.get(message.client.commands.aliases.get(args[0])!);
        if (command) {
            message.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle(`Help for ${command.meta.name} command`)
                    .setThumbnail("https://hzmi.xyz/assets/images/question_mark.png")
                    .addFields([{ name: "Name", value: `\`${command.meta.name}\``, inline: true },
                        { name: "Description", value: command.meta.description, inline: true },
                        { name: "Aliases", value: `${Number(command.meta.aliases?.length) > 0 ? command.meta.aliases?.map(c => `\`${c}\``).join(", ") as string : "None."}`, inline: true },
                        { name: "Usage", value: `\`${command.meta.usage?.replace(/{prefix}/g, message.client.config.prefix) as string}\``, inline: false }] as EmbedFieldData[])
                    .setColor("#00FF00")
                    .setTimestamp()
                    .setFooter(`<> = required | [] = optional ${command.meta.devOnly ? "(Only my developers can use this command)" : ""}`, "https://hzmi.xyz/assets/images/390511462361202688.png")]
            }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        } else { // NOTE: Should we add hide option on commands so we can hide specific commands?
            const embed = new MessageEmbed()
                .setTitle("Help Menu")
                .setColor("#00FF00")
                .setThumbnail(message.client.user?.displayAvatarURL() as string)
                .setTimestamp()
                .setFooter(`${message.client.config.prefix}help <command> to get more info on a specific command!`, "https://hzmi.xyz/assets/images/390511462361202688.png")
                .setDescription("**Use the dropdown/select menu to show a category**");
            const categories = message.client.commands.categories.map((v, k) => {
                const isDev = this.client.config.devs.includes(message.author.id);
                const cmds = v.cmds.filter(c => isDev ? true : !c.meta.devOnly).map(c => `\`${c.meta.name}\``);
                if (!cmds.length) return undefined;
                if (v.hide && !isDev) return undefined;

                return {
                    id: k.toUpperCase(),
                    category: v,
                    cmds
                };
            });

            let current: string[] = [];

            function syncEmbed(id: string): boolean {
                const category = categories.find(c => c?.id === id);
                if (!category) return false;

                embed.addField(`**${category.category.name}**`, category.cmds.join(", "));
                return true;
            }

            const menu = new MessageSelectMenu()
                .setCustomId("HELP_SELECT_MENU");

            for (const category of categories) {
                if (!category) continue;

                menu.addOptions([{
                    label: category.category.name,
                    value: category.id
                }]);
            }

            const msg = await message.channel.send({ embeds: [embed], components: [{ components: [menu], type: "SELECT_MENU" }] });
            const collector = msg.createMessageComponentCollector({
                filter: i => {
                    void i.deferUpdate();

                    return i.customId === "HELP_SELECT_MENU" && i.user.id === message.author.id;
                }
            });

            collector.on("collect", async i => {
                if (!i.isSelectMenu()) return;

                const selections = categories.filter(c => i.values.includes(c?.id as string));
                if (!selections.length) return;

                current = [];
                embed.fields = [];

                for (const selection of selections) {
                    if (!selection) continue;

                    const res = syncEmbed(selection.id);
                    if (res) current.push(selection.id);
                }

                if (!current.length) return;

                await msg.edit({ embeds: [embed], components: [{ components: [menu], type: "SELECT_MENU" }] });
            });
        }
    }
}
