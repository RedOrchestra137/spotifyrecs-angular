import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ImportsModule } from '../../../app/imports';
import { HttpClient } from '@angular/common/http';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';
import { Routes } from '../../../../routes';
import { Playlist } from '../../../interfaces/spotify';

@Component({
  selector: 'app-create-playlist',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './create-playlist.component.html',
  styleUrl: './create-playlist.component.css',
  providers: [
    SpotifyAuthService
  ]
})
export class CreatePlaylistComponent implements OnInit {
  playlistName:string = ""
  playlistDescription:string = ""
  @Output() _playlistCreated:EventEmitter<Playlist> = new EventEmitter<Playlist>()
  constructor(
    private _customClient:HttpClient, private authService:SpotifyAuthService
  ) 
  { 
  }

  ngOnInit(): void {
    
  }

  create(){
    let headers:any = {}
    if(!this.authService.personal){
      headers["middle-man"] = "true"
    }
    this._customClient.post<any>(Routes.Spotify.CreatePlaylist, {
      "name": this.playlistName,
      "description": this.playlistDescription
    }, {headers:headers}).subscribe((response)=>{this._playlistCreated.emit(response)},(error)=>{console.log(error);this._playlistCreated.emit(undefined)})
  }
}
