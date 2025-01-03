import { Track } from "../../interfaces/spotify";

export interface SpotifyUser {
    country: string;
    display_name: string;
    email: string;
    explicitContent: {
        filterEnabled: boolean;
        filterLocked: boolean;
    };
    externalUrls: {
        spotify: string;
    };
    followers: {
        href: string;
        total: number;
    };
    href: string;
    id: string;
    images: Array<{
        url: string;
        height: number;
        width: number;
    }>;
    product: string;
    type: string;
    uri: string;
}