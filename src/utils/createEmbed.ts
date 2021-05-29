import { MessageEmbed } from "discord.js";

type hexColorsType = "info" | "warn" | "error" | "success";
const hexColors: Record<hexColorsType, string> = {
    info: "#00FF00",
    warn: "#FFFF00",
    success: "#0DFF00",
    error: "#FF0000"
};

export function createEmbed(type: hexColorsType, message?: string): MessageEmbed {
    const embed = new MessageEmbed()
        .setColor(hexColors[type]);

    if (message) embed.setDescription(message);
    return embed;
}
