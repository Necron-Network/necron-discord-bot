import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel, INekosLifeImgResponse } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { createButton } from "../../utils/createButton";

@DefineCommand({
    description: "Gives you a random futanari image",
    name: "futanari",
    usage: "{prefix}futanari"
})
export class FutanariCommand extends BaseCommand {
    public async execute(message: IMessage): Promise<any> {
        if (!(message.channel as ITextChannel).nsfw) {
            return message.channel.send({ embeds: [createEmbed("error", "You can't use this command outside NSFW channel")] }).catch(() => undefined).then(m => {
                if (!m) return;

                setTimeout(() => {
                    m.delete().catch(() => null);
                }, 5000);
            });
        }

        const fetchImg = async (): Promise<INekosLifeImgResponse> => this.client.request.get("https://nekos.life/api/v2/img/futanari").json<INekosLifeImgResponse>();
        const embed = createEmbed("success").setTitle("Futanari Image");
        let img = await fetchImg();

        function syncEmbed(): void {
            embed.setURL(img.url)
                .setImage(img.url)
                .setAuthor("Click here if you don't see image", undefined, img.url);
        }

        syncEmbed();

        const stopButton = createButton("DANGER", "Stop").setCustomId("STOP");
        const nextButton = createButton("PRIMARY", "Next").setEmoji("➡️").setCustomId("NEXT");

        const msg = await message.channel.send({
            embeds: [embed],
            components: [{ components: [stopButton, nextButton], type: "BUTTON" }]
        });

        const collector = msg.createMessageComponentCollector({
            filter: i => {
                void i.deferUpdate();

                return ["NEXT", "STOP"].includes(i.customId) && i.user.id === message.author.id;
            }
        });

        collector.on("collect", async i => {
            if (i.customId === "NEXT") {
                img = await fetchImg();

                syncEmbed();
                await msg.edit({
                    embeds: [embed],
                    components: [{ components: [stopButton, nextButton], type: "BUTTON" }]
                });
            } else {
                await msg.delete();
            }
        });
    }
}
