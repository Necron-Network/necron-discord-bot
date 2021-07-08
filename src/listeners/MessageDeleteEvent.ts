import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { IMessage, IGhostPingReminder } from "../typings";
import { createEmbed } from "../utils/createEmbed";
import { User, Role } from "discord.js";

@DefineListener("messageDelete")
export class MessageDeleteEvent extends BaseListener {
    public async execute(message: IMessage): Promise<any> {
        if (message.partial as boolean || message.channel.type !== "text") return;

        void this.client.logs.send(message.guild!.id, "message-delete", message).catch(() => null);

        const mentions: (User|Role)[] = [];
        mentions.push(...message.mentions.users.values());
        mentions.push(...message.mentions.roles.values());
        if (!mentions.length) return;

        const data = await this.client.db?.collection<IGhostPingReminder>("ghostpingreminder").findOne({ guild: message.guild!.id });
        if (!data?.enabled) return;
        if (data.whitelistedChannels.includes(message.channel.id) || data.whitelistedUsers.includes(message.author.id)) return;

        void this.client.logs.send(message.guild!.id, "ghost-ping", message).catch(() => null);

        return message.channel.send(createEmbed("info", message.content).setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", size: 2048, dynamic: true })).setTitle("Ghost Ping Reminder")
            .addField("Mentions", mentions.map(x => x.toString()).join(" ")));
    }
}
