import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { IWelcomeMessage } from "../../utils/WelcomeMessageManager";

@DefineCommand({
    aliases: ["welc", "welcome", "welcomemsg"],
    description: "Welcome message utility",
    name: "welcomemessage",
    usage: "{prefix}welcomemessage help"
})
export class WelcomeMessageCommand extends BaseCommand {
    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
        help: (message: IMessage) => message.channel.send(createEmbed("info", "Option list").setTitle("Welcome message utility").addFields([
            {
                name: "set <channel>",
                value: "Set welcome message channel.",
                inline: false
            },
            {
                name: "help",
                value: "Show option list of `welcomemessage` command",
                inline: false
            },
            {
                name: "enable",
                value: "Enable the welcome message utility",
                inline: false
            },
            {
                name: "disable",
                value: "Disable the welcome message utility",
                inline: false
            },
            {
                name: "placeholders",
                value: "Show list of placeholders you can use",
                inline: false
            },
            {
                name: "???",
                value: "More option coming soon!",
                inline: false
            }
        ])),
        set: async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            const channel = (message.mentions.channels.first() ?? await this.client.utils.fetchChannel(args[0])) as ITextChannel|undefined;
            if (!channel || (channel.guild.id !== message.guild?.id)) return message.channel.send(createEmbed("error", "Invalid channel"));
            if (!channel.permissionsFor(this.client.user!.id)?.has("SEND_MESSAGES", true)) return message.channel.send(createEmbed("error", "I don't have permission to send message in that channel"));

            let data = await this.collection.findOne({ guild: message.guild.id });

            if (data) {
                data.channel = channel.id;
                await this.collection.updateOne({ guild: message.guild.id }, { $set: data }, { upsert: true });
            } else {
                data = {
                    channel: channel.id,
                    enabled: false,
                    guild: message.guild.id,
                    props: {
                        content: "Welcome to {guild.name}, {member.tag}."
                    }
                };
                await this.collection.insertOne(data);
            }

            return message.channel.send(createEmbed("success", `Welcome channel set to <#${channel.id}>`));
        },
        enable: async (message: IMessage) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            let data = await this.collection.findOne({ guild: message.guild!.id });
            let desc: string;
            if (data) {
                if (data.enabled) {
                    desc = "Welcome message already enabled";
                } else {
                    data.enabled = true;
                    await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
                    desc = "Welcome message enabled";
                }
            } else {
                data = {
                    channel: message.channel.id,
                    enabled: true,
                    guild: message.guild!.id,
                    props: {
                        content: "Welcome to {guild.name}, {member.tag}."
                    }
                };
                await this.collection.insertOne(data);
                desc = `Welcome message enabled and automatically set this channel as welcome channel (Use \`${this.client.config.prefix}welcomemessage set\` to set the channel)`;
            }

            return message.channel.send(createEmbed("success", `${desc}. Use \`${this.client.config.prefix}welcomemessage message\` to see or set the welcome message.`));
        },
        disable: async (message: IMessage) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            let desc: string;
            if (data?.enabled) {
                data.enabled = false;
                await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
                desc = "Welcome message disabled.";
            } else {
                desc = "Welcome message already disabled.";
            }

            return message.channel.send(createEmbed("success", desc));
        }
    };

    private readonly collection = this.client.db?.collection<IWelcomeMessage>("welcomemessage");

    public execute(message: IMessage, args: string[]): any {
        if (!message.member?.hasPermission("MANAGE_GUILD", { checkAdmin: true, checkOwner: true })) return message.channel.send(createEmbed("error", "You don't have `Manage Server` permission to use this command!"));
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send(createEmbed("error", `Invalid option. Use \`${this.client.config.prefix}welcomemessage help\` to see list of options.`));
        args.shift();
        return opt(message, args);
    }
}
