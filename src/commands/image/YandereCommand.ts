import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel, IYanderePost } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Gives you a random yande.re image",
    name: "yandere",
    usage: "{prefix}yandere [tags]"
})
export class YandereCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        const url = new URL("https://yande.re/post.json");
        url.searchParams.set("limit", "100");

        if (args[0]) {
            url.searchParams.set("tags", args.join(" "));
        }

        const extException = ["mp4", "m4a", "zip", "rar"];
        const posts = await this.client.request.get(url.toString()).json<IYanderePost[]>();
        const filtered = posts.filter(x => (!extException.includes(x.file_ext)) && ((message.channel as ITextChannel).nsfw ? true : (x.rating === "s")));
        const post = filtered[Math.floor(Math.random() * filtered.length)] as IYanderePost|undefined;

        if (!post) return message.channel.send(createEmbed("error", "No result."));

        return message.channel.send(createEmbed("success").setTitle(`Danbooru Image (${post.id})`).setURL(`https://yande.re/post/show/${post.id}`)
            .setAuthor("Click here if you don't see image", undefined, post.file_url)
            .setImage(post.file_url));
    }
}
