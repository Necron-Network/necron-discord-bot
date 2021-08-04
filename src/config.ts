import { ClientOptions, ClientPresenceStatus, Intents, UserResolvable } from "discord.js";

export const defaultPrefix = ";";
export const devs: UserResolvable[] = ["366169273485361153", "278121557665120267"]; // NOTE: Please change this
export const clientOptions: ClientOptions = {
    allowedMentions: { parse: ["users", "everyone"] },
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_WEBHOOKS],
    partials: ["MESSAGE", "GUILD_MEMBER", "CHANNEL", "REACTION", "USER"],
    restTimeOffset: 300,
    retryLimit: 3
};
export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;
export const prefix = isDev ? "d;" : ";";
export const presenceData = {
    activities: [
        "Hello, World!",
        "Watching {textChannels.size} of text channels in {guilds.size}",
        "Listening to {users.size} of users",
        "Hello there! I am {username}",
        `My default prefix is ${prefix}`
    ],
    status: ["online"] as ClientPresenceStatus[],
    interval: 60000
};
export const shardsCount: number | "auto" = "auto";
export const dbName = "NecronDatabase";
export const port = 4785;
