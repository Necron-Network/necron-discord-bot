import { ClientOptions, ClientPresenceStatus, Intents, UserResolvable } from "discord.js";

export const defaultPrefix = ";";
export const devs: UserResolvable[] = ["366169273485361153"]; // NOTE: Please change this
export const clientOptions: ClientOptions = {               // https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
    allowedMentions: { parse: ["users", "everyone"] },    // NOTE: Please configure these after you're using this template,
    fetchAllMembers: false,                 // especially allowedMentions, fetchAllMembers, messageCacheLifetime, messageSweepInterval, and Intents
    messageCacheLifetime: 1800,            // and the other one if you want to configure them too, but mostly, allowedMentions to Intents should do
    messageCacheMaxSize: Infinity,
    messageEditHistoryMaxSize: Infinity,
    messageSweepInterval: 300,
    partials: ["MESSAGE", "GUILD_MEMBER", "CHANNEL", "REACTION", "USER"],
    restTimeOffset: 300,
    retryLimit: 3,
    ws: {
        intents: [Intents.ALL] // NOTE: Please use Intents that you will only need
    }
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
