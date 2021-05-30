import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { IMemberCounter } from "../../utils/MemberCounterManager";
import { MessageReaction, User, Collection } from "discord.js";

@DefineCommand({
    aliases: [],
    description: "Server stats utility",
    name: "serverstats"
})
export class ServerStatsCommand extends BaseCommand {
    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
        setup: async (message: IMessage) => {
            if (!this.client.db) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!message.member!.hasPermission("MANAGE_CHANNELS")) return message.channel.send(createEmbed("error", "You don't have `Manage Channels` permission to use this command!"));
            if (!message.guild!.me!.hasPermission("MANAGE_CHANNELS")) return message.channel.send(createEmbed("error", "I don't have `Manage Channels` permission to setup member counter channel!"));
            if ((await this.client.db.collection("membercounter").findOne({ guild: message.guild!.id }))) return message.channel.send(createEmbed("error", "You already have a stats running."));

            const msg = await message.channel.send(createEmbed("info", "Setting up member counter channel..."));
            const category = await message.guild!.channels.create("Server Stats", {
                type: "category"
            }).catch(() => undefined);
            if (!category) return message.channel.send(createEmbed("error", "An error occured while trying to make counter category channel. Please, try again later."));
            const memberchannel = await message.guild!.channels.create(`Member: ${message.guild!.members.cache.size}`, {
                type: "voice",
                parent: category.id
            });
            const botchannel = await message.guild!.channels.create(`Bots: ${message.guild!.members.cache.filter(m => m.user.bot).size}`, {
                type: "voice",
                parent: category.id
            });
            const userchannel = await message.guild!.channels.create(`User: ${message.guild!.members.cache.filter(m => !m.user.bot).size}`, {
                type: "voice",
                parent: category.id
            });
            await this.client.db.collection<IMemberCounter>("membercounter").insertOne({
                guild: message.guild!.id,
                category: category.id,
                channels: [
                    {
                        id: memberchannel.id,
                        format: "Member: {guild.member.count}"
                    },
                    {
                        id: botchannel.id,
                        format: "Bots: {guild.bot.count}"
                    },
                    {
                        id: userchannel.id,
                        format: "User: {guild.user.count}"
                    }
                ]
            });
            await msg.edit(createEmbed("success", `Successfully created a server stats! Use \`${this.client.config.prefix}serverstats edit\` to edit the server stats.`));
        },
        help: async (message: IMessage) => {
            if (!message.member!.hasPermission("MANAGE_CHANNELS")) return message.channel.send(createEmbed("error", "You don't have `Manage Channels` permission to use this command!"));
            await message.channel.send(createEmbed("info", "Option list").setTitle("Server stats utility").addFields([
                {
                    name: "setup",
                    value: "Create a server stats for this server.",
                    inline: false
                },
                {
                    name: "help",
                    value: "Show option list of `serverstats` command",
                    inline: false
                },
                {
                    name: "add <text with placeholder(s)>",
                    value: "Add a new statistic to show in the server stats",
                    inline: false
                },
                {
                    name: "list",
                    value: "Show list of statistic shown by the server stats",
                    inline: false
                },
                {
                    name: "placeholders",
                    value: "Show list of placeholders you can use to create a statistic",
                    inline: false
                }
            ]));
        },
        list: async (message: IMessage) => {
            if (!this.client.db) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!message.member!.hasPermission("MANAGE_CHANNELS")) return message.channel.send(createEmbed("error", "You don't have `Manage Channels` permission to use this command!"));

            const data = await this.client.db.collection<IMemberCounter>("membercounter").findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", `There's no server stats running in your server. Use \`${this.client.config.prefix}serverstats setup\` to create one.`));

            return message.channel.send(createEmbed("info", data.channels.length ? "None." : `Here's the list of statistic shown by the server stats. If you want to delete a statistic, just delete the statistic VC.\n\n${data.channels.map((x, i) => `${i + 1}. - Format: \`${x.format}\`. Preview: \`${this.client.memberCounter.parseString(x.format, message.guild!)}\``).join("\n")}`));
        },
        add: async (message: IMessage, args: string[]) => {
            if (!this.client.db) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!message.member!.hasPermission("MANAGE_CHANNELS")) return message.channel.send(createEmbed("error", "You don't have `Manage Channels` permission to use this command!"));

            const collection = this.client.db.collection<IMemberCounter>("membercounter");
            const data = await collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", `There's no server stats running in your server. Use \`${this.client.config.prefix}serverstats setup\` to create one.`));

            if (!args.length) return message.channel.send(createEmbed("error", "Please, give the statistic format text."));
            const format = args.join(" ");
            const preview = this.client.memberCounter.parseString(format, message.guild!);

            const confirmEmote = "✅";
            const cancelEmote = "❎";

            const previewmsg = await message.channel.send(createEmbed("info", `Here's the preview of the statistic.\n\n\`${preview}\`\n\nReact with ${confirmEmote} if you want to continue and react with ${cancelEmote} if you want to cancel. Don't worry, you can always use \`${this.client.config.prefix}serverstats add\` again.`));

            await previewmsg.react(confirmEmote);
            await previewmsg.react(cancelEmote);

            const collector = previewmsg.createReactionCollector((reaction: MessageReaction, user: User) => user.id === message.author.id);
            collector.on("collect", reaction => {
                if (reaction.emoji.name === confirmEmote) {
                    return collector.stop("continue");
                } else if (reaction.emoji.name === cancelEmote) {
                    return collector.stop("cancel");
                }
            });
            collector.on("end", async (collected: Collection<string, MessageReaction>, reason: string) => {
                if (reason === "continue") {
                    await previewmsg.reactions.removeAll().catch(() => null);
                    await previewmsg.edit(createEmbed("info", "Adding...")).catch(() => null);
                    setTimeout(async () => {
                        const newdata = await collection.findOne({ guild: message.guild!.id });
                        if (!newdata) return previewmsg.edit(createEmbed("error", "Unable to add statistic because the server stats data of this server was deleted."));

                        const newchannel = await message.guild!.channels.create(this.client.memberCounter.parseString(format, message.guild!), {
                            type: "voice",
                            parent: newdata.category
                        }).catch(() => undefined);
                        if (!newchannel) return previewmsg.edit(createEmbed("error", "Unable to add statistic because I was unable to create a new channel."));

                        newdata.channels.push({
                            id: newchannel.id,
                            format
                        });
                        await collection.updateOne({ guild: message.guild!.id }, { $set: newdata }, { upsert: true });
                        return previewmsg.edit(createEmbed("success", "Statistic added!"));
                    }, 1000);
                }
            });
        }
    };

    public async execute(message: IMessage, args: string[]): Promise<any> {
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send(createEmbed("error", `Invalid option. Use \`${this.client.config.prefix}serverstats help\` to see list of options.`));
        args.shift();
        return opt(message, args);
    }
}
