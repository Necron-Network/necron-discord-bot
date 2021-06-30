import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["devs"],
    description: "Show list of my developers",
    name: "developers",
    usage: "{prefix}developers"
})
export class DevelopersCommand extends BaseCommand {
    public async execute(message: IMessage): Promise<any> {
        const devs = await Promise.all(this.client.config.devs.map(x => this.client.utils.fetchUser(x as string)));

        return message.channel.send(createEmbed("info", `Here are the list of developers that have worked hard on improving me time to time: ${devs.filter(x => x !== undefined).map(x => `\`${x!.tag}\``).join(", ")}\n\nWant to contribute this project? You can join our support server and contact one of our developers.`));
    }
}
