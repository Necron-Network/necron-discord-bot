import { Snowflake, Message, TextChannel, DMChannel, NewsChannel, Collection, ClientEvents, Guild, VoiceState } from "discord.js";
import { NecronClient } from "../structures/NecronClient";
import { ServerQueue } from "../structures/ServerQueue";

export interface IListener {
    readonly name: keyof ClientEvents;
    execute(...args: any): void;
}

export interface ICommandComponent {
    meta: {
        aliases?: string[];
        cooldown?: number;
        disable?: boolean;
        readonly path?: string;
        devOnly?: boolean;
        description?: string;
        readonly category?: string;
        name: string;
        usage?: string;
    };
    execute(message: IMessage, args: string[]): any;
}

export interface ICategoryMeta {
    name: string;
    hide: boolean;
    cmds: Collection<string, ICommandComponent>;
}

export interface IMessage extends Message {
    public channel: ITextChannel | IDMChannel | INewsChannel;
    client: NecronClient;
    guild?: IGuild;
}
export interface ITextChannel extends TextChannel {
    lastMessageID: Snowflake | null;
    readonly lastMessage: IMessage | null;
    send(
        options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<IMessage>;
    send(
        options: (MessageOptions & { split: true | SplitOptions; content: StringResolvable }) | APIMessage,
    ): Promise<IMessage[]>;
    send(
        content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<IMessage>;
    send(content: StringResolvable, options?: MessageOptions & { split: true | SplitOptions }): Promise<IMessage[]>;
}

export interface IDMChannel extends DMChannel {
    lastMessageID: Snowflake | null;
    readonly lastMessage: IMessage | null;
    send(
        options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<IMessage>;
    send(
        options: (MessageOptions & { split: true | SplitOptions; content: StringResolvable }) | APIMessage,
    ): Promise<IMessage[]>;
    send(
        content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<IMessage>;
    send(content: StringResolvable, options?: MessageOptions & { split: true | SplitOptions }): Promise<IMessage[]>;
}

export interface INewsChannel extends NewsChannel {
    lastMessageID: Snowflake | null;
    readonly lastMessage: IMessage | null;
    send(
        options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<IMessage>;
    send(
        options: (MessageOptions & { split: true | SplitOptions; content: StringResolvable }) | APIMessage,
    ): Promise<IMessage[]>;
    send(
        content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<IMessage>;
    send(content: StringResolvable, options?: MessageOptions & { split: true | SplitOptions }): Promise<IMessage[]>;
}

export interface IAntiInvite {
    guild: string;
    whitelist: string[];
    enabled: boolean;
}

export interface IAfk {
    user: string;
    since: number;
    attachment: string;
    reason: string;
    guild: string;
    afkChannel: string;
    afkMsg: string;
}

export interface IGuild extends Guild {
    client: NecronClient;
    queue?: ServerQueue;
}

export interface IVoiceState extends VoiceState {
    guild: IGuild;
}

export interface ISong {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    duration: number;
}
