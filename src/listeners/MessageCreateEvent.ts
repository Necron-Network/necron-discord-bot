import { MessageEmbed, User } from "discord.js";
import { IMessage, IAntiInvite, IAfk, ITextChannel } from "../typings";
import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";

@DefineListener("messageCreate")
export class MessageCreateEvent extends BaseListener {
    public async execute(message: IMessage): Promise<any> {
        if (message.author.bot || message.channel.type === "DM") return message;

        const afkColl = this.client.db!.collection<IAfk>("afk");
        const afkData = await afkColl.findOne({ user: message.author.id, guild: message.guild!.id });
        if (afkData) {
            if (message.content.split(" ").includes("--pass")) {
                message.content = message.content.replace(" --pass", "");
            } else {
                await ((await this.client.utils.fetchChannel(afkData.afkChannel)) as ITextChannel).messages.delete(afkData.afkMsg).catch(() => null);
                await afkColl.deleteOne({ user: message.author.id });

                await message.channel.send({ embeds: [createEmbed("info", `Welcome back, ${message.author.username}.`)] }).catch(() => undefined).then(msg => {
                    if (!msg) return;

                    setTimeout(() => msg.delete(), 3000);
                });
            }
        }
        void (async () => {
            for (const user of [...message.mentions.users.values()].slice(0, 2)) {
                const userAfkData = await afkColl.findOne({ user: user.id, guild: message.guild!.id });
                if (userAfkData) {
                    const userFetch = await this.client.utils.fetchUser(userAfkData.user);
                    const embed = createEmbed("info", userAfkData.reason === "" ? undefined : userAfkData.reason)
                        .setTitle(`${userFetch!.username} is currently AFK`)
                        .setThumbnail(userFetch!.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))
                        .setFooter("AFK Since")
                        .setTimestamp(userAfkData.since);

                    if (userAfkData.attachment !== "") embed.setThumbnail(userAfkData.attachment);

                    await message.channel.send({ embeds: [embed] }).catch(() => undefined).then(msg => {
                        if (!msg) return;

                        setTimeout(() => msg.delete(), 5000);
                    });
                }
            }
        }).bind(this)();

        const data = await this.client.db!.collection<IAntiInvite>("antiinvite").findOne({ guild: message.guild!.id });
        if (data && (/((https|http)?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discordapp|discord)\.com\/invite)\/.+[a-z]/g.exec(message.content)) && !data.whitelist.some(x => message.member!.roles.cache.has(x))) return message.delete();

        if (message.content.startsWith(this.client.config.prefix)) return this.client.commands.handle(message);

        if ((await this.getUserFromMention(message.content))?.id === this.client.user?.id) {
            message.channel.send({
                embeds: [new MessageEmbed()
                    .setAuthor(this.client.user!.username, this.client.user?.displayAvatarURL())
                    .setColor("#00FF00")
                    .setDescription(`:wave: | Hello ${message.author.username}, my prefix is \`${this.client.config.prefix}\``)
                    .setTimestamp()]
            }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        }
    }

    private getUserFromMention(mention: string): Promise<User | undefined> {
        const matches = /^<@!?(\d+)>$/.exec(mention);
        if (!matches) return Promise.resolve(undefined);

        const id = matches[1];
        return this.client.users.fetch(id);
    }
}
