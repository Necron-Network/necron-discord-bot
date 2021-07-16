import { ISong } from "../typings";
import { AudioResource, demuxProbe, createAudioResource } from "@discordjs/voice";
import ytdl from "discord-ytdl-core";

export class Song {
    public constructor(public readonly data: ISong) {}

    public async download(): Promise<AudioResource<Song>> {
        const stream = ytdl(this.data.url, {
            filter: "audioonly",
            quality: "highestaudio",
            opusEncoded: true
        });
        const probe = await demuxProbe(stream);

        return createAudioResource(probe.stream, {
            metadata: this,
            inputType: probe.type,
            inlineVolume: true
        });
    }
}
