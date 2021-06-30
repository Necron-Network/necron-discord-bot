import { IMessage } from "../../typings";
import { BaseCommand } from "../../structures/BaseCommand";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { MessageEmbedOptions, MessageEmbed } from "discord.js";

@DefineCommand({
    aliases: ["documentation", "discord.js", "discordjs", "djs", "djsdocs"],
    description: "View the Discord.JS documentations",
    name: "docs",
    usage: "{prefix}docs <code> [branch]"
})
export class DocsCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        const sources = ["stable", "master", "rpc", "commando", "akairo", "akairo-master", "collection", "11.5.1", "11.6.4"];
        try {
            if (!args.length) {
                return message.channel.send(createEmbed("error", "Please provide a query"));
            }
            const query = args[0];
            let source = args[1] ? args[1].toLowerCase() : "stable";
            if (!sources.includes(source)) return message.channel.send(createEmbed("info", `Valid sources are: ${sources.map(x => `\`${x}\``).join(", ")}`));
            if (source === "11.5.1" || source === "11.6.4") {
                source = `https://raw.githubusercontent.com/discordjs/discord.js/docs/${source}.json`;
            }
            let embed: MessageEmbedOptions|MessageEmbed = await this.client.request.get("https://djsdocs.sorta.moe/v2/embed", { searchParams: { src: source, q: query } }).json<MessageEmbedOptions>();
            if (embed.title === "Search results:") {
                embed = new MessageEmbed(embed);
                const results = embed.description!.split("\n");
                const properties = results.filter(x => x.startsWith(":regional_indicator_p:"));
                const methods = results.filter(x => x.startsWith(":regional_indicator_m:"));
                const typedefs = results.filter(x => x.startsWith(":regional_indicator_t:"));
                const classes = results.filter(x => x.startsWith(":regional_indicator_c:"));
                const events = results.filter(x => x.startsWith(":regional_indicator_e:"));

                if (classes.length) embed.addField("Classes", classes.map(x => x.split(" ").slice(1).join(" ")).join("\n"), true);
                if (properties.length) embed.addField("Properties", properties.map(x => x.split(" ").slice(1).join(" ")).join("\n"), true);
                if (methods.length) embed.addField("Methods", methods.map(x => x.split(" ").slice(1).join(" ")).join("\n"), true);
                if (events.length) embed.addField("Events", events.map(x => x.split(" ").slice(1).join(" ")).join("\n"), true);
                if (typedefs.length) embed.addField("Typedefs", typedefs.map(x => x.split(" ").slice(1).join(" ")).join("\n"), true);

                embed.description = "";
                embed.title = "Search results";
            }
            return message.channel.send({ embed });
        } catch (err) {
            return message.channel.send(createEmbed("error", `\`${err.message}\``));
        }
    }
}
