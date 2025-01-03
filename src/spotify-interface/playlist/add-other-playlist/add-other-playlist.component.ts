import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ImportsModule } from '../../../app/imports';
import { Playlist, PlaylistDetail, Track } from '../../../interfaces/spotify';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { Routes } from '../../../../routes';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';
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
  @ViewChild('newPlaylistDropdown') newPlaylistDropDown:ElementRef|undefined
  plComponent: PlaylistComponent|undefined;

  searchedPlaylists: Playlist[] = [];
  newPlaylist: Playlist|undefined;
  newPlaylistID:string = ""
  newPlaylists:Playlist[] = []
  newPLById = false
  loadingPlaylistById = false
  overlayWidth = 0
  typing = false
  typingIndex = 0
  lastsearched = ""
  filterValue = ""

  async triggerTyping() {
    while (true){
      if(this.typingIndex==5){
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
      this.typingIndex++
    }
    this.typingIndex = 0
    if(this.filterValue && this.filterValue.length > 0 && this.filterValue!=this.lastsearched){
      console.log("searching fort ", this.filterValue)
      this.lastsearched = this.filterValue
      await this._http.get<any>(Routes.Spotify.SearchPlaylists, {params:{
        'q':this.filterValue
      }}).subscribe((pL)=>{
        console.log("found ", pL)
        if(pL?.playlists){
          this.searchedPlaylists = pL?.playlists?.items.filter((p:any) => {return p?.id})
        }
      }, (err)=>{console.log(err)})
    }
    return 
  }

  public constructor(private _http: HttpClient,private authService:SpotifyAuthService, private messageService: MessageService) {

  }
  ngOnInit(plComponent: PlaylistComponent): void {
    if(plComponent){
      this.plComponent = plComponent
    }
    console.log('plComponent: ', this.plComponent)
    this.loopTyping()
    this.overlayWidth = this.newPlaylistDropDown?.nativeElement.offsetWidth
  }

  async loopTyping(){
    while(true){
      await this.triggerTyping()
    }
  }
  onSelectionChange(event: any) {
    this.addPlaylist()
  }
  removeFromNewPlaylists(id:string){
    this.newPlaylists = this.newPlaylists.filter(playlist => playlist.id !== id)
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
