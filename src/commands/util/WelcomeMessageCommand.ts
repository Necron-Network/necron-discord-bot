import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { IWelcomeMessage } from "../../utils/WelcomeMessageManager";
import { MessageReaction, User } from "discord.js";

@DefineCommand({
    aliases: ["welc", "welcome", "welcomemsg"],
    description: "Welcome message utility",
    name: "welcomemessage",
    usage: "{prefix}welcomemessage help"
})
export class WelcomeMessageCommand extends BaseCommand {
    public readonly embedOptions: Record<string, ((message: IMessage, args: string[]) => any)|undefined> = {
        "author.icon": async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!args.length) return message.channel.send(createEmbed("error", `Please, give me the new embed author icon (Use \`${this.client.config.prefix}welcomemessage embed author.icon disable\` to disable author icon).`));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (!data.props.embed) data.props.embed = {};

            data.props.embed.author = data.props.embed.author ?? {};
            data.props.embed.author.icon_url = args[0] === "disable" ? undefined : args.join(" ");
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send(createEmbed("success", `Embed author icon successfully changed. Use \`${this.client.config.prefix}welcomemessage embed preview\` to see preview`));
        },
        "author.text": async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!args.length) return message.channel.send(createEmbed("error", `Please, give me the new embed author text (Use \`${this.client.config.prefix}welcomemessage embed author.text disable\` to disable author text).`));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (!data.props.embed) data.props.embed = {};

            data.props.embed.author = data.props.embed.author ?? {};
            data.props.embed.author.name = args[0] === "disable" ? undefined : args.join(" ");
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send(createEmbed("success", `Embed author text successfully changed. Use \`${this.client.config.prefix}welcomemessage embed preview\` to see preview`));
        },
        description: async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!args.length) return message.channel.send(createEmbed("error", `Please, give me the new embed description (Use \`${this.client.config.prefix}welcomemessage embed description disable\` to disable description).`));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (!data.props.embed) data.props.embed = {};

            data.props.embed.description = args[0] === "disable" ? undefined : args.join(" ");
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send(createEmbed("success", `Embed description successfully changed. Use \`${this.client.config.prefix}welcomemessage embed preview\` to see preview`));
        },
        disable: async (message: IMessage) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (!data.props.embed?.enabled) return message.channel.send(createEmbed("error", "Welcome message embed already disabled"));

            data.props.embed.enabled = false;
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send(createEmbed("success", "Welcome message embed disabled!"));
        },
        enable: async (message: IMessage) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (data.props.embed?.enabled) return message.channel.send(createEmbed("error", "Welcome message embed already enabled"));
            if (!data.props.embed) {
                data.props.embed = {
                    description: "Welcome to {guild.name}, {user.username}."
                };
            }

            data.props.embed.enabled = true;
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send(createEmbed("success", "Welcome message embed enabled!"));
        },
        "footer.icon": async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!args.length) return message.channel.send(createEmbed("error", `Please, give me the new embed footer icon (Use \`${this.client.config.prefix}welcomemessage embed footer.icon disable\` to disable footer icon).`));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (!data.props.embed) data.props.embed = {};

            data.props.embed.footer = data.props.embed.footer ?? {};
            data.props.embed.footer.icon_url = args[0] === "disable" ? undefined : args.join(" ");
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send(createEmbed("success", `Embed footer icon successfully changed. Use \`${this.client.config.prefix}welcomemessage embed preview\` to see preview`));
        },
        "footer.text": async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!args.length) return message.channel.send(createEmbed("error", `Please, give me the new embed footer text (Use \`${this.client.config.prefix}welcomemessage embed footer.text disable\` to disable footer text).`));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (!data.props.embed) data.props.embed = {};

            data.props.embed.footer = data.props.embed.footer ?? {};
            data.props.embed.footer.text = args[0] === "disable" ? undefined : args.join(" ");
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send(createEmbed("success", `Embed footer text successfully changed. Use \`${this.client.config.prefix}welcomemessage embed preview\` to see preview`));
        },
        preview: async (message: IMessage) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (!data.props.embed) return message.channel.send(createEmbed("error", "Welcome message embed of this server couldn't be found"));

            data.channel = message.channel.id;
            return this.client.welcomer.sendData(data, message.member!, true);
        },
        title: async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!args.length) return message.channel.send(createEmbed("error", `Please, give me the new embed title (Use \`${this.client.config.prefix}welcomemessage embed title disable\` to disable title).`));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));
            if (!data.props.embed) data.props.embed = {};

            data.props.embed.title = args[0] === "disable" ? undefined : args.join(" ");
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send(createEmbed("success", `Embed title successfully changed. Use \`${this.client.config.prefix}welcomemessage embed preview\` to see preview`));
        }
    };

    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
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
        },
        embed: async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            const option = this.embedOptions[args[0]];
            if (!option) {
                return message.channel.send(createEmbed("info").setTitle("Welcome message utility: embed option list").addFields([
                    {
                        name: "description <text (with placeholder(s))>",
                        value: "Set the embed description",
                        inline: false
                    },
                    {
                        name: "title <text (with placeholder(s))>",
                        value: "Set the embed title",
                        inline: false
                    },
                    {
                        name: "author.text <text (with placeholder(s))>",
                        value: "Set the embed author text",
                        inline: false
                    },
                    {
                        name: "author.icon <url (with placeholder(s))>",
                        value: "Set the embed author icon URL",
                        inline: false
                    },
                    {
                        name: "footer.text <text (with placeholder(s))>",
                        value: "Set the embed footer text",
                        inline: false
                    },
                    {
                        name: "footer.icon <url (with placeholder(s))>",
                        value: "Set the embed footer icon URL",
                        inline: false
                    },
                    {
                        name: "preview",
                        value: "Show the preview of the embed",
                        inline: false
                    }
                ]));
            }

            args.shift();
            return option(message, args);
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
        help: (message: IMessage) => message.channel.send(createEmbed("info").setTitle("Welcome message utility: option list").addFields([
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
                name: "message [new text with placeholders]",
                value: "Show or set the welcome message",
                inline: false
            },
            {
                name: "preview",
                value: "Show welcome message preview",
                inline: false
            }
        ])
            .setDescription(`${this.client.config.prefix}welcomemessage <option>`)),
        message: async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));

            if (args.length) {
                const content = args.join(" ");
                const msg = await message.channel.send(createEmbed("info", this.client.welcomer.parseString(content, message.member!)).setAuthor("Welcome message preview", message.author.displayAvatarURL({ format: "png", size: 2048, dynamic: true })));

                const reactions = ["✅", "❎"];
                await msg.react("✅").catch(() => undefined);
                await msg.react("❎").catch(() => undefined);

                const collector = msg.createReactionCollector((reaction: MessageReaction, user: User) => (user.id === message.author.id) && (reactions.includes(reaction.emoji.name)));
                collector.on("collect", reaction => {
                    if (reaction.emoji.name === "✅") {
                        collector.stop("confirmed");
                    } else if (reaction.emoji.name === "❎") {
                        collector.stop();
                    }
                }).on("end", async (collected, reason) => {
                    if (reason === "confirmed") {
                        msg.delete().catch(() => null);

                        data.props.content = content;
                        await this.collection?.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });

                        message.channel.send(createEmbed("success", "Welcome message changed successfully")).catch(() => null);
                    } else {
                        message.channel.send(createEmbed("error", "Canceled")).catch(() => null);
                    }
                });
            } else {
                await message.channel.send(createEmbed("info", this.client.welcomer.parseString(data.props.content, message.member!)).setAuthor("Welcome message preview", message.author.displayAvatarURL({ format: "png", size: 2048, dynamic: true })));
            }
        },
        preview: async (message: IMessage) => {
            if (!this.collection) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "Welcome message data of this server couldn't be found"));

            data.channel = message.channel.id;
            return this.client.welcomer.sendData(data, message.member!, false);
        },
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
