import { Playlist, PlaylistDetail } from "../../interfaces/spotify";
import { SpotifyUser } from "./UserResponse";

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: SpotifyUser;
    user_limit: number;
    app_limit: number;
}

export interface InitAuthResponse{
  url:string,
  tempToken:string
}

export interface GeneratedResponse{
  message:string, 
  user_limit:number, 
  app_limit:number,
  your_playlist:any
}

export interface GeoLocationResponse{
  country_code:string,
  country_name:string,
  city:string,
  postal:string,
  latitude:number,
  longitude:number,
  IPv4:string,
  state:string
}