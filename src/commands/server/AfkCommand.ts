import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, IAfk, ITextChannel } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { MessageAttachment } from "discord.js";

@DefineCommand({
    aliases: [],
    cooldown: 5,
    description: "Set yourself as AFK in the server",
    name: "afk",
    usage: "{prefix}afk [reason]"
})
export class AfkCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!this.client.db) return message.channel.send(createEmbed("error", "Couldn't contact database. Please, try again later."));

        const collection = this.client.db.collection<IAfk>("afk");
        if ((await collection.findOne({ user: message.author.id }))) return message.channel.send(createEmbed("error", "You're already AFK"));

        const reason = args.join(" ");
        let attachment = message.attachments.filter(x => {
            const imageExt = ["jpg", "png", "webp", "gif"];
            const ext = x.url.slice((x.url.lastIndexOf(".") - 1 >>> 0) + 2);
            return imageExt.includes(ext);
        }).first()?.url ?? "";

        if (attachment !== "") {
            const msg = await ((await this.client.utils.fetchChannel("848785076241694732")) as ITextChannel).send(new MessageAttachment(attachment));
            attachment = msg.attachments.first()!.url;
        }

        await message.delete();

        const embed = createEmbed("info", reason === "" ? undefined : reason)
            .setTitle(`${message.author.username} is now AFK`)
            .setThumbnail(message.author.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))
            .setFooter("Use --pass to bypass AFK");
        if (attachment !== "") embed.setImage(attachment);
        const afkMsg = await message.channel.send(embed);

        return collection.insertOne({
            afkChannel: afkMsg.channel.id,
            afkMsg: afkMsg.id,
            attachment,
            guild: message.guild!.id,
            reason,
            since: Date.now(),
            user: message.author.id
        });
    }
}
