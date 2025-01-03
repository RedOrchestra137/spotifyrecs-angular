import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Routes } from '../../../routes';
import { Playlist, PlaylistDetail, Track } from '../../interfaces/spotify';
import { ImportsModule } from '../../app/imports';
import { YoutubeComponent } from '../youtube/youtube.component';

@Component({
  selector: 'app-screener',
  standalone: true,
  imports: [ImportsModule, YoutubeComponent],
  templateUrl: './screener.component.html',
  styleUrl: './screener.component.css'
})
export class ScreenerComponent implements OnInit {
  @ViewChild(YoutubeComponent) ytComponent!:YoutubeComponent

  playlist:PlaylistDetail|undefined
  activeIndex:number = 0
  public get tracks(): Track[] {
    if (this.playlist?.tracks) {
        return this.playlist.tracks.items.map(item => Track.FromObject(item));
    }
    return [];
}
  public get currentTrack():Track|undefined{
    if(this.tracks.length-1 >= this.activeIndex){
      return this.tracks[this.activeIndex]
    }
    return undefined
  }

  onTrackChange(){
    if(this.currentTrack){
      this.ytComponent.onPlay()
    }
  }
  onYtInitialized(ytComponent:YoutubeComponent) {
    this.ytComponent = ytComponent
    this.ytComponent.screening = true
    this.ytComponent.tracks = this.tracks;
    this.ytComponent.playlistIndex = 0
    if(this.currentTrack){
      this.ytComponent.onPlay()
    }
  }
  getYoutubeHeader():string{
    if(this.ytComponent){
      return this.ytComponent.getYoutubeHeader()
    }
    return ""
  }
  public constructor( private http:HttpClient) 
  { 

  }
  ngOnInit(): void {
    this.http.get<PlaylistDetail>(Routes.Spotify.GetPlaylist("1EhTEPtsiuhU0kD8I59CHb")).subscribe((response)=>{this.playlist = response; })
  }
}
