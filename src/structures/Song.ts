import { ISong } from "../typings";
import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import ytdl from "discord-ytdl-core";
import { Transform } from "stream";

export class Song {
    public constructor(public readonly data: ISong) {}

    public async download(): Promise<AudioResource<Song>> {
        const ytdlStream = ytdl(this.data.url, {
            filter: "audioonly",
            quality: "highestaudio",
            opusEncoded: true
        });

        const transform = new Transform();
        ytdlStream.pipe(transform).pipe(process.stdout);

        const probe = await demuxProbe(process.stdout);
        return createAudioResource(probe.stream, {
            metadata: this,
            inputType: probe.type,
            inlineVolume: true
        });
    }
}
