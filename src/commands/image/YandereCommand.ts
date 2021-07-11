import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel, IYanderePost } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { createButton } from "../../utils/createButton";

@DefineCommand({
    description: "Gives you a random yande.re image",
    name: "yandere",
    usage: "{prefix}yandere [tags]"
})
export class YandereCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        const loadPosts = async (): Promise<IYanderePost[]> => {
            const url = new URL("https://yande.re/post.json");
            url.searchParams.set("limit", "100");

            if (args[0]) {
                url.searchParams.set("tags", args.join(" "));
            }

            const extException = ["mp4", "m4a", "zip", "rar"];
            const posts = await this.client.request.get(url.toString()).json<IYanderePost[]>();
            return posts.filter(x => (!extException.includes(x.file_ext)) && ((message.channel as ITextChannel).nsfw ? true : (x.rating === "s")));
        };

        let posts = await loadPosts();
        let seenPost: number[] = [];

        if (!posts.length) return message.channel.send({ embeds: [createEmbed("error", "No result.")] });

        const post = posts[0];
        const embed = createEmbed("success");

        function syncEmbed(syncPost: IYanderePost): void {
            embed.setTitle(`Yandere Image (${syncPost.id})`).setURL(`https://yande.re/post/show/${syncPost.id}`)
                .setAuthor("Click here if you don't see image", undefined, syncPost.file_url)
                .setImage(syncPost.file_url);
        }

        syncEmbed(post);

        const stopButton = createButton("DANGER", "Stop").setCustomId("STOP");
        const nextButton = createButton("PRIMARY", "Next").setEmoji("➡️").setCustomId("NEXT");

        const msg = await message.channel.send({
            embeds: [embed],
            components: [[stopButton, nextButton]]
        });

        seenPost.push(post.id);

        if (posts.length <= 1) return;

        const collector = msg.createMessageComponentCollector({
            filter: i => {
                void i.deferUpdate();

                return ["NEXT", "STOP"].includes(i.customId) && i.user.id === message.author.id;
            }
        });

        collector.on("collect", async i => {
            if (i.customId === "NEXT") {
                let nextPost = posts.find(p => !seenPost.includes(p.id));
                if (!nextPost) {
                    posts = await loadPosts();
                    nextPost = posts.find(p => !seenPost.includes(p.id));

                    if (!nextPost) {
                        seenPost = [];
                        nextPost = posts[0];
                    }
                }

                syncEmbed(nextPost);
                await msg.edit({
                    embeds: [embed],
                    components: [[stopButton, nextButton]]
                });
                seenPost.push(nextPost.id);
            } else {
                await msg.delete();
            }
        });
    }
}
