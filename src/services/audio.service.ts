import { Injectable } from '@angular/core';
import { Dictionary, SavedTrack } from '../interfaces/spotify';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  shuffled:boolean = false
  playlistIndex: number = 0
  playing:boolean = false
  currentTimeDict:Dictionary<number> = {}
  ogTracks: SavedTrack[] = []
  shuffledTracks: SavedTrack[] = []

  youtubeUrl:string = ""
  public get spotifyUrl():string{
    return this.currentTrack?.spotify_url??""
  }

  public get currentTrack():SavedTrack|null{
    return this.tracks[this.playlistIndex]??null
  }
  public get duration():number{
    return this.currentTrack?.track_length??0
  }
  public get tracks(): SavedTrack[]{
    return this.shuffled? this.shuffledTracks : this.ogTracks
  }
  public set tracks(value: SavedTrack[]){
    this.ogTracks = value
    this.playlistIndex = this.ogTracks.length>3?3:this.ogTracks.length-1
  }

  shuffle(){
    this.shuffled = !this.shuffled
    this.shuffledTracks = Array.from(this.ogTracks.sort(() => Math.random() - 0.5)).filter(x=>x?.id!=this.currentTrack?.id)
    this.playlistIndex = 0
  }
  constructor() { }
  
}
