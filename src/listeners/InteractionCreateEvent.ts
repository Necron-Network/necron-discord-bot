import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { ITicketMessage } from "../typings";
import { Interaction } from "discord.js";

@DefineListener("interactionCreate")
export class InteractionCreateEvent extends BaseListener {
    public async execute(interaction: Interaction): Promise<any> {
        if (!interaction.isMessageComponent()) return;

        const data = await this.client.db?.collection("ticketmessage").findOne({ id: interaction.message.id });
        if (!data) return;
        if (!interaction.isButton() || !["OPEN_TICKET", "CLOSE_TICKET_YES", "CLOSE_TICKET_NO", "REOPEN_TICKET"].includes(interaction.customId)) return;
    }
}
