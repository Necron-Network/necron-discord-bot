import { NecronClient } from "../structures/NecronClient";
import { ITextChannel } from "../typings";
import { createEmbed } from "./createEmbed";

export class VoteReminder {
    public constructor(public readonly client: NecronClient) {}

    public loadInterval(): void {
        setInterval(async () => {
            const now = new Date();
            if (now.getUTCHours() === 5 && now.getUTCMinutes() === 0) {
                await this.emit("781193213519855676");
            }
        }, 60000);
    }

    public async emit(channelID: string): Promise<void> {
        await ((await this.client.utils.fetchChannel(channelID)) as ITextChannel).send({
            content: "@everyone",
            embeds: [createEmbed("info", "Vote di minecraft-mp udah reset nih! Ayo Vote!\n\n> Global Vote:\n> https://minecraft-mp.com/server/285796/vote/").setTitle("Vote Reminder")]
        });
    }
}
