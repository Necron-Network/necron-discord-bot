import { NecronClient } from "../structures/NecronClient";
import { GuildMember, SnowflakeUtil } from "discord.js";
import { Collection } from "mongodb";

export interface IInfraction {
    userID: string;
    guildID: string;
    at: number;
    infractionID: string;
    reason?: string;
}

type InfractionFunctionData = GuildMember|{ userID: string; guildID: string };

export class InfractionManager {
    private collection: Collection<IInfraction>|undefined = undefined;

    public constructor(public readonly client: NecronClient) {}

    public loadCollection(): void {
        this.collection = this.client.db?.collection<IInfraction>("infraction");
    }

    public parseData(data: InfractionFunctionData): { userID: string; guildID: string } {
        return "userID" in data ? data : { userID: data.id, guildID: data.guild.id };
    }

    public async fetchUserInfractions(data: InfractionFunctionData): Promise<IInfraction[]> {
        const dataFetchFilter = this.parseData(data);
        return this.collection?.find(dataFetchFilter).toArray() ?? [];
    }

    public async addInfraction(data: InfractionFunctionData, reason?: string): Promise<IInfraction[]> {
        const parsedData = this.parseData(data);
        const time = Date.now();
        const insertData: IInfraction = {
            at: time,
            guildID: parsedData.guildID,
            infractionID: `${parsedData.guildID}-${parsedData.userID}-${SnowflakeUtil.generate(time)}`,
            reason,
            userID: parsedData.userID
        };

        await this.collection?.insertOne(insertData);

        return this.fetchUserInfractions(data);
    }

    public async removeInfraction(infractionID: string): Promise<IInfraction[]> {
        const infractionData = await this.collection?.findOne({ infractionID });
        if (!infractionData) throw Error("Invalid Infraction ID");

        await this.collection?.deleteOne({ infractionID: infractionData.infractionID });
        return this.fetchUserInfractions({ userID: infractionData.userID, guildID: infractionData.guildID });
    }

    public async purgeInfraction(data: InfractionFunctionData): Promise<void> {
        const deleteFilter = this.parseData(data);
        await this.collection?.deleteMany(deleteFilter);
    }
}
