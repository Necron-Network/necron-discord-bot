import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { ITextChannel } from "../typings";
import { Presence } from "discord.js";

@DefineListener("presenceUpdate")
export class PresenceUpdateEvent extends BaseListener {
    public async execute(oldPresence: Presence, newPresence: Presence): Promise<any> {
        if (oldPresence.status !== newPresence.status) {
            const user = await this.client.utils.fetchUser(newPresence.userID);
            const channel = (await this.client.utils.fetchChannel("849538208785367050")) as ITextChannel;

            await channel.send(createEmbed("info", `From **\`${oldPresence.status}\`** to **\`${newPresence.status}\`**`).setAuthor(user!.tag).setThumbnail(user!.displayAvatarURL({ format: "png", size: 2048, dynamic: true }))).catch(() => null);
        }
    }
}
