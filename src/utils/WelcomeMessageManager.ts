import { NecronClient } from "../structures/NecronClient";
import { ITextChannel } from "../typings";
import { MessageEmbedOptions, GuildMember, MessageEmbed } from "discord.js";
// import { Canvas } from "canvas-constructor";

export interface IEmbedOptions extends MessageEmbedOptions {
    enabled?: boolean;
}

export interface IWelcomeImage {
    enabled?: boolean;
    designId?: string;
    background?: {
        data: string;
        format: string;
    };
    color?: {
        profilePhotoOutline?: string;
        title?: string;
        description?: string;
    };
    size?: {
        profilePhotoOutline?: number;
        title?: number;
        description?: number;
    };
}

export interface IWelcomeMessage {
    guild: string;
    enabled: boolean;
    channel: string;
    props: {
        content: string;
        embed?: IEmbedOptions;
    };
}

export interface IWelcomeImageDesign {
    position: {
        profilePhoto: {
            x: number;
            y: number;
        };
        title: {
            x: number;
            y: number;
        };
        description: {
            x: number;
            y: number;
        };
    };
}

export class WelcomeMessageManager {
    public constructor(public readonly client: NecronClient) {}

    public async renderImage(/* data: IWelcomeImage */): Promise<void> {
        "a";
    }

    public async sendData(data: IWelcomeMessage, member: GuildMember, embedOnly: boolean): Promise<void> {
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

        if (embed && (embedOnly ? true : data.props.embed?.enabled)) {
            await ch.send({ content: embedOnly ? "" : this.parseString(data.props.content, member), embeds: [embed] });
        } else {
            await ch.send(this.parseString(data.props.content, member));
        }
    }

    public parseString(str: string, member: GuildMember): string {
        return str.replace(/{guild.member.count}/g, member.guild.members.cache.size.toString())
            .replace(/{guild.name}/g, member.guild.name)
            .replace(/{member.username}/g, member.user.username)
            .replace(/{member.tag}/g, member.user.tag)
            .replace(/{member.mention}/g, member.user.toString())
            .replace(/{member.discriminator}/g, member.user.discriminator)
            .replace(/{member.id}/g, member.user.id);
    }
}
