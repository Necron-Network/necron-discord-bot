import { MessageButton, MessageButtonStyle } from "discord.js";

export function createButton(style: MessageButtonStyle, label?: string): MessageButton {
    const button = new MessageButton()
        .setStyle(style);

    if (label) button.setLabel(label);
    return button;
}
