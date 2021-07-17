import { ISong } from "../typings";
import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";

export class Song {
    public constructor(public readonly data: ISong) {}

    public download(): Promise<AudioResource<Song>> {
        return new Promise((resolve, reject) => {
            const ytdlStream = ytdl(this.data.url, {
                o: "-",
                q: "",
                f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
                r: "100K"
            }, {
                stdio: ["ignore", "pipe", "ignore"]
            });
            if (!ytdlStream.stdout) throw Error("No stdout data");

            void ytdlStream.on("spawn", () => {
                void demuxProbe(ytdlStream.stdout!).then(probe => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type, inlineVolume: true }))).catch(err => {
                    if (!ytdlStream.killed) ytdlStream.kill();
                    ytdlStream.stdout?.resume();
                    reject(err);
                });
            });
        });
    }
}
