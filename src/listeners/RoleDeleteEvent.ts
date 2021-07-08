import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { IMuteRole } from "../typings";
import { Role } from "discord.js";

@DefineListener("roleDelete")
export class RoleDeleteEvent extends BaseListener {
    public async execute(role: Role): Promise<any> {
        const collection = this.client.db?.collection<IMuteRole>("muterole");
        const data = await collection?.findOne({ guildID: role.guild.id, roleID: role.id });
        if (!data) return;

        await collection?.deleteOne({ guildID: role.guild.id });
    }
}
