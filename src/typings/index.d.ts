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

export interface INekosLifeImgResponse {
    url: string;
}

export interface IDanbooruPost {
    id: number;
    created_at: string;
    uploader_id: number;
    score: number;
    source: string;
    md5: string;
    last_comment_bumped_at: string|null;
    rating: "s"|"q"|"e";
    image_width: number;
    image_height: number;
    tag_string: string;
    is_note_locked: boolean;
    fav_count: number;
    file_ext: string;
    last_noted_at: string|null;
    is_rating_locked: boolean;
    parent_id: number;
    has_children: boolean;
    approver_id: number;
    tag_count_general: number;
    tag_count_artist: number;
    tag_count_character: number;
    tag_count_copyright: number;
    file_size: number;
    is_status_locked: boolean;
    pool_string: string;
    up_score: number;
    down_score: number;
    is_pending: boolean;
    is_flagged: boolean;
    is_deleted: boolean;
    tag_count: number;
    updated_at: string|null;
    is_banned: boolean;
    pixiv_id: number|null;
    last_commented_at: string|null;
    has_active_children: boolean;
    bit_flags: number;
    tag_count_meta: number;
    has_large: boolean;
    has_visible_children: boolean;
    tag_string_general: string;
    tag_string_character: string;
    tag_string_copyright: string;
    tag_string_artist: string;
    tag_string_meta: string;
    file_url: string;
    large_file_url: string|null;
    preview_file_url: string;
}
