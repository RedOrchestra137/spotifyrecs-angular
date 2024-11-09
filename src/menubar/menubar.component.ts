import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ImportsModule } from '../app/imports';
import { SpotifyAuthService } from '../spotify-interface/auth/spotify-auth.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ThemeService } from '../services/theme.service';


@Component({
  selector: 'app-menubar',
  standalone: true,
  providers: [],
  imports: [MenubarModule, ImportsModule],
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.css'
})
export class MenubarComponent implements OnInit{
  @ViewChild('op') overlayPanel!: OverlayPanel;
  @Output() toggleSettings = new EventEmitter<boolean>();
  preferencesVisible = false
  aboutVisible = false
  items: MenuItem[] | undefined;
  toggleOverlay(event: Event) {
    this.overlayPanel.toggle(event);
  }
  constructor(private _spotifyAuth:SpotifyAuthService, private route:ActivatedRoute,private router:Router, private themeService:ThemeService) { 
    
  }

  ngOnInit() {
      this.items = [
          {
              label: 'Spotify Discover Anytime',
              icon: 'pi pi-headphones',
              url: 'https://www.primefaces.org/primeng/',
              route: '/spotify'

          }
      ]
      if(this._spotifyAuth.checkTokens()){
        console.log("Token ok")
      }
      else{
        console.log("No token")
        this.route.queryParamMap.pipe(
          map((params) => ({
            code: params.get('code') ?? '',
            state: params.get('state') ?? ''
          }))
          ).subscribe(async (result) => {
          if (result.code && result.state) {
            console.log("Code and state ok")
            await this._spotifyAuth.SetTokens(result.code, result.state);
          }
        })
    }
  }
  public get isAuthenticated (): boolean {
    return this._spotifyAuth.authenticated
  }
  public get onMobile (): boolean {
    return window.innerWidth < 768
  }
  public get avatarImg (): string {
    return this._spotifyAuth.avatar_img
  }
  public get avatarLbl (): string {
    if(!this._spotifyAuth.avatar_img) return this._spotifyAuth.avatar_lbl
    return ""
  }
  public get username (): string {
    return this._spotifyAuth.authenticatedUser?.display_name??""
  }
  public get darkMode (): boolean {
    if(!this.themeService.isDarkMode) return false
    return this.themeService.isDarkMode
  }
  public get newAlbums (): boolean {
    return this._spotifyAuth.newAlbumsOnly
  }
  public get newArtists (): boolean {
    return this._spotifyAuth.newArtistsOnly
  }
  public get popPref (): boolean {
    return this._spotifyAuth.popularityPreference
  }
  public get imgSourceArtists(){
    return this._spotifyAuth.newArtistsOnly?"https://firebasestorage.googleapis.com/v0/b/lebai-c181c.appspot.com/o/conceptualization.jpg?alt=media&token=a21c3cc0-4eea-40e5-b76e-6ae50d1336d7":"https://firebasestorage.googleapis.com/v0/b/lebai-c181c.appspot.com/o/conceptualization_grey.png?alt=media&token=46e90931-a0fc-4819-9422-0f765afe2bc3"
  }
  public get imgSourceAlbums(){
    return this._spotifyAuth.newAlbumsOnly?"https://firebasestorage.googleapis.com/v0/b/lebai-c181c.appspot.com/o/inlandempire.jpg?alt=media&token=3f95add5-fe7a-4267-9db7-a3ad7427404c"
    :"https://firebasestorage.googleapis.com/v0/b/lebai-c181c.appspot.com/o/inlandempire_grey.png?alt=media&token=a01a265a-b09b-4cfa-ae4e-5a03a1f1da52"
  }
  public get imgSourcePopularity(){
    return this._spotifyAuth.popularityPreference?"https://firebasestorage.googleapis.com/v0/b/lebai-c181c.appspot.com/o/esprit-de-corps-obs.png?alt=media&token=d83c43cb-49b6-48c0-985e-01a4a5d09868":
    "https://firebasestorage.googleapis.com/v0/b/lebai-c181c.appspot.com/o/esprit-de-corps-pop.png?alt=media&token=a6ece7c8-f721-4bdc-9d06-e3cff9f73d2d6"
  }
  openSettings(){
    this.toggleSettings.emit(true)
  }
  Login(){
    this._spotifyAuth.Authenticate()
  }
  Logout(){
    this._spotifyAuth.Logout()
  }
  toHome(){
    this.router.navigate(['/home'])
  }
  openAbout(){
    this.aboutVisible = true
  }

  toggleArtists() {
    this._spotifyAuth.newArtistsOnly = !this._spotifyAuth.newArtistsOnly
  }
  toggleAlbums() {
    this._spotifyAuth.newAlbumsOnly = !this._spotifyAuth.newAlbumsOnly
  }
  togglePopularity() {
    this._spotifyAuth.popularityPreference = !this._spotifyAuth.popularityPreference
  }

  urlRef = "/noroute"

}