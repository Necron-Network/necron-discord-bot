import { ISong } from "../typings";
import { Collection, Snowflake, SnowflakeUtil } from "discord.js";

export class SongManager extends Collection<Snowflake, ISong> {
    public addSong(song: ISong): this {
        return this.set(SnowflakeUtil.generate(), song);
    }

    public deleteFirst(): boolean {
        return this.delete(this.firstKey()!);
    }
}
