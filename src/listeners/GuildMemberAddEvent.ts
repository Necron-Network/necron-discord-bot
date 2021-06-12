import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { IWelcomeMessage } from "../utils/WelcomeMessageManager";
import { GuildMember } from "discord.js";

@DefineListener("guildMemberAdd")
export class GuildMemberAddEvent extends BaseListener {
    public async execute(member: GuildMember): Promise<void> {
        if (member.partial as boolean) await member.fetch();
        if (!this.client.db) return;

        const data = await this.client.db.collection<IWelcomeMessage>("welcomemessage").findOne({ guild: member.guild.id });
        if (!data) return;

        return this.client.welcomer.sendData(data, member, false);
    }
}
