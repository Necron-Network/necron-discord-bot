import { IMessage } from "../../typings";
import { BaseCommand } from "../../structures/BaseCommand";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

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
            const embed = await this.client.request.get("https://djsdocs.sorta.moe/v2/embed", { searchParams: { src: source, q: query } }).json();
            return message.channel.send({ embed });
        } catch (err) {
            return message.channel.send(createEmbed("error", `\`${err.message}\``));
        }
    }
}
