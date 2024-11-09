import { RouterOutlet } from '@angular/router';
import { Component, Renderer2 } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { MenubarComponent } from '../menubar/menubar.component';
import { ImportsModule } from './imports';
import { SpotifyAuthService } from '../spotify-interface/auth/spotify-auth.service';
import { ThemeService } from '../services/theme.service';
import { InputSwitchChangeEvent } from 'primeng/inputswitch';
import { LocalizationService } from '../services/localization.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImportsModule, 
    MenubarComponent,
    TranslateModule
  ], 
  providers: [
    SpotifyAuthService, ThemeService, LocalizationService
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  showInfo = false;
  showSettings = false
  constructor(private primengConfig: PrimeNGConfig,private translateService: TranslateService,
    private themeService: ThemeService,public authService:SpotifyAuthService
  ) {
    this.toggleTheme(true);
  }

  ngOnInit() {

    this.translateService.setDefaultLang(window.navigator.language);
    this.primengConfig.ripple = true;
    this.primengConfig.zIndex = {
    }
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode;
  }
  get newArtists(): boolean {
    return this.authService.newArtistsOnly;
  }
  set newArtists(value:boolean) {
    this.authService.newArtistsOnly = value
  }
  get newAlbums(): boolean {
    return this.authService.newAlbumsOnly;
  }
  set newAlbums(value:boolean) {
    this.authService.newAlbumsOnly = value
  }

  get noDuplicateArtists(): boolean {
    return this.authService.noDuplicateArtists;
  }

  set noDuplicateArtists(value:boolean) {
    this.authService.noDuplicateArtists = value
  }

  get noDuplicateAlbums(): boolean {
    return this.authService.noDuplicateAlbums;
  }

  set noDuplicateAlbums(value:boolean) {  
    this.authService.noDuplicateAlbums = value
  }

  get popPref(): boolean {
    return this.authService.popularityPreference;
  }
  set popPref(value:boolean) {
    this.authService.popularityPreference = value
  }

  toggleTheme(event: InputSwitchChangeEvent|boolean) {
    let darkMode = false;
    if((event as boolean)==true){
      darkMode = true;
    }
    else if((event as boolean)==false){
      darkMode = false;
    }
    else{
      darkMode = ((event as InputSwitchChangeEvent).checked);
    }
    const theme = darkMode ? 'theme-dark' : 'theme-light';

    // Call the theme switch function with the correct theme
    this.themeService.switchTheme(theme);
  }
  togglePopPref(event: InputSwitchChangeEvent|boolean) {
    if((event as boolean)==true){
      this.popPref = true;
    }
    else if((event as boolean)==false){
      this.popPref = false;
    }
    else{
      this.popPref = ((event as InputSwitchChangeEvent).checked);
    }
  }
  toggleNewArtists(event: InputSwitchChangeEvent|boolean) {
    if((event as boolean)==true){
      this.newArtists = true
    }
    else if((event as boolean)==false){
      this.newArtists = false
    }
    else{
      this.newArtists = ((event as InputSwitchChangeEvent).checked);
    }
  }
  toggleNewAlbums(event: InputSwitchChangeEvent|boolean) {
    if((event as boolean)==true){
      this.newAlbums = true
    }
    else if((event as boolean)==false){
      this.newAlbums = false
    }
    else{
      this.newAlbums = ((event as InputSwitchChangeEvent).checked);
    }
  }

  toggleNoDuplicateArtists(event: InputSwitchChangeEvent|boolean) {
    if((event as boolean)==true){
      this.noDuplicateArtists = true
    }
    else if((event as boolean)==false){
      this.noDuplicateArtists = false
    }
    else{
      this.noDuplicateArtists = ((event as InputSwitchChangeEvent).checked);
    }
  }

  toggleNoDuplicateAlbums(event: InputSwitchChangeEvent|boolean) {
    if((event as boolean)==true){
      this.noDuplicateAlbums = true
    }
    else if((event as boolean)==false){
      this.noDuplicateAlbums = false
    }
    else{
      this.noDuplicateAlbums = ((event as InputSwitchChangeEvent).checked);
    }
  }
  translate(lang: string) {
    this.translateService.use(lang);
    this.translateService.get('primeng').subscribe(res => this.primengConfig.setTranslation(res));
  }
  isSystemDark(): boolean {
    return window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches;
  }
  openSettings(){
    this.showSettings = !this.showSettings
  }
  title = 'spotify-client';
}
