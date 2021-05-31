import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { MongoClient } from "mongodb";

@DefineListener("ready")
export class ReadyEvent extends BaseListener {
    public async execute(): Promise<void> {
        const mongo = new MongoClient(process.env.MONGO_URL!, { useUnifiedTopology: true });
        await mongo.connect(err => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (err) this.client.logger.error("MONGODB_CONN_ERR:", err);
            this.client.db = mongo.db(this.client.config.dbName);
            this.client.logger.info("Connected to MongoDB cloud!");
        });
        await this.client.commands.load();
        this.client.memberCounter.loadInterval();
        this.client.voteReminder.loadInterval();
        this.client.logger.info(this.formatString("{username} is ready to serve {users.size} users on {guilds.size} guilds in " +
        "{textChannels.size} text channels and {voiceChannels.size} voice channels!"));
    }

    public formatString(text: string): string {
        return text
            .replace(/{users.size}/g, (this.client.users.cache.size - 1).toString())
            .replace(/{textChannels.size}/g, this.client.channels.cache.filter(ch => ch.type === "text").size.toString())
            .replace(/{guilds.size}/g, this.client.guilds.cache.size.toString())
            .replace(/{username}/g, this.client.user?.username as string)
            .replace(/{voiceChannels.size}/g, this.client.channels.cache.filter(ch => ch.type === "voice").size.toString());
    }
}
