import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { IMemberCounter } from "../../utils/MemberCounterManager";

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
            await this.client.db.collection("membercounter").insertOne({
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
        edit: async (message: IMessage) => {
            if (!this.client.db) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));
            if (!message.member!.hasPermission("MANAGE_CHANNELS")) return message.channel.send(createEmbed("error", "You don't have `Manage Channels` permission to use this command!"));
            if (!message.guild!.me!.hasPermission("MANAGE_CHANNELS")) return message.channel.send(createEmbed("error", "I don't have `Manage Channels` permission to setup member counter channel!"));
            const data = await this.client.db.collection<IMemberCounter>("membercounter").findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send(createEmbed("error", "You don't have any stats running."));
            await message.channel.send(createEmbed("error", "Coming soon!"));
        }
    };

    public async execute(message: IMessage, args: string[]): Promise<any> {
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send("Invalid option");
        args.shift();
        return opt(message, args);
    }
}
