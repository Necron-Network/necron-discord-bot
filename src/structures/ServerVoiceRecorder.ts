import { ITextChannel } from "../typings";
import { VoiceConnection, VoiceChannel } from "discord.js";
import { Readable } from "stream";

export class ServerVoiceRecorder {
    public connection: VoiceConnection|null = null;
    public receiverStream: Readable|null = null;
    public readonly chunks: string[] = [];
    private _recording = false;

    public constructor(public textChannel: ITextChannel, public voiceChannel: VoiceChannel) {
        Object.defineProperties(this, {
            _recording: {
                enumerable: false
            }
        });
    }

    public get recording(): boolean {
        return this._recording;
    }

    public set recording(state: boolean) {
        this._recording = state;
    }
}
