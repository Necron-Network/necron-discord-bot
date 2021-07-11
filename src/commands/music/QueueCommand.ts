import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMusicPlaying } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";
import { chunk } from "../../utils/chunk";
import { MessageReaction, User } from "discord.js";

@DefineCommand({
    aliases: ["q"],
    description: "Show the current queue",
    name: "queue",
    usage: "{prefix}queue"
})
export class QueueCommand extends BaseCommand {
    @isMusicPlaying()
    public async execute(message: IMessage): Promise<any> {
        return message.channel.send({ embeds: [createEmbed("error", "Work in Progress")] });

        const embed = createEmbed("info").setTitle("Music Queue").setThumbnail(this.client.user!.displayAvatarURL({ format: "png", size: 2048, dynamic: true }));

        const songs = message.guild!.queue!.songs.array().map((s, i) => `**${i + 1}. [${s.title}](${s.url})**`);
        if (songs.length <= 10) return message.channel.send({ embeds: [embed.setDescription(songs.join("\n"))] });

        const pages = chunk(songs, 10);
        let page = 0;

        function syncDesc(): void {
            embed.setDescription(pages[page].join("\n")).setFooter(`Page ${page + 1}/${pages.length}`);
        }

        syncDesc();
        const msg = await message.channel.send({ embeds: [embed] });

        const reactions = ["◀️", "▶️"];
        await msg.react("◀️").catch(() => null);
        await msg.react("▶️").catch(() => null);

        const collector = msg.createReactionCollector({
            time: 120000,
            filter: (reaction: MessageReaction, user: User) => (message.author.id === user.id) && (reactions.includes(reaction.emoji.name!))
        });
        collector.on("collect", (reaction: MessageReaction) => {
            switch (reaction.emoji.name!) {
                case "◀️":
                    page--;
                    if (page < 0) page = pages.length - 1;
                    break;
                case "▶️":
                    page++;
                    if (page >= pages.length) page = 0;
                    break;
            }
            syncDesc();
            msg.edit({ embeds: [embed] }).catch(() => null);
        }).on("end", () => msg.reactions.removeAll().catch(() => null));
    }
}
