import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Playlist, Track } from '../interfaces/spotify';

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
  getPopularityText(item: Track): string{
    if(!item.track){return ''}
    let popularity = item.track.popularity == 0 ? 'Popularity not available'
    : item.track.popularity == 0 && item.track.available_markets.length>0 || item.track.popularity < 5 ? 'Ultra Arcane' 
    : item.track.popularity < 10 ? 'Arcane' 
    : item.track.popularity < 20 ? 'Obscure' : item.track.popularity < 30 ? 'Pretty Obscure' 
    : item.track.popularity < 40 ? 'Slightly Obscure' : item.track.popularity < 50 ? 'Pretty Normal'
    : item.track.popularity < 60 ? 'Normal' : item.track.popularity < 70 ? 'Quite Popular'
    : item.track.popularity < 75 ? 'Popular' : item.track.popularity < 90 ? 'Very Popular' : 'Quintessential Normie'
    return popularity
  }
  getPopularityColor(item: Track): string{
    if(!item.track){return ''}
    let colour = item.track.popularity == 0 ? 'text-grey-'+this.getShade(200) : item.track.popularity < 5 ? 
    'text-purple-'+this.getShade(600) : item.track.popularity < 10 ? 
    'text-purple-'+this.getShade(500) : item.track.popularity < 20 
    ? 'text-purple-'+this.getShade(300) : item.track.popularity < 30 ?
    'text-purple-'+this.getShade(100) :  item.track.popularity < 50 ?
    'text-blue-'+this.getShade(600) : item.track.popularity < 75 ?
    'text-blue-'+this.getShade(400) : item.track.popularity < 90 ? 
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


