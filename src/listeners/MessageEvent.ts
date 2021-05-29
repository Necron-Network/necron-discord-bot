import { MessageEmbed, User } from "discord.js";
import { IMessage, IAntiInvite } from "../typings";
import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";

@DefineListener("message")
export class MessageEvent extends BaseListener {
    public async execute(message: IMessage): Promise<any> {
        if (message.author.bot || message.channel.type === "dm") return message;

        const data = await this.client.db!.collection<IAntiInvite>("antiinvite").findOne({ guild: message.guild!.id });
        if (data && (/((https|http)?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discordapp|discord)\.com\/invite)\/.+[a-z]/g.exec(message.content)) && !data.whitelist.some(x => message.member!.roles.cache.has(x))) return message.delete();

        if (message.content.startsWith(this.client.config.prefix)) return this.client.commands.handle(message);

        if ((await this.getUserFromMention(message.content))?.id === this.client.user?.id) {
            message.channel.send(
                new MessageEmbed()
                    .setAuthor(this.client.user?.username, this.client.user?.displayAvatarURL())
                    .setColor("#00FF00")
                    .setDescription(`:wave: | Hello ${message.author.username}, my prefix is \`${this.client.config.prefix}\``)
                    .setTimestamp()
            ).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        }
    }

    private getUserFromMention(mention: string): Promise<User | undefined> {
        const matches = /^<@!?(\d+)>$/.exec(mention);
        if (!matches) return Promise.resolve(undefined);

        const id = matches[1];
        return this.client.users.fetch(id);
    }
}
