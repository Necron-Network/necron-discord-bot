import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { IMemberCounter } from "../utils/MemberCounterManager";
import { DMChannel, GuildChannel } from "discord.js";

@DefineListener("channelDelete")
export class ChannelDeleteEvent extends BaseListener {
    public async execute(channel: DMChannel|GuildChannel): Promise<any> {
        if (!("guild" in channel)) return;

        const collection = this.client.db!.collection<IMemberCounter>("membercounter");
        const data = await collection.findOne({ guild: channel.guild.id });

        if (data?.channels.map(x => x.id).concat(data.category).includes(channel.id)) {
            if (channel.id === data.category) {
                for (const ch of data.channels.map(x => x.id)) {
                    const channel = await this.client.utils.fetchChannel(ch).catch(() => undefined);
                    if (!channel) continue;

                    await channel.delete().catch(() => null);
                }

                return collection.deleteOne({ guild: channel.guild.id });
            }

            const chIndex = data.channels.findIndex(x => x.id === channel.id);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete data.channels[chIndex];

            return collection.updateOne({ guild: channel.guild.id }, { $set: data }, { upsert: true });
        }
    }
}
