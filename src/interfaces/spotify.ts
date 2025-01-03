export interface ITrack {
    added_at: string|undefined;
    added_by: {
      external_urls: {
        spotify: string;
      };
      followers: {
        href: string;
        total: number;
      };
      href: string;
      id: string;
      type: string;
      uri: string;
    }|undefined;
    is_local: boolean|undefined;
    track: {
      album: {
        album_type: string;
        total_tracks: number;
        available_markets: Array<string>;
        external_urls: {
          spotify: string;
        };
        href: string;
        id: string;
        images: Array<{
          url: string;
          height: number;
          width: number;
        }>;
        name: string;
        release_date: string;
        release_date_precision: string;
        restrictions: {
          reason: string;
        };
        type: string;
        uri: string;
        artists: Array<{
          external_urls: {
            spotify: string;
          };
          href: string;
          id: string;
          name: string;
          type: string;
          uri: string;
        }>;
      };
      artists: Array<{
        external_urls: {
          spotify: string;
        };
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
      }>;
      available_markets: Array<string>;
      disc_number: number;
      duration_ms: number;
      explicit: boolean;
      external_ids: {
        isrc: string;
        ean: string;
        upc: string;
      };
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      is_playable: boolean;
      linked_from: {};
      restrictions: {
        reason: string;
      };
      name: string;
      popularity: number;
      preview_url: string;
      track_number: number;
      type: string;
      uri: string;
      is_local: boolean;
    }|undefined;
    GetImage(): string;
    GetUrl(): string;
    GetArtist(): string;
    GetAlbumName(): string;
    GetAlbumUrl(): string;
    GetTitle(): string;

  }

export class Track implements ITrack {
  added_at: string|undefined;
  added_by: {
    external_urls: {
      spotify: string;
    }; followers: {
      href: string;
      total: number;
    }; href: string; id: string; type: string; uri: string;
  }|undefined;
  is_local: boolean|undefined;
  track: {
    album: {
      album_type: string;
      total_tracks: number;
      available_markets: Array<string>;
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
      name: string;
      release_date: string;
      release_date_precision: string;
      restrictions: {
        reason: string;
      };
      type: string;
      uri: string;
      artists: Array<{
        external_urls: {
          spotify: string;
        };
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
      }>;
    }; artists: Array<{
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      name: string;
      type: string;
      uri: string;
    }>; available_markets: Array<string>; disc_number: number; duration_ms: number; explicit: boolean; external_ids: {
      isrc: string;
      ean: string;
      upc: string;
    }; external_urls: {
      spotify: string;
    }; href: string; id: string; is_playable: boolean; linked_from: {}; restrictions: {
      reason: string;
    }; name: string; popularity: number; preview_url: string; track_number: number; type: string; uri: string; is_local: boolean;
  }|undefined;
  static FromObject(object:any){
    let track = new Track();
    track.added_at = object?.added_at??''
    track.added_by = object?.added_by??''
    track.is_local = object?.is_local??false
    track.track = object?.track??''
    return track
  }
  GetImage(): string {
    if(this.track?.album?.images && this.track.album.images.length > 0){
      return this.track.album.images[0].url
    }
    return ""
  }
  GetUrl(): string {
    if(this.track?.external_urls?.spotify && this.track.external_urls.spotify.length > 0){
      return this.track.external_urls.spotify
    }
    return ""
  }
  GetArtist(): string {
    if(this.track?.artists && this.track.artists.length > 0){
      return this.track.artists[0].name
    }
    return ""
  }
  GetAlbumName(): string {
    if(this.track?.album && this.track.album.name.length > 0){
      return this.track.album.name
    }
    return ""
  }
  GetAlbumUrl(): string {
    if(this.track?.album && this.track.album.external_urls.spotify?.length > 0){
      return this.track.album.external_urls.spotify
    }
    return ""
  }
  GetTitle(): string {
    if(this.track?.name && this.track.name.length > 0){
      return this.track.name
    }
    return ""
  }

}

