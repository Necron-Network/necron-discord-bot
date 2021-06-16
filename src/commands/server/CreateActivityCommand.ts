import { BaseCommand } from "../../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel } from "../../utils/decorators/MusicHelper";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    description: "Create a embedded voice activity",
    name: "createactivity",
    usage: "{prefix}createactivity <youtube|poker|betrayal|fishington>"
})
export class CreateActivityCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    public async execute(message: IMessage, args: string[]): Promise<any> {
        if (!message.member?.voice.channel?.permissionsFor(this.client.user!.id)?.has("CREATE_INSTANT_INVITE")) return message.channel.send(createEmbed("error", "I don't have `Create Invite` permission in your voice channel"));

        const applicationIds: Record<string, string|undefined> = {
            youtube: process.env.YOUTUBE_ACTIVITY_ID,
            poker: process.env.POKER_ACTIVITY_ID,
            betrayal: process.env.BETRAYAL_ID,
            fishington: process.env.FISHINGTON_ID
        };
        const targetApplicationID = applicationIds[args[0]];
        if (!targetApplicationID) return message.channel.send(createEmbed("error", `Invalid activity type. Valid activity types are: ${Object.keys(applicationIds).map(x => `\`${x}\``).join(", ")}`));

        const inviteData = await this.client.request.post(`https://discord.com/api/v8/channels/${message.member.voice.channel.id}`, {
            headers: {
                authorization: `Bot ${this.client.token!}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                max_age: 0,
                target_type: 2,
                target_application_id: targetApplicationID
            })
        }).json<{ code: string }>();
        return message.channel.send(createEmbed("success", `[Click this link to join activity](https://discord.gg/${inviteData.code})`));
    }
}
