import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel, INHentaiGallery, INHentaiGalleryTag } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { createButton } from "../../utils/createButton";
import { ColorResolvable } from "discord.js";

@DefineCommand({
    aliases: ["nh"],
    description: "Read NHentai doujinshi/manga/gallery",
    devOnly: true,
    name: "nhentai",
    usage: "{prefix}nhentai [search query|gallery id]"
})
export class NHentaiCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!(message.channel as ITextChannel).nsfw) {
            return message.channel.send({ embeds: [createEmbed("error", "You can't use this command outside NSFW channel")] }).catch(() => undefined).then(m => {
                if (!m) return;

                setTimeout(() => {
                    m.delete().catch(() => null);
                }, 5000);
            });
        }

        let gallery: INHentaiGallery;
        if (args.length) {
            if (isNaN(Number(args.join(" ")))) {
                const result = await this.client.request.get(`https://nhentai.net/api/galleries/search?query=${args.join(" ")}`).json<{result: INHentaiGallery[]; num_pages: number; per_page: number} | {error: string}>().catch(() => undefined);
                if (!result || "error" in result) return message.channel.send({ embeds: [createEmbed("error", "No result found")] });
                gallery = result.result[Math.floor(Math.random() * result.result.length)];
            } else {
                const result = await this.client.request.get(`https://nhentai.net/api/gallery/${args.join(" ")}`).json<INHentaiGallery|{error: string}>().catch(() => undefined);
                if (!result || "error" in result) return message.channel.send({ embeds: [createEmbed("error", "No result found")] });
                gallery = result;
            }
        } else {
            const { url } = await this.client.request.get(`https://nhentai.net/random`);
            const result = await this.client.request.get(`https://nhentai.net/api/gallery/${url.split("/").pop()!}`).json<INHentaiGallery|{error: string}>().catch(() => undefined);
            if (!result || "error" in result) return message.channel.send({ embeds: [createEmbed("error", "An error occured. Please, try again later")] });
            gallery = result;
        }
        return this.handleGallery(gallery, message);
    }

    private async handleGallery(gallery: INHentaiGallery, message: IMessage): Promise<any> {
        const readButton = createButton("PRIMARY", "Read").setCustomId("READ");

        const msg = await message.channel.send({
            embeds: [createEmbed("info").setColor("EC2854" as ColorResolvable).setTitle(gallery.title.pretty)
                .setURL(`https://nhentai.net/g/${gallery.id}`)
                .setImage(`https://t.nhentai.net/galleries/${gallery.media_id}/cover.${this.parseImgType(gallery.images.cover.t)}`)
                .setFooter("Use \"Read\" button to read.")
                .addField("Language", (gallery.tags.filter(x => (x.type === "language") && (x.name !== "translated"))[0] as INHentaiGalleryTag|undefined)?.name ?? "No Information")
                .setAuthor(message.author.username, message.author.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))],
            components: [{ components: [readButton], type: "BUTTON" }]
        }).catch(() => undefined);

        if (!msg) return;
        const collector = msg.createMessageComponentCollector({
            filter: i => (i.user.id === message.author.id) && (i.customId === "READ")
        });
        collector.on("collect", () => collector.stop("read"));
        collector.on("end", async (collected, reason) => {
            if (reason === "read") {
                await msg.delete().catch(() => null);
                return this.initializeReader(gallery, message);
            }
        });
    }

    private async initializeReader(gallery: INHentaiGallery, message: IMessage): Promise<any> {
        let page = 0;
        const pages = gallery.images.pages.map((x, i) => `https://i.nhentai.net/galleries/${gallery.media_id}/${i + 1}.${this.parseImgType(x.t)}`);
        const embed = createEmbed("info").setColor("EC2854" as ColorResolvable).setTitle(gallery.title.pretty);

        function syncEmbed(): void {
            embed.setImage(pages[page]).setFooter(`Page ${page + 1}/${pages.length}`);
        }

        syncEmbed();

        const prevButton = createButton("PRIMARY", "Previous").setEmoji("◀️").setCustomId("PREV");
        const stopButton = createButton("DANGER", "Stop reading").setCustomId("STOP");
        const nextButton = createButton("PRIMARY", "Next").setEmoji("▶️").setCustomId("NEXT");

        const msg = await message.channel.send({ embeds: [embed], components: [{ components: [prevButton, stopButton, nextButton], type: "BUTTON" }] });

        const collector = msg.createMessageComponentCollector({
            filter: i => (i.user.id === message.author.id) && (["PREV", "STOP", "NEXT"].includes(i.customId))
        });

        collector.on("collect", async i => {
            if (i.customId === "PREV") {
                page--;
                if (page < 0) page = 0;
            } else if (i.customId === "NEXT") {
                page++;
                if (page >= pages.length) page = pages.length - 1;
            } else {
                await msg.delete();
                return;
            }

            syncEmbed();
            await msg.edit({ embeds: [embed], components: [{ components: [prevButton, stopButton, nextButton], type: "BUTTON" }] });
        });
    }

    private parseImgType(type: "j"|"p"|"g"): string {
        const ext = {
            j: "jpg",
            p: "png",
            g: "gif"
        };
        return ext[type];
    }
}
