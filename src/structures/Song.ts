import { ISong } from "../typings";
import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import ytdl from "discord-ytdl-core";

export class Song {
    public constructor(public readonly data: ISong) {}

    public async download(): Promise<AudioResource<Song>> {
        const stream = ytdl(this.data.url, {
            filter: "audioonly",
            quality: "highestaudio",
            opusEncoded: true
        });

        return createAudioResource(stream, {
            metadata: this,
            inputType: StreamType.Opus,
            inlineVolume: true
        });
    }
}
