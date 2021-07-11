import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage, ITextChannel, INekosLifeImgResponse } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

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

        const { url } = await this.client.request.get("https://nekos.life/api/v2/img/futanari").json<INekosLifeImgResponse>();

        return message.channel.send({
            embeds: [createEmbed("success").setTitle("Futanari Image").setURL(url)
                .setImage(url)
                .setAuthor("Click here if you don't see image", undefined, url)]
        });
    }
}
