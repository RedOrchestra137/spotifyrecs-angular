  import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { Routes } from '../../routes';
import { InitAuthResponse, TokenResponse } from '../spotify-interface/response objects/TokenResponse';
import {  SpotifyUser } from '../spotify-interface/response objects/UserResponse';
import { Playlist, PlaylistDetail, PublicPlaylist, SavedTrack, SavedTracksResponse, Track, TrackView } from '../interfaces/spotify';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ProgressService } from './progress.service';
@Injectable({
  providedIn: 'root'
})

export class SpotifyAuthService implements OnInit {

  savedTracksFinished:EventEmitter<boolean> = new EventEmitter()

  authenticated:boolean = false
  consentGranted:boolean = false
  authenticatedUser:SpotifyUser  | null = null
  avatar_img:string = ""
  avatar_lbl:string = ""
  user_id:string = ""
  saveTracks:boolean=false
  loadingSaved:boolean = false
  youtube:boolean = false
  private popPref:boolean = true
  private newArtists:boolean = true
  private newAlbums:boolean = true
  private _noDuplicateArtists:boolean = false
  private _noDuplicateAlbums:boolean = true

  publicUsername:string = ""
  publicPassword:string = ""

  loadingSavedProgress:number = 0
  loadingSavedMessage = ""

  private recentFavourites:PublicPlaylist|undefined;

  constructor(private client:HttpClient, private progressService:ProgressService) {
  }

  ngOnInit(): void {
  }

  public get newlySavedTracks():PublicPlaylist|undefined {return this.recentFavourites}

  checkTokens():boolean {
    if(!this.personal) return true
    let access_token = sessionStorage.getItem('access_token')
    let refresh_token = sessionStorage.getItem('refresh_token')
    let access_expiry = +(sessionStorage.getItem('access_token_expires_at')??0)
    let refresh_expiry = +(sessionStorage.getItem('refresh_token_expires_at')??0)
    if(refresh_expiry<=Date.now() && refresh_expiry != 0 || access_expiry<=Date.now() && access_expiry != 0) {
      this.logout()
      this.Authenticate()
    }
    if(access_token&&refresh_token) {

      this.authenticated = true
      return true
    }
    else{
      this.authenticated = false
      return false
    }
  }

  async getRecentFavourites(login:boolean=false):Promise<{success:boolean, playlist:PublicPlaylist|null}> {
    let plToOpen:PublicPlaylist|null = await firstValueFrom(this.client.get<PublicPlaylist>(Routes.Spotify.UpdateFavourites, {headers:{"middle-man":"true"}})).then(
      (response:PublicPlaylist)=>{
        return response
      },
      (error)=>{
        return null
      }
    )
    let response = {success:false, playlist:plToOpen}
    if(plToOpen){
      this.recentFavourites = plToOpen
      let res = await firstValueFrom(this.client.post(Routes.Spotify.AddUserFavourites, {"playlist":plToOpen,"favourites":true }, {headers:{"middle-man":"true", "login":login.toString()}})).then(
        (response:any)=>{
          return {success:true, playlist:response.playlist}
        },
        (error)=>{
          return {success:false, playlist:null}
        }
      )
      response = res
    }
    return response
  }

  // SetGenerationLimits(userlimit:number,applimit:number) {
  //   if(!this.personal){
  //     localStorage.setItem('user_limit', userlimit.toString())
  //     localStorage.setItem('app_limit', applimit.toString())
  //   }
  //   else{
  //     sessionStorage.setItem('user_limit', userlimit.toString())
  //     sessionStorage.setItem('app_limit', applimit.toString())
  //   }
  // }
  // get user_limit() {
  //   if(!this.personal) return +(localStorage.getItem('user_limit')??"unknown")
  //   return +(sessionStorage.getItem('user_limit')??"unknown")
  // }
  // get app_limit() {
  //   if(!this.personal) return +(localStorage.getItem('app_limit')??"unknown")
  //   return +(sessionStorage.getItem('app_limit')??"unknown")
  // }
  get popularityPreference() {
    return this.popPref
  }
  set popularityPreference(value:boolean) {
    this.popPref = value
  }
  get newArtistsOnly() {
    return this.newArtists
  }
  set newArtistsOnly(value:boolean) {
    this.newArtists = value
  }
  get newAlbumsOnly() {
    return this.newAlbums
  }
  set newAlbumsOnly(value:boolean) {
    this.newAlbums = value
  }

