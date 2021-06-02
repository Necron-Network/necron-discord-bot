import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel, IDanbooruPost } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Gives you a random danbooru image",
    name: "danbooru",
    usage: "{prefix}danbooru [tags]"
})
export class DanbooruCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!(message.channel as ITextChannel).nsfw) {
            return message.channel.send(createEmbed("error", "You can't use this command outside NSFW channel")).catch(() => undefined).then(m => {
                if (!m) return;

                setTimeout(() => {
                    m.delete().catch(() => null);
                }, 5000);
            });
        }

        const url = new URL("https://danbooru.donmai.us/posts.json");
        url.searchParams.set("random", "true");

        if (args[0]) {
            url.searchParams.set("tags", args.join(" "));
        }

        const extException = ["mp4", "m4a", "zip", "rar"];
        const posts = await this.client.request.get(url.toString()).json<IDanbooruPost[]>();
        const post = posts.filter(x => (!x.is_deleted && !extException.includes(x.file_ext)))[0] as IDanbooruPost|undefined;

        if (!post) return message.channel.send(createEmbed("error", "No result."));

        const imgUrl = ((post.large_file_url === "" || post.large_file_url === null) ? undefined : post.large_file_url) ?? post.file_url;

        return message.channel.send(createEmbed("success").setTitle(`Danbooru Image (${post.id})`).setURL(`https://danbooru.donmai.us/posts/${post.id}`)
            .setAuthor("Click here if you don't see image", undefined, imgUrl)
            .setImage(imgUrl));
    }
}
