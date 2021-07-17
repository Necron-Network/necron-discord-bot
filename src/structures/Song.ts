import { ISong } from "../typings";
import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import ytdl from "discord-ytdl-core";
import { Transform } from "stream";

export class Song {
    public constructor(public readonly data: ISong) {}

    public async download(): Promise<AudioResource<Song>> {
        const stream = ytdl(this.data.url, {
            filter: "audioonly",
            quality: "highestaudio",
            opusEncoded: true
        });

        const transform = new Transform();

        const probe = await demuxProbe(stream.pipe(transform));
        return createAudioResource(probe.stream, {
            metadata: this,
            inputType: probe.type,
            inlineVolume: true
        });
    }
}
