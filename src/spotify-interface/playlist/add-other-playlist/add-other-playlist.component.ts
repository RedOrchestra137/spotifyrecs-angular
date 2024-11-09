import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ImportsModule } from '../../../app/imports';
import { Playlist, PlaylistDetail, Track } from '../../../interfaces/spotify';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { Routes } from '../../../../routes';
import { SpotifyAuthService } from '../../auth/spotify-auth.service';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { PlaylistComponent } from '../playlist.component';


@Component({
  selector: 'app-add-other-playlist',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './add-other-playlist.component.html',
  styleUrl: './add-other-playlist.component.css'
})
export class AddOtherPlaylistComponent {
  @Output() addedOtherPlaylists:EventEmitter<Playlist[]> = new EventEmitter<Playlist[]>();
  plComponent: PlaylistComponent|undefined;

  searchedPlaylists: Playlist[] = [];
  newPlaylist: Playlist|undefined;
  newPlaylistID:string = ""
  newPlaylists:Playlist[] = []
  newPLById = false
  loadingPlaylistById = false

  public constructor(private _http: HttpClient,private authService:SpotifyAuthService, private messageService: MessageService) {

  }
  ngOnInit(plComponent: PlaylistComponent): void {
    this.plComponent = plComponent
    console.log('plComponent: ', this.plComponent)
  }
  onSelectionChange(event: any) {
    this.addPlaylist()
  }
  removeFromNewPlaylists(id:string){
    this.newPlaylists = this.newPlaylists.filter(playlist => playlist.id !== id)
  }
  async searchPlaylists(event: DropdownFilterEvent){
    const query = event.filter; // Get the filter value
    this._http.get<any>(Routes.Spotify.SearchPlaylists,{params: {'q': query}}).subscribe((playlists: any) => {
      this.searchedPlaylists = playlists["playlists"].items.filter((playlist: Playlist) => playlist.owner.id !== this.authService.user_id); // Update the array
      
    }, error => {
      console.error('Error fetching playlists:', error);        
      this.searchedPlaylists = []; // Fallback to empty array on error
    });
  }
  onNewPLIDChange(event: string){
    this.newPlaylistID = event
    if(this.newPlaylistID.length == 22){
      this.loadingPlaylistById = true
        this._http.get<PlaylistDetail>(Routes.Spotify.GetPlaylist(this.newPlaylistID)).subscribe((response) => {
          this.newPlaylist = response
          this.newPLById = true
          this.loadingPlaylistById = false
          if(!response.tracks){
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Could not find playlist" });
            this.newPlaylist = undefined
            this.loadingPlaylistById = false
          }
        }, (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
          this.loadingPlaylistById = false
        })
    }
  }
  addPlaylist(){
    if(this.newPlaylist != null && !this.newPlaylists.includes(this.newPlaylist)){
      this.newPlaylists.push(this.newPlaylist)
    }
    this.newPlaylistID = ""
    this.newPLById = false
  }
  getImage(playlist:Playlist|undefined){
    if(playlist == undefined){
      return ""
    }
    if(playlist.images?.length > 0){
      return playlist.images[0].url
    }
    return ""
  }
  async addNewPlaylists(){
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Playlists added' });
      this.addedOtherPlaylists.emit(this.newPlaylists)
      this.newPlaylists = []
  }
  clearNewPlaylists(){
    this.newPlaylists = []
  }
}
