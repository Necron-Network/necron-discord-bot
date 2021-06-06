import { NecronClient } from "../structures/NecronClient";
import { ITextChannel } from "../typings";
import { MessageEmbedOptions, GuildMember, MessageEmbed } from "discord.js";

export interface IWelcomeMessage {
    guild: string;
    enabled: boolean;
    channel: string;
    props: {
        content: string;
        embed?: MessageEmbedOptions;
    };
}

export class WelcomeMessageManager {
    public constructor(public readonly client: NecronClient) {}

    public async sendData(data: IWelcomeMessage, member: GuildMember): Promise<void> {
        const ch = (await this.client.utils.fetchChannel(data.channel)) as ITextChannel|undefined;
        if (!ch) return;

        let embed: MessageEmbed|undefined = undefined;
        if (data.props.embed) {
            const embedData: MessageEmbedOptions = {
                author: {
                    name: this.parseString(data.props.embed.author?.name ?? "", member),
                    url: this.parseString(data.props.embed.author?.url ?? "", member),
                    icon_url: this.parseString(data.props.embed.author?.icon_url ?? "", member)
                },
                color: data.props.embed.color,
                description: this.parseString(data.props.embed.description ?? "", member),
                fields: data.props.embed.fields?.map(f => ({
                    name: this.parseString(String(f.name), member),
                    value: this.parseString(String(f.value), member),
                    inline: f.inline
                })),
                files: data.props.embed.files,
                footer: {
                    text: this.parseString(data.props.embed.footer?.text ?? "", member),
                    icon_url: this.parseString(data.props.embed.footer?.icon_url ?? "", member)
                },
                image: {
                    url: this.parseString(data.props.embed.image?.url ?? "", member)
                },
                thumbnail: {
                    url: this.parseString(data.props.embed.thumbnail?.url ?? "", member)
                },
                timestamp: data.props.embed.timestamp,
                title: this.parseString(data.props.embed.title ?? "", member),
                url: this.parseString(data.props.embed.url ?? "", member),
                video: {
                    url: this.parseString(data.props.embed.video?.url ?? "", member)
                }
            };

            embed = new MessageEmbed(embedData);
        }

        if (embed) {
            await ch.send(this.parseString(data.props.content, member), { embed });
        } else {
            await ch.send(this.parseString(data.props.content, member));
        }
    }

    public parseString(str: string, member: GuildMember): string {
        return str.replace(/{guild.member.count}/g, member.guild.members.cache.size.toString())
            .replace(/{member.username}/g, member.user.username)
            .replace(/{member.tag}/g, member.user.tag)
            .replace(/{member.mention}/g, member.user.toString())
            .replace(/{member.discriminator}/g, member.user.discriminator)
            .replace(/{member.id}/g, member.user.id);
    }
}