import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Playlist, SavedTrack, Track } from '../interfaces/spotify';

@Injectable({
  providedIn: 'root', // or specify it in the providers array of your module
})
export class ThemeService {
  private renderer: Renderer2;
  private darkMode:boolean = false
  public get isDarkMode(): boolean {
    return this.darkMode
  }


  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  switchTheme(theme: 'theme-dark' | 'theme-light') {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if(theme=='theme-dark'){
      this.darkMode = true
    }
    else if(theme=='theme-light'){
      this.darkMode = false
    }
    if (themeLink) {
      // Construct the correct path to the theme file
      themeLink.href = `${theme}.css`;

      // Optional: You can log to see which file is being applied
      console.log('Theme switched to:', themeLink.href);
    } else {
      console.error('Theme link element not found!');
    }
  }
  getPopularityText(item: SavedTrack): string{
    if(!item){return ''}
    let popularity = item.popularity == 0 ? 'Popularity not available'
    : item.popularity == 0 && item.available_markets>0 || item.popularity < 5 ? 'Ultra Arcane' 
    : item.popularity < 10 ? 'Arcane' 
    : item.popularity < 20 ? 'Obscure' : item.popularity < 30 ? 'Pretty Obscure' 
    : item.popularity < 40 ? 'Slightly Obscure' : item.popularity < 50 ? 'Pretty Normal'
    : item.popularity < 60 ? 'Normal' : item.popularity < 70 ? 'Quite Popular'
    : item.popularity < 75 ? 'Popular' : item.popularity < 90 ? 'Very Popular' : 'Quintessential Normie'
    return popularity
  }
  getPopularityColor(item: SavedTrack): string{
    if(!item){return ''}
    let colour = item.popularity == 0 ? 'text-grey-'+this.getShade(200) : item.popularity < 5 ? 
    'text-purple-'+this.getShade(600) : item.popularity < 10 ? 
    'text-purple-'+this.getShade(500) : item.popularity < 20 
    ? 'text-purple-'+this.getShade(300) : item.popularity < 30 ?
    'text-purple-'+this.getShade(100) :  item.popularity < 50 ?
    'text-blue-'+this.getShade(600) : item.popularity < 75 ?
    'text-blue-'+this.getShade(400) : item.popularity < 90 ? 
    'text-blue-'+this.getShade(200): 'text-blue-'+this.getShade(100)
    return colour
  }
  getShade(shade:number){
    if(!this.isDarkMode){
      return shade + 400>800 ? 800 : shade + 400
    }
    return shade
  }
}