  get noDuplicateArtists() {
    return this._noDuplicateArtists
  }
  set noDuplicateArtists(value:boolean) {
    this._noDuplicateArtists = value
  }
  get noDuplicateAlbums() {
    return this._noDuplicateAlbums
  }
  set noDuplicateAlbums(value:boolean) {
    this._noDuplicateAlbums = value
  }
  public get onMobile(): boolean {
    return window.innerWidth < 576
  }
  get savedTracks():SavedTrack[] {
    if (this.personal){
      return JSON.parse(sessionStorage.getItem('saved-tracks')!)
    }
    else if(!this.personal){
      return JSON.parse(localStorage.getItem('saved-tracks')!)
    }
    return []
  }
  set savedTracks(value:SavedTrack[]) {
    if(this.personal){
      sessionStorage.setItem('saved-tracks', JSON.stringify(value))
    }
    else{
      localStorage.setItem('saved-tracks', JSON.stringify(value))
    }
  }

  addToSaved(tracks:SavedTrack[]) {
    if(tracks.length == 0) return
    let toAdd = tracks.map(t => {t["favourite"] = true; return t})
    let toAddIds = toAdd.map(t => t.id)
    this.client.put<SavedTrack[]>(Routes.Spotify.AddTrackToSaved,{"tracks":this.personal?toAddIds:toAdd}).subscribe(
      (success) => {
          localStorage.setItem('saved-tracks', JSON.stringify(success))
      }
    )
  }

  removeFromSaved(tracks:SavedTrack[]) {
    if(tracks.length == 0) return
    let toRemoveIds = tracks.map(t => t?.id)    
    this.client.put<SavedTrack[]>(Routes.Spotify.RemoveTrackFromSaved,{"tracks":toRemoveIds}).subscribe(
      (success ) => {
        localStorage.setItem('saved-tracks', JSON.stringify(success))
      }
    )
  }
  public get personal (): boolean {
    return localStorage.getItem('personal')=="true"
  }
  async Authenticate() {
  return await firstValueFrom( this.client.get<InitAuthResponse>(Routes.Spotify.Authenticate)).then(async(success: InitAuthResponse) => {
        sessionStorage.setItem('temp_token', success['temp-token']);
        window.location.href = success.url
        return true
      },
      async (error) => {
        if(error.status==422){
          if(!error.error['personal']){
            localStorage.removeItem('personal')
            localStorage.setItem('personal', error.personal)
            if(error.error['active']){
              if(error.error['user']) {
                let user:SpotifyUser = error.error['user']
                this.SetUser(user) 
                localStorage.setItem('spotify_user_id', user.id)
              }
              await this.SetSavedTracks()
              this.authenticated = true

            }
            else{
              this.authenticated = false
            }
            return null
          }
        }
        if(error.status == 444) {
          this.logout()
        }
        this.authenticated = false
        return false
      }
    )
  }
  async PublicLogin(){
    let res = await firstValueFrom(this.client.get<any>(Routes.Spotify.PublicLogin, {headers: { 'username':this.publicUsername,'password':this.publicPassword}})).then(
      (success) => {
        localStorage.setItem('personal', 'false')
        localStorage.setItem('spotify_user_id', success.user["id"])
        localStorage.setItem('user_token',success["user_token"])
        this.client.get<SpotifyUser>(Routes.Spotify.GetUser).subscribe(async (success:any) => {
          let user:SpotifyUser = success
          this.SetUser(user) 
          await this.SetSavedTracks()
          this.authenticated = true
        })
        return true
      },
      (error) => {
        this.authenticated = false
        return false
      }
    )
    return res
  }
  logout(){
    if(this.personal){
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
      sessionStorage.removeItem('access_token_expires_at')
      sessionStorage.removeItem('refresh_token_expires_at')
      sessionStorage.removeItem('spotify_user_id')
      sessionStorage.removeItem('saved-tracks')
      sessionStorage.removeItem('last-added-track')
    }
    else{
      localStorage.removeItem('personal')
      localStorage.removeItem('spotify_user_id')
      localStorage.removeItem('user_token')
      // localStorage.removeItem('user_limit')
      // localStorage.removeItem('app_limit')
      localStorage.removeItem('saved-tracks')
      localStorage.removeItem('last-added-track')
    }

    this.authenticated = false
  }
  Logout() {
    console.log("Logging out...")
    this.client.get(Routes.Spotify.Logout).subscribe(
      (): void => {
        if(this.personal){
          sessionStorage.removeItem('access_token')
          sessionStorage.removeItem('refresh_token')
          sessionStorage.removeItem('access_token_expires_at')
          sessionStorage.removeItem('refresh_token_expires_at')
          sessionStorage.removeItem('spotify_user_id')
          sessionStorage.removeItem('saved-tracks')
          sessionStorage.removeItem('last-added-track')
        }
        else{
          localStorage.removeItem('personal')
          localStorage.removeItem('spotify_user_id')
          localStorage.removeItem('user_token')
          // localStorage.removeItem('user_limit')
          // localStorage.removeItem('app_limit')
          localStorage.removeItem('saved-tracks')
          localStorage.removeItem('last-added-track')
        }
        this.authenticated = false
        console.log("logged out")
      },
      (error) => {
        console.log("Error logout: ",error)
      }
    )
  }

