import { ISong } from "../typings";
import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";

export class Song {
    public constructor(public readonly data: ISong) {}

    public async download(): Promise<AudioResource<Song>> {
        const ytdlStream = ytdl(this.data.url, {
            o: "-",
            q: "",
            f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
            r: "100K"
        }, {
            stdio: ["ignore", "pipe", "ignore"]
        });
        if (!ytdlStream.stdout) throw Error("No stdout data");

        const probe = await demuxProbe(ytdlStream.stdout);
        return createAudioResource(probe.stream, {
            metadata: this,
            inputType: probe.type,
            inlineVolume: true
        });
    }
}
