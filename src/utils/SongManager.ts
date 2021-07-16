import { Song } from "../structures/Song";
import { Collection, Snowflake, SnowflakeUtil } from "discord.js";

export class SongManager extends Collection<Snowflake, Song> {
    public addSong(song: Song): this {
        return this.set(SnowflakeUtil.generate(), song);
    }

    public deleteFirst(): boolean {
        return this.delete(this.firstKey()!);
    }
}
