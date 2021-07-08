import { NecronClient } from "../structures/NecronClient";
import { IMessage, ITextChannel } from "../typings";
import { createEmbed } from "../utils/createEmbed";
import { User, Role } from "discord.js";
import { Collection } from "mongodb";

export type LogsType = "ghost-ping"|"message-delete";

export interface IGuildLogs {
    guildID: string;
    channelID: string;
    enabled: boolean;
    logs: LogsType[];
}

export class GuildLogsManager {
    private collection: Collection<IGuildLogs>|undefined = undefined;

    public constructor(public readonly client: NecronClient) {}

    public load(): void {
        this.collection = this.client.db?.collection<IGuildLogs>("guildlogs");
    }

    public async send(guildID: string, type: LogsType, props: IMessage): Promise<void> {
        const data = await this.collection?.findOne({ guildID });
        if (!data) throw Error("GuildLogsErr: Data couldn't be found");

        const channel = (await this.client.utils.fetchChannel(data.channelID)) as ITextChannel|undefined;
        if (!channel) throw Error("GuildLogsErr: Invalid channel");

        switch (type) {
            case "ghost-ping":
                // eslint-disable-next-line no-case-declarations
                const mentions: (User|Role)[] = [];
                mentions.push(...props.mentions.users.values());
                mentions.push(...props.mentions.roles.values());

                await channel.send(createEmbed("info", props.content).setAuthor(props.author.tag, props.author.displayAvatarURL({ format: "png", size: 2048, dynamic: true })).setTitle("Ghost Ping Reminder")
                    .addField("Mentions", mentions.map(x => x.toString()).join(" ")));
                break;
            case "message-delete":
                await channel.send(createEmbed("info", props.content).setTitle(`Message in ${(channel.toString as (() => string))()} deleted`).setAuthor(props.author.tag, props.author.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))
                    .setFooter(props.embeds.length ? "Message embed below" : ""));

                if (props.embeds.length) {
                    await channel.send(props.embeds);
                }
                break;
            default:
                throw Error("GuildLogsErr: Invalid type");
        }
    }
}
