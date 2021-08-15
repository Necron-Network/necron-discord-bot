import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, IAntiInvite } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["antiinvitelink"],
    description: "Anti invite utility",
    name: "antiinvite",
    usage: "{prefix}antiinvite"
})
export class AntiInviteCommand extends BaseCommand {
    public readonly options: Record<string, (message: IMessage, args: string[]) => any> = {
        enable: async (message: IMessage) => {
            if (!this.client.db) return message.channel.send({ embeds: [createEmbed("error", "Couldn't contact database. Please, try again later.")] });
            if (!message.member?.permissions.has("MANAGE_GUILD")) return message.channel.send({ embeds: [createEmbed("error", "You don't have `Manage Server` permission to use this command!")] });

            const collection = this.client.db.collection<IAntiInvite>("antiinvite");
            let data = await collection.findOne({ guild: message.guild!.id });
            if (data?.enabled) return message.channel.send({ embeds: [createEmbed("error", "Anti invite already enabled")] });

            data = {
                guild: message.guild!.id,
                whitelist: [],
                enabled: true
            };
            return collection.insertOne(data).catch(() => undefined).then(result => {
                if (!result) return message.channel.send({ embeds: [createEmbed("error", "Unable to enable anti invite for your server. Please, try again later.")] });

                return message.channel.send({ embeds: [createEmbed("success", "Anti invite enabled")] });
            });
        },
        disable: async (message: IMessage) => {
            if (!this.client.db) return message.channel.send({ embeds: [createEmbed("error", "Couldn't contact database. Please, try again later.")] });
            if (!message.member?.permissions.has("MANAGE_GUILD")) return message.channel.send({ embeds: [createEmbed("error", "You don't have `Manage Server` permission to use this command!")] });

            const collection = this.client.db.collection<IAntiInvite>("antiinvite");
            const data = await collection.findOne({ guild: message.guild!.id });
            if (!data || !data.enabled) return message.channel.send({ embeds: [createEmbed("error", "Anti invite already disabled")] });

            return collection.deleteOne({ guild: message.guild!.id }).catch(() => undefined).then(result => {
                if (!result) return message.channel.send({ embeds: [createEmbed("error", "Unable to disable anti invite for your server.")] });

                return message.channel.send({ embeds: [createEmbed("success", "Anti invite disabled")] });
            });
        },
        whitelist: async (message: IMessage, args: string[]) => {
            if (!this.client.db) return message.channel.send({ embeds: [createEmbed("error", "Couldn't contact database. Please, try again later.")] });
            if (!message.member?.permissions.has("MANAGE_GUILD")) return message.channel.send({ embeds: [createEmbed("error", "You don't have `Manage Server` permission to use this command!")] });

            if (!args[0] || args[0].length !== 18 || isNaN(Number(args[0]))) return message.channel.send({ embeds: [createEmbed("error", "Invalid Role ID")] });

            const role = message.guild?.roles.cache.get(args[0]) ?? await message.guild?.roles.fetch(args[0])?.catch(() => undefined);
            if (!role) return message.channel.send({ embeds: [createEmbed("error", "Invalid Role ID")] });

            const collection = this.client.db.collection<IAntiInvite>("antiinvite");
            let data = await collection.findOne({ guild: message.guild!.id });
            let result: any;

            if (data) {
                data.whitelist.push(role.id);
                result = await collection.updateOne({ guild: message.guild!.id }, { $set: data }, { upsert: true });
            } else {
                data = {
                    guild: message.guild!.id,
                    whitelist: [],
                    enabled: false
                };
                data.whitelist.push(role.id);
                result = await collection.insertOne(data);
            }

            if (!result) return message.channel.send({ embeds: [createEmbed("error", "Unable to whitelist that role for this server anti invite.")] });

            return message.channel.send({ embeds: [createEmbed("success", `Role \`${role.name}\`(${role.id}) whitelisted`)] });
        }
    };

    public execute(message: IMessage, args: string[]): any {
        const opt = this.options[args[0]] as ((message: IMessage, args: string[]) => any)|undefined;
        if (!opt) return message.channel.send("Invalid option");
        args.shift();
        return opt(message, args);
    }
}
