import { NumberInput } from "@angular/cdk/coercion"

export interface IAcousticBrainzData{
    highlevel: {
        danceability: {
            all: {
                danceable: number,
                not_danceable: number
            },
            probability: number,
            value: string,
        },
        gender: {
            all: {
                female: number,
                male: number
            },
            probability: number
            value: string,
        },
        genre_dortmund: {
            all: {
                alternative: number,
                blues: number,
                electronic: number,
                folkcountry: number,
                funksoulrnb: number,
                jazz: number,
                pop: number,
                raphiphop: number,
                rock: number
            },
            probability: number,
            value: string,
        },
        genre_electronic: {
            all: {
                ambient: number,
                dnb: number,
                house: number,
                techno: number,
                trance: number
            },
            probability: number,
            value: string,
        },
        mood_acoustic: {
            all: {
                acoustic: number,
                not_acoustic: number
            },
            probability: number,
            value: string,
        },
        mood_aggressive: {
            all: {
                aggressive: number,
                not_aggressive: 1
            },
            probability: number,
            value: string,
        },
        mood_electronic: {
            all: {
                electronic: number,
                not_electronic: number
            },
            probability: number,
            value: string,
        },
        mood_happy: {
            all: {
                happy: number,
                not_happy: number
            },
            probability:number,
            value: string,
        },
        mood_party: {
            all: {
                not_party:number,
                party: number
            },
            probability:number,
            value: string,
        },
        mood_relaxed: {
            all: {
                not_relaxed: number,
                relaxed: number
            },
            probability: number,
            value: string
        },
        mood_sad: {
            all: {
                not_sad: number,
                sad: number
            },
            probability: number,
            value: string,
        },
        moods_mirex: {
            all: {
                Cluster1: number,
                Cluster2: number,
                Cluster3: number,
                Cluster4: number,
                Cluster5: number
            },
            probability: number,
            value: string,
        },
        timbre: {
            all: {
                bright: number,
                dark: number
            },
            probability: number,
            value: string,
        },
        tonal_atonal: {
            all: {
                atonal: number,
                tonal: number,
            },
            probability: 1,
            value: string,
        },
        voice_instrumental: {
            all: {
                instrumental: number,
                voice: number
            },
            probability: number,
            value: string,
        }
    },
    metadata: {
        audio_properties: {
            analysis_sample_rate: number,
            bit_rate: number,
            codec: string,
            length: number,
            md5_encoded: string
        },
        tags: {
            album: string[]
            artist: string[]
        }
        }
    }

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
    features: IAcousticBrainzData|undefined;
    GetImage(): string;
    GetUrl(): string;
    GetArtist(): string;
    GetAlbumName(): string;
    GetAlbumUrl(): string;
    GetTitle(): string;
  }

export class Track implements ITrack {
  added_at: string|undefined;
  embed_url: string|undefined;
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
  features: IAcousticBrainzData|undefined;
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
  static ToSavedTrack(track:Track): SavedTrack {
    let savedTrack = {
      added_at: track.added_at??'',
      album_id: track.track?.album?.id??'',
      artist_ids: track.track?.artists.map(x => x.id)??[],
      track_name: track.track?.name??'',
      artist_name: track.track?.artists[0]?.name??'',
      track_length: track.track?.duration_ms??0,
      id: track.track?.id??'',
      saved: false,
      accounted_for: 0,
      playlist_ids: [],
      favourite: false,
      youtube_url: '',
      popularity: track.track?.popularity??0,
      available_markets: track.track?.album?.available_markets.length??0,
      album_name: track.track?.album?.name??'',
      album_release_date: track.track?.album?.release_date??'',
      album_url: track.track?.album.href??'',
      album_image: track.track?.album.images[0].url??'',
      preview_url: track.track?.preview_url??''
    }
    return savedTrack
  }

}

export interface TrackView {
  added_at:string,
  id:string,
  artist_ids:string[],
  album_id:string,
  youtube_url:string,
  accounted_for:number
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
      owner_id:playlist.owner?.id??"",
      last_refreshed:0,
      generated:false,
      tracks:[]
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
    savedTracks:Array<SavedTrack>;
    lastAdded:number
}

export interface SavedTrack{
  "added_at": string,
  "album_id": string,
  "artist_ids": Array<string>,
  "track_name": string,
  "artist_name": string,
  "track_length": number,
  "id": string,
  "saved": boolean,
  "accounted_for": number
  "playlist_ids": Array<string>
  "favourite": boolean,
  "youtube_url": string,
  "popularity":number,
  "available_markets":number,
  "album_name":string,
  "album_release_date":string,
  "album_url":string,
  "album_image":string,
  "preview_url":string
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
  "owner_id":string,
  "last_refreshed":number,
  "generated":boolean,
  "tracks":Array<SavedTrack>
}