/* eslint-disable no-eval */
import { NecronClient } from "../structures/NecronClient";
import { ITextChannel } from "../typings";
import { MessageEmbedOptions, GuildMember, MessageEmbed } from "discord.js";
import { Canvas, resolveImage } from "canvas-constructor";

export interface IEmbedOptions extends MessageEmbedOptions {
    enabled?: boolean;
}

export interface IWelcomeImage {
    enabled: boolean;
    designId: string;
    text: {
        title: string;
        description: string;
    };
    background?: string;
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
            x: number|string;
            y: number|string;
        };
        title: {
            x: number|string;
            y: number|string;
        };
        description: {
            x: number|string;
            y: number|string;
        };
    };
    size: {
        profilePhoto: number;
    };
}

export const WelcomeImageDesign: Record<string, IWelcomeImageDesign> = {
    1: {
        position: {
            profilePhoto: {
                x: 325,
                y: 500
            },
            title: {
                x: 650,
                y: 400
            },
            description: {
                x: 650,
                y: 600
            }
        },
        size: {
            profilePhoto: 256
        }
    },
    2: {
        position: {
            profilePhoto: {
                x: 1024,
                y: 325
            },
            title: {
                x: "1024 - (canvas.measureText(data.text.title).width / 2)",
                y: 700
            },
            description: {
                x: "1024 - (canvas.measureText(data.text.description).width / 2)",
                y: 800
            }
        },
        size: {
            profilePhoto: 225
        }
    }
};

export class WelcomeMessageManager {
    public constructor(public readonly client: NecronClient) {}

    public async renderImage(imageData: IWelcomeImage, member: GuildMember): Promise<Buffer> {
        const data = {
            background: imageData.background,
            color: {
                description: imageData.color?.description ?? "#FFFFFF",
                profilePhotoOutline: imageData.color?.profilePhotoOutline ?? "#FFFFFF",
                title: imageData.color?.title ?? "#FFFFFF"
            },
            designId: imageData.designId,
            enabled: imageData.enabled,
            size: {
                description: imageData.size?.description ?? 50,
                profilePhotoOutline: imageData.size?.profilePhotoOutline ?? 0,
                title: imageData.size?.title ?? 60
            },
            text: {
                description: this.parseString(imageData.text.description, member),
                title: this.parseString(imageData.text.title, member)
            }
        };
        const design = WelcomeImageDesign[data.designId];
        const canvas = new Canvas(2048, 1000);

        if (data.background && data.background !== "transparent") {
            const bg = await resolveImage(Buffer.from(data.background, "base64")).catch(() => undefined);
            if (bg) canvas.printImage(bg, 0, 0, 2048, 1000);
        }

        const designData: IWelcomeImageDesign = {
            position: {
                description: {
                    x: await eval(String(design.position.description.x)),
                    y: await eval(String(design.position.description.y))
                },
                profilePhoto: {
                    x: await eval(String(design.position.profilePhoto.x)),
                    y: await eval(String(design.position.profilePhoto.y))
                },
                title: {
                    x: await eval(String(design.position.title.x)),
                    y: await eval(String(design.position.title.y))
                }
            },
            size: design.size
        };

        canvas.setColor(data.color.profilePhotoOutline)
            .printCircle(designData.position.profilePhoto.x as number, designData.position.profilePhoto.y as number, designData.size.profilePhoto + data.size.profilePhotoOutline)
            .printCircularImage(await resolveImage(member.user.displayAvatarURL({ format: "png", size: 2048 })), designData.position.profilePhoto.x as number, designData.position.profilePhoto.y as number, designData.size.profilePhoto, designData.size.profilePhoto as any)
            .setColor(data.color.title)
            .setTextSize(data.size.title)
            .printText(data.text.title, designData.position.title.x as number, designData.position.title.y as number)
            .setColor(data.color.description)
            .setTextSize(data.size.description)
            .printText(data.text.description, designData.position.description.x as number, designData.position.description.y as number);

        return canvas.toBufferAsync();
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
