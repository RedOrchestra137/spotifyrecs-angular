  import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { Routes } from '../../../routes';
import { InitAuthResponse, TokenResponse } from '../response objects/TokenResponse';
import { SpotifyUser } from '../response objects/UserResponse';
import { SavedTracksResponse, Track, TrackView } from '../../interfaces/spotify';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
@Injectable({
  providedIn: 'root'
})

export class SpotifyAuthService implements OnInit {

  savedTracksFinished:EventEmitter<boolean> = new EventEmitter()

  authenticated:boolean = false
  consentGranted:boolean = false
  authenticatedUser:SpotifyUser | null = null
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

  constructor(private client:HttpClient) {
  }

  ngOnInit(): void {
  }

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

  SetGenerationLimits(userlimit:number,applimit:number) {
    if(!this.personal){
      localStorage.setItem('user_limit', userlimit.toString())
      localStorage.setItem('app_limit', applimit.toString())
    }
    else{
      sessionStorage.setItem('user_limit', userlimit.toString())
      sessionStorage.setItem('app_limit', applimit.toString())
    }
  }
  get user_limit() {
    if(!this.personal) return +(localStorage.getItem('user_limit')??"unknown")
    return +(sessionStorage.getItem('user_limit')??"unknown")
  }
  get app_limit() {
    if(!this.personal) return +(localStorage.getItem('app_limit')??"unknown")
    return +(sessionStorage.getItem('app_limit')??"unknown")
  }
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
  get savedTracks():TrackView[] {
    if(!sessionStorage.getItem('saved-tracks') && !this.loadingSaved && this.personal){ 
      this.SetSavedTracks()
    }
    else if (this.personal){
      return JSON.parse(sessionStorage.getItem('saved-tracks')!)
    }
    else if(!this.personal){
      return JSON.parse(localStorage.getItem('saved-tracks')!)
    }
    return []
  }
  set savedTracks(value:TrackView[]) {
    if(this.personal){
      sessionStorage.setItem('saved-tracks', JSON.stringify(value))
    }
    else{
      localStorage.setItem('saved-tracks', JSON.stringify(value))
    }
  }

  ToTrackView(track:Track):TrackView {
    return {
      added_at: track.added_at!,
      id: track.track!.id,
      artist_ids: track.track!.artists.map(a => a.id),
      album_id: track.track!.album.id,
      youtube_url: ""
    }
  }

  addToSaved(tracks:Track[]) {
    if(tracks.length == 0) return
    let toAdd = tracks.map(t => this.ToTrackView(t))
    let toAddIds = toAdd.map(t => t.id)
    this.client.put<boolean>(Routes.Spotify.AddTrackToSaved,{"tracks":this.personal?toAddIds:toAdd}).subscribe(
      (success) => {
        if(success && this.personal) {
          let toSave = [...this.savedTracks]
          toSave.push(...toAdd)
          sessionStorage.setItem('saved-tracks', JSON.stringify(toSave))
        }
        else if(success && !this.personal) {
          let saved = this.savedTracks
          saved.push(...toAdd)
          localStorage.setItem('saved-tracks', JSON.stringify(saved))
        }
      }
    )
  }

  removeFromSaved(tracks:Track[]) {
    if(tracks.length == 0) return
    let toRemoveIds = tracks.map(t => t.track?.id)    
    this.client.put<boolean>(Routes.Spotify.RemoveTrackFromSaved,{"tracks":toRemoveIds}).subscribe(
      (success ) => {
        if(success && this.personal) {
          sessionStorage.setItem('saved-tracks', JSON.stringify(this.savedTracks.filter(t => !toRemoveIds.includes(t.id))))
        }
        else if(success && !this.personal) {
          let saved = this.savedTracks
          saved = saved.filter(t => !toRemoveIds.includes(t.id))
          localStorage.setItem('saved-tracks', JSON.stringify(saved))
        }
      }
    )
  }
  public get personal (): boolean {
    return localStorage.getItem('personal')=="true"
  }
  async Authenticate() {
  return await firstValueFrom( this.client.get<InitAuthResponse>(Routes.Spotify.Authenticate)).then(async(success: InitAuthResponse) => {
        sessionStorage.setItem('tempToken', success.tempToken);
        window.location.href = success.url
        return true
      },
      async (error) => {
        if(error.status==422){
          if(!error.error['personal']){
            localStorage.removeItem('personal')
            localStorage.setItem('personal', error.personal)
            if(error.error['active']){
              await this.SetSavedTracks()
              this.authenticated = true
              if(error.error['user']) {
                let user:SpotifyUser = error.error['user']
                this.SetUser(user) 
                localStorage.setItem('spotify_user_id', user.id)
              }
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
          this.SetGenerationLimits( success["user_limit"], success["app_limit"])
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
      localStorage.removeItem('user_limit')
      localStorage.removeItem('app_limit')
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
          localStorage.removeItem('user_limit')
          localStorage.removeItem('app_limit')
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
      user = user as SpotifyUser
      this.authenticatedUser = user
      this.user_id = user.id
      if(this.authenticatedUser.images.length > 0) {
        this.avatar_img = user.images[0].url
      }
      this.avatar_lbl = user.display_name
  }

  async SetSavedTracks() {
    this.loadingSaved = true
    if(!this.personal){
      await firstValueFrom(this.client.post(Routes.Spotify.PrepPlaylists,{})).then(
        (success:any) => {
          let lastAdded = success['lastAdded']
          let userTracks = success['userTracks']
          if(lastAdded){
            localStorage.removeItem('last-added-track')
            localStorage.setItem('last-added-track', lastAdded.toString())
          }
          if(userTracks){
            localStorage.removeItem('saved-tracks')
            localStorage.setItem('saved-tracks', JSON.stringify(userTracks))
          }
          this.savedTracksFinished.emit(true)
        },
        (error) => {
          console.log(error)
          this.savedTracksFinished.emit(false)
        }
      )
      this.loadingSaved = false
      return
    }
    this.client.post<SavedTracksResponse>(Routes.Spotify.GetSavedTracks,{}).subscribe((response)=>{
      sessionStorage.removeItem('saved-tracks')
      sessionStorage.setItem('saved-tracks', JSON.stringify(response.savedTracks))
      sessionStorage.removeItem('last-added-track')
      sessionStorage.setItem('last-added-track', response.lastAdded.toString())
      this.loadingSaved = false
    })
  }

  SetTokens(code:string,state:string) {
    console.log("Setting tokens...")
    let tempToken = sessionStorage.getItem('tempToken')
    this.client.get<TokenResponse>(Routes.Spotify.CheckCode, {
      responseType: 'json',
      params: { code: code, state: state, tempToken: tempToken??"" }
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
      this.SetGenerationLimits( response.user_limit, response.app_limit)
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
    sessionStorage.removeItem('tempToken')
  }
}