  SetUser(user:SpotifyUser) {
    user = user
    this.authenticatedUser = user
    this.user_id = user.id
    if(this.authenticatedUser.images.length > 0) {
      this.avatar_img = user.images[0].url
    }
    this.avatar_lbl = user.display_name
  }

  async SetSavedTracks() {
    this.loadingSaved = true;
    this.progressService.newDataEvent.subscribe((data) => {
      this.loadingSavedMessage = data.message
      this.loadingSavedProgress = data.progress
      if(data.response){
        console.log("Saved tracks response: ",data.response)
        let userTracks = data.response.userTracks
        let lastAdded = data.response.lastAdded
        if (lastAdded) {
          localStorage.removeItem('last-added-track');
          localStorage.setItem('last-added-track', lastAdded.toString());
        }
    
        if (userTracks) {
          localStorage.removeItem('saved-tracks');
          localStorage.setItem('saved-tracks', JSON.stringify(userTracks));
        }
        this.savedTracksFinished.emit(true);
        this.progressService.stop();
        this.loadingSaved = false;
      }
    })
    this.progressService.startProcess(localStorage.getItem('spotify_user_id')!, localStorage.getItem('user_token')!);
  
    console.log("Setting saved tracks...");
    
    try {
      // Send a POST request to initiate the backend processing
      await firstValueFrom(this.client.post<any>(Routes.Spotify.PrepPlaylists, {}));
      // Notify that the process is complete
    } catch (error) {
      console.log("Error prepping playlists:", error);
  
      // Emit failure event
      this.savedTracksFinished.emit(false);
    } finally {
      // Ensure loading state is updated regardless of success or failure
      this.loadingSaved = false;
    }
  }

  SetTokens(code:string,state:string) {
    console.log("Setting tokens...")
    let tempToken = sessionStorage.getItem('temp_token')
    this.client.get<TokenResponse>(Routes.Spotify.CheckCode, {
      responseType: 'json',
      params: { code: code, state: state, "temp-token": tempToken??"" }
    }).subscribe(
      (response: TokenResponse) => {
      console.log("Token response: ",response)

      const accessToken = response.access_token;
      const refreshToken = response.refresh_token;
      const accessTokenExpiresAt = response.expires_in
      const refreshTokenExpiresAt = response.expires_in + 3600 * 1000 * 24;
      sessionStorage.setItem('access_token', accessToken);
      sessionStorage.setItem('refresh_token', refreshToken);
      sessionStorage.setItem('access_token_expires_at', accessTokenExpiresAt.toString());
      sessionStorage.setItem('refresh_token_expires_at', refreshTokenExpiresAt.toString());
      
      this.SetUser(response.user)
      // this.SetGenerationLimits( response.user_limit, response.app_limit)
      sessionStorage.removeItem('spotify_user_id')
      sessionStorage.setItem('spotify_user_id', this.user_id);
      this.SetSavedTracks()
      this.authenticated = true
      return true
    },
      (error) => {
        console.error(error);
        this.authenticated = false
        return false
      }
    )
    sessionStorage.removeItem('temp_token')
  }
}
