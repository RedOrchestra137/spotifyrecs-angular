import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ImportsModule } from '../../../app/imports';
import { HttpClient } from '@angular/common/http';
import { SpotifyAuthService } from '../../auth/spotify-auth.service';
import { Routes } from '../../../../routes';

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
  @Output() _playlistCreated:EventEmitter<boolean> = new EventEmitter<boolean>()
  constructor(
    private _customClient:HttpClient, private authService:SpotifyAuthService
  ) 
  { 
  }

  ngOnInit(): void {
    
  }

  create(){
    this._customClient.post<any>(Routes.Spotify.CreatePlaylist, {
      "name": this.playlistName,
      "description": this.playlistDescription
    }).subscribe((response)=>{this._playlistCreated.emit(true)},(error)=>{console.log(error);this._playlistCreated.emit(false)})
  }
}
