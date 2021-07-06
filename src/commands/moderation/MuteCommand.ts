import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, IMuteRole } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Mute member",
    name: "mute",
    usage: "{prefix}mute <@mention|id>"
})
export class MuteCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!message.member?.hasPermission("MANAGE_ROLES")) return message.channel.send(createEmbed("error", "You don't have permission to use this command!"));
        if (!message.guild?.me?.hasPermission("MANAGE_ROLES")) return message.channel.send(createEmbed("error", "I don't have `Manage Roles` permission to mute members!"));

        const member = message.mentions.members?.first() ?? await message.guild.members.fetch(args[0]).catch(() => undefined);
        if (!member) return message.channel.send(createEmbed("error", "Invalid user"));

        const collection = this.client.db?.collection<IMuteRole>("muterole");
        const roleData = await collection?.findOne({ guildID: message.guild.id });
        let role = message.guild.roles.cache.get(roleData?.roleID as string);
        if (!role) {
            if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.channel.send(createEmbed("error", "I don't have `Manage Channels` permission to set role permission on channels!"));

            const newRole = await message.guild.roles.create({
                data: {
                    mentionable: false,
                    name: "Necron Mute",
                    permissions: ["VIEW_CHANNEL"],
                    position: message.guild.me.roles.highest.position ? (message.guild.me.roles.highest.position - 1) : undefined
                },
                reason: "Create mute role"
            }).catch(() => undefined);

            if (!newRole) return message.channel.send(createEmbed("error", "Unable to create mute role"));

            const newData: IMuteRole = {
                guildID: message.guild.id,
                roleID: newRole.id
            };
            roleData ? await collection?.updateOne({ guildID: message.guild.id }, { $set: newData }, { upsert: true }) : await collection?.insertOne(newData);
            role = newRole;
        }

        const result = await member.roles.add(role.id).catch(() => undefined);
        if (!result) return message.channel.send(createEmbed("error", "Unable to mute that member"));

        await message.channel.send(createEmbed("success", "Successfully muted").setAuthor(member.user.tag, member.user.displayAvatarURL({ format: "png", size: 2048, dynamic: true })));

        for (const channel of message.guild.channels.cache.array()) {
            await channel.createOverwrite(role.id, {
                SEND_MESSAGES: false,
                SEND_TTS_MESSAGES: false,
                ADD_REACTIONS: false
            }).catch(() => undefined);
        }
    }
}
