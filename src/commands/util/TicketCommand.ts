import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, IGuild, ITicketMessage, ITicketOpenerMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { createButton } from "../../utils/createButton";

@DefineCommand({
    description: "Ticket utility",
    name: "ticket",
    usage: "{prefix}ticket help"
})
export class TicketCommand extends BaseCommand {
    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
        help: message => message.channel.send({ embeds: [createEmbed("info", "Coming soon!")] }),
        createmessage: async message => {
            let runningSetup = "name";
            const props: Record<"name"|"description", string> = {
                name: "",
                description: ""
            };

            const msg = await message.channel.send("**What is the name of the ticket?**").catch(() => undefined);
            if (!msg) return;

            const collector = msg.channel.createMessageCollector({
                filter: m => m.author.id === msg.author.id && m.content !== ""
            });

            collector
                .on("collect", async m => {
                    if (runningSetup === "name") {
                        props.name = m.content;
                        void m.channel.send("**What is the description of the ticket?**\n\nYou can type `blank` if you don't want to add ticket description").then(() => {
                            runningSetup = "description";
                        });
                    } else if (runningSetup === "description") {
                        if (m.content !== "blank") {
                            props.description = m.content;
                        }
                        void m.channel.send("**Where will the ticket message sent to?**").then(() => {
                            runningSetup = "channel";
                        });
                    } else if (runningSetup === "channel") {
                        const channel = m.mentions.channels.first() ?? (await this.client.utils.fetchChannel(m.content).then(ch => (!ch || (ch as { guild?: IGuild }).guild?.id !== m.guild?.id) ? m.channel : ch)) ?? m.channel;

                        collector.stop(channel.id);
                    }
                })
                .on("end", async (collected, reason) => {
                    const channel = await this.client.utils.fetchChannel(reason);
                    if (!channel || !channel.isText()) {
                        void message.channel.send({ embeds: [createEmbed("error", "Invalid Channel")], content: message.author.toString() });
                        return;
                    }

                    const m = await channel.send({ embeds: [createEmbed("info", props.description).setTitle(props.name)], components: [{ components: [createButton("PRIMARY", "Open Ticket").setCustomId("OPEN_TICKET")], type: "BUTTON" }] }).catch(() => undefined);
                    if (!m) {
                        void message.channel.send({ embeds: [createEmbed("error", "Unable to create ticket message on that channel")], content: message.author.toString() });
                        return;
                    }

                    const data: ITicketOpenerMessage = {
                        channelId: m.channel.id,
                        description: props.description,
                        guildId: m.guild!.id,
                        id: m.id,
                        name: props.name,
                        type: "opener"
                    };
                    await this.collection?.insertOne(data);

                    if (m.channel.id !== message.channel.id) {
                        void message.channel.send({ embeds: [createEmbed("success", "Ticket message created!")] });
                    }
                });
        }
    };

    private readonly collection = this.client.db?.collection<ITicketMessage>("ticketmessage");

    public execute(message: IMessage, args: string[]): any {
        if (!message.member!.permissions.has("MANAGE_GUILD")) return message.channel.send({ embeds: [createEmbed("error", "You don't have `Manage Server` permission to use this command!")] });
        if (!this.collection) return message.channel.send({ embeds: [createEmbed("error", "Couldn't contact database. Please, try again later.")] });
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send({ embeds: [createEmbed("error", `Invalid option. Use \`${this.client.config.prefix}ticket help\` to see list of options.`)] });
        args.shift();
        return opt(message, args);
    }
}