export interface TrackView {
  added_at:string,
  id:string,
  artist_ids:string[],
  album_id:string,
  youtube_url:string
}
export interface PlaylistTracksResponse {
    href: string;
    items: Array<Track>;
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
}
export interface IPlaylist {
    collaborative: boolean;
    description: string;
    external_urls: {
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
    name: string;
    owner: {
      external_urls: {
        spotify: string;
      };
      followers: {
        href: string;
        total: number;
      };
      href: string;
      id: string;
      type: string;
      uri: string;
      displayName: string;
    };
    public: boolean;
    snapshotId: string;
    tracks: {
      href: string, 
      total: number      
  },
  [key: string]: any;  // This allows any string key
    type: string;
    uri: string;
  GetTitle(): string;
  GetUrl(): string;
  GetImage(): string;
}

export class Playlist implements IPlaylist {
  [key: string]: any;
  collaborative: boolean = false;
  description: string = "";
  external_urls: { spotify: string; } = { spotify: "" };
  followers: { href: string; total: number; } = { href: "", total: 0 };
  href: string = "";
  id: string = "";
  images: { url: string; height: number; width: number; }[] = [];
  name: string = "";
  owner: {
    external_urls: {
      spotify: string;
    }; followers: {
      href: string;
      total: number;
    }; href: string; id: string; type: string; uri: string; displayName: string;
  } = { external_urls: { spotify: "" }, followers: { href: "", total: 0 }, href: "", id: "", type: "", uri: "", displayName: "" };
  public: boolean = false;
  snapshotId: string = "";
  tracks: { href: string; total: number; } = { href: "", total: 0 };
  type: string = "";
  uri: string = "";

  GetTitle(): string {
    return this.name
  }
  GetUrl(): string {
    if(this.external_urls.spotify && this.external_urls.spotify.length > 0){
      return this.external_urls.spotify
    }
    return ""
  }
  GetImage(): string {
    if(this.images && this.images.length > 0){
      return this.images[0].url
    }
    return ""
  }

  static FromObject(object:any){
    let playlist = new Playlist();
    if(!object) return playlist
    playlist.collaborative = object?.collaborative??false
    playlist.description = object?.description??''
    playlist.external_urls.spotify = object?.external_urls?.spotify??''
    playlist.followers.href = object?.followers?.href??''
    playlist.followers.total = object?.followers?.total??0
    playlist.href = object?.href??''
    playlist.id = object?.id??''
    playlist.images = object?.images??[]
    playlist.name = object?.name??''
    playlist.owner.external_urls.spotify = object?.owner?.external_urls?.spotify??''
    playlist.owner.followers.href = object?.owner?.followers?.href??''
    playlist.owner.followers.total = object?.owner?.followers?.total??0
    playlist.owner.href = object?.owner?.href??''
    playlist.owner.id = object?.owner?.id??''
    playlist.owner.type = object?.owner?.type??''
    playlist.owner.uri = object?.owner?.uri??''
    playlist.owner.displayName = object?.owner?.displayName??''
    playlist.public = object?.public??false
    playlist.snapshotId = object?.snapshotId??''
    playlist.tracks.href = object?.tracks?.href??''
    playlist.tracks.total = object?.tracks?.total??0
    playlist.type = object?.type??''
    playlist.uri = object?.uri??''
    return playlist
  }
  static toPublic(playlist:Playlist):PublicPlaylist|null{
    if(!playlist) return null
    let publicPlaylist:PublicPlaylist = {
      url:playlist.external_urls?.spotify??"",
      track_total:playlist.tracks?.total??0,
      uri: playlist.uri??"",
      name: playlist.name??"Unknown Playlist",
      image_url: playlist.images[0]?.url??"",
      owner_name: playlist.owner?.displayName??"",
      owner_uri: playlist.owner?.uri??"",
      is_following: false,
      id:playlist.id??"",
      owner_id:playlist.owner?.id??""
    }
    return publicPlaylist
  }
}
export interface PlaylistDetail extends IPlaylist {
    collaborative: boolean;
    description: string;
    external_urls: {
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
    name: string;
    owner: {
      external_urls: {
        spotify: string;
      };
      followers: {
        href: string;
        total: number;
      };
      href: string;
      id: string;
      type: string;
      uri: string;
      displayName: string;
    };
    public: boolean;
    snapshotId: string;
    tracks: {
      href: string,
      limit: number, 
      total: number,
      next:string,
      offset:number,
      previous:string,
      items:Array<Track>
  },
    type: string;
    uri: string;
}


export interface SavedTracksResponse{
    savedTracks:Array<Track>;
    lastAdded:number
}

export interface SavedTrack{
  addedAt: string;
  id:string
  artist_id:string
}

export interface Dictionary<T> {
  [Key: string]: T;
}

export interface PublicPlaylist{
  "url":string,
  "track_total":number,
  "uri": string,
  "name": string,
  "image_url": string,
  "owner_name": string,
  "owner_uri": string,
  "is_following": boolean,
  "id":string, 
  "owner_id":string
}