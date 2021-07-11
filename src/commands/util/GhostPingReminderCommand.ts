import { IMessage, IGhostPingReminder, ITextChannel } from "../../typings";
import { BaseCommand } from "../../structures/BaseCommand";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Ghost ping reminder utility",
    name: "ghostpingreminder",
    usage: "{prefix}ghostpingreminder"
})
export class GhostPingReminderCommand extends BaseCommand {
    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
        disable: async (message: IMessage) => {
            if (!this.collection) return message.channel.send({ embeds: [createEmbed("error", "Couldn't contact database. Please, try again later.")] });

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data?.enabled) return message.channel.send({ embeds: [createEmbed("error", "Ghost ping reminder is already disabled")] });

            data.enabled = false;
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send({ embeds: [createEmbed("success", "Ghost ping reminder disabled")] });
        },
        enable: async (message: IMessage) => {
            if (!this.collection) return message.channel.send({ embeds: [createEmbed("error", "Couldn't contact database. Please, try again later.")] });

            let data = await this.collection.findOne({ guild: message.guild!.id });
            if (data) {
                if (data.enabled) return message.channel.send({ embeds: [createEmbed("error", "Ghost ping reminder is already enabled")] });

                data.enabled = true;
                await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            } else {
                data = {
                    enabled: true,
                    guild: message.guild!.id,
                    whitelistedChannels: [],
                    whitelistedUsers: []
                };

                await this.collection.insertOne(data);
            }

            return message.channel.send({ embeds: [createEmbed("success", "Ghost ping reminder enabled")] });
        },
        "whitelist-channel": async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send({ embeds: [createEmbed("error", "Couldn't contact database. Please, try again later.")] });

            const channel = message.mentions.channels.first() as ITextChannel|undefined ?? (await this.client.utils.fetchChannel(args[0])) as ITextChannel|undefined;
            if (!channel || channel.guild.id !== message.guild!.id) return message.channel.send({ embeds: [createEmbed("error", "Invalid channel")] });

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send({ embeds: [createEmbed("error", "Ghost ping reminder data of this server couldn't be found")] });

            data.whitelistedChannels.push(channel.id);
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send({ embeds: [createEmbed("success", `\`${channel.name}\` channel is whitelisted`)] });
        },
        "whitelist-user": async (message: IMessage, args: string[]) => {
            if (!this.collection) return message.channel.send({ embeds: [createEmbed("error", "Couldn't contact database. Please, try again later.")] });

            const user = message.mentions.users.first() ?? await this.client.utils.fetchUser(args[0]);
            if (!user) return message.channel.send({ embeds: [createEmbed("error", "Invalid user")] });

            const data = await this.collection.findOne({ guild: message.guild!.id });
            if (!data) return message.channel.send({ embeds: [createEmbed("error", "Ghost ping reminder data of this server couldn't be found")] });

            data.whitelistedUsers.push(user.id);
            await this.collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            return message.channel.send({ embeds: [createEmbed("success", `${user.tag} is whitelisted`)] });
        }
    };

    private readonly collection = this.client.db?.collection<IGhostPingReminder>("ghostpingreminder");

    public execute(message: IMessage, args: string[]): any {
        if (!message.member?.permissions.has("MANAGE_GUILD", true)) return message.channel.send({ embeds: [createEmbed("error", "You don't have `Manage Server` permission to use this command!")] });
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send({ embeds: [createEmbed("error", `Invalid option. Use \`${this.client.config.prefix}serverstats help\` to see list of options.`)] });
        args.shift();
        return opt(message, args);
    }
}
