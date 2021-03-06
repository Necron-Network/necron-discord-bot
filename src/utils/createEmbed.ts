import { MessageEmbed, ColorResolvable } from "discord.js";

type hexColorsType = "info" | "warn" | "error" | "success";
const hexColors: Record<hexColorsType, string> = {
    info: "#3D83F5",
    warn: "#FFFF00",
    success: "#0DFF00",
    error: "#FF0000"
};

export function createEmbed(type: hexColorsType, message?: string): MessageEmbed {
    const embed = new MessageEmbed()
        .setColor(hexColors[type] as ColorResolvable);

    if (message) embed.setDescription(message);
    return embed;
}
