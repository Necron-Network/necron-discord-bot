import { ITextChannel } from "../typings";
import { SongManager } from "../utils/SongManager";
import { Snowflake, VoiceChannel, VoiceConnection } from "discord.js";

export class ServerQueue {
    public connection: VoiceConnection | null = null;
    public readonly songs = new SongManager();
    public volume = 100;
    public loop = false;
    public timeout: NodeJS.Timeout | null = null;
    private _playing = false;
    private _lastMusicMessageID: Snowflake | undefined = undefined;
    private _lastvoiceStateUpdateMessageID: Snowflake | undefined = undefined;
    public constructor(public textChannel: ITextChannel | null = null, public voiceChannel: VoiceChannel | null = null) {
        Object.defineProperties(this, {
            _lastMusicMessageID: {
                enumerable: false
            },
            _lastvoiceStateUpdateMessageID: {
                enumerable: false
            },
            _playing: {
                enumerable: false
            },
            timeout: {
                enumerable: false
            }
        });
    }

    public get playing(): boolean {
        return this._playing;
    }

    public set playing(state: boolean) {
        this._playing = state;
    }

    public get lastMusicMessageID(): Snowflake | undefined {
        return this._lastMusicMessageID;
    }

    public set lastMusicMessageID(id: Snowflake | undefined) {
        this._lastMusicMessageID = id;
    }

    public get lastVoiceStateUpdateMessageID(): Snowflake | undefined {
        return this._lastvoiceStateUpdateMessageID;
    }

    public set lastVoiceStateUpdateMessageID(id: Snowflake | undefined) {
        this._lastvoiceStateUpdateMessageID = id;
    }
}
