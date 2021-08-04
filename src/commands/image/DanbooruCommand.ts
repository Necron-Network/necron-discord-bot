import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel, IDanbooruPost } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { createButton } from "../../utils/createButton";

@DefineCommand({
    description: "Gives you a random danbooru image",
    name: "danbooru",
    usage: "{prefix}danbooru [tags]"
})
export class DanbooruCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        const loadPosts = async (): Promise<IDanbooruPost[]> => {
            const url = new URL("https://danbooru.donmai.us/posts.json");
            url.searchParams.set("random", "true");

            if (args[0]) {
                url.searchParams.set("tags", args.join(" "));
            }

            const extException = ["mp4", "m4a", "zip", "rar"];
            const posts = await this.client.request.get(url.toString()).json<IDanbooruPost[]>();
            return posts.filter(x => (!x.is_deleted && !extException.includes(x.file_ext) && ((message.channel as ITextChannel).nsfw ? true : (x.rating === "s"))));
        };

        let posts = await loadPosts();
        let seenPost: number[] = [];

        if (!posts.length) return message.channel.send({ embeds: [createEmbed("error", "No result.")] });

        const post = posts[0];
        const embed = createEmbed("success");

        function syncEmbed(syncPost: IDanbooruPost): void {
            const imgUrl = ((syncPost.large_file_url === "" || syncPost.large_file_url === null) ? undefined : syncPost.large_file_url) ?? syncPost.file_url;

            embed.setTitle(`Danbooru Image (${syncPost.id})`).setURL(`https://danbooru.donmai.us/posts/${syncPost.id}`)
                .setAuthor("Click here if you don't see image", undefined, imgUrl)
                .setImage(imgUrl);
        }

        syncEmbed(post);

        const stopButton = createButton("DANGER", "Stop").setCustomId("STOP");
        const nextButton = createButton("PRIMARY", "Next").setEmoji("➡️").setCustomId("NEXT");

        const msg = await message.channel.send({
            embeds: [embed],
            components: [{ components: [stopButton, nextButton] }]
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
                    components: [{ components: [stopButton, nextButton] }]
                });
                seenPost.push(nextPost.id);
            } else {
                await msg.delete();
            }
        });
    }
}
