import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';
import { Routes } from '../../../../routes';
import { ImportsModule } from '../../../app/imports';
import { Dictionary, Playlist, PlaylistDetail, PublicPlaylist, SavedTrack, Track, TrackView } from '../../../interfaces/spotify';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafePipe } from '../../../app/pipe';
import { MessageService } from 'primeng/api';
import { ThemeService } from '../../../services/theme.service';
export interface startPlaylistModeEvent{
  tracks: Array<Track>
}
@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [ImportsModule, SafePipe ],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.css'
})

export class PlaylistDetailComponent implements OnInit {
  @Input('playlistId') playlistId: string = '';
  @Output('playingTrack') playingTrack = new EventEmitter<SavedTrack>();
  @Output('startingPlaylistMode') startingPlaylistMode = new EventEmitter<startPlaylistModeEvent>();
  @ViewChild('trackList', { static: false }) trackList!: ElementRef;
  playlist!: PublicPlaylist;
  
  ogTracks: Array<SavedTrack> = [];
  shuffledTracks: Array<SavedTrack> = [];
  _loading: boolean = false;
  filterTracks: Array<SavedTrack> = [];
  sortOrder: number = -1;
  sortField: any = 'popularity';
  sortKey: any = 'popularity';
  ascendingSort: boolean = false;
  shuffled: boolean = false;
  playingTrackId: string = '';
  preLoadingYoutube: boolean = false;
  sortOptions: any[] = [
    { label: 'Name', value: 'name' },
    { label: 'Popularity', value: 'popularity' }
  ]
  lastSelected:number = -1
  selected:Dictionary<boolean> = {};
  audioUrl:string = "";
  private isShiftPressed = false;
  youtubeEquivalent:string = "";

  constructor(private route: ActivatedRoute, private _customClient:HttpClient,private sanitizer: DomSanitizer
    ,private _spotifyAuth:SpotifyAuthService,
    private messageService: MessageService,
    public themeService: ThemeService) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Shift') {
        this.isShiftPressed = true;
      }
    });
  
    // Add an event listener to the document to reset the flag when a key is released
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Shift') {
        this.isShiftPressed = false;      
      }
    });

  }

  public get tracks(): Array<SavedTrack>{
    let sort:string[] = (this.sortField as string).split('.')

    if(this.shuffled){
      return this.shuffledTracks
      .filter(track => track?.['track_name'].toLowerCase().includes(this.filterValue.toLowerCase()))
    }
    return this.ogTracks
    .filter(track => track?.['track_name'].toLowerCase().includes(this.filterValue.toLowerCase()))
    .sort(
      (a,b)=>{
        let aVal:any = a
        let bVal:any = b
        for (let i = 0; i < sort.length; i++) {
          aVal = aVal[sort[i]]
          bVal = bVal[sort[i]]
        }
        if(typeof aVal == "string"){
          if(this.sortOrder == -1){
            return bVal.localeCompare(aVal)
          }
          return aVal.localeCompare(bVal)
        }
        else if (typeof aVal == "number"){
          if(this.sortOrder == -1){
            return bVal - aVal
          }
          return aVal - bVal
        }
        else{
          return 0
        }
      }
    )
  }
  public set tracks(value: Array<SavedTrack>){
    this.ogTracks = value
  }
  public get onMobile(): boolean{
    
    return window.innerWidth < 768
  }
  public get hasSelected(): boolean{
    return Object.values(this.selected).filter(x => x==true).length > 0
  }
  public get selectedTracks(): Array<SavedTrack>{
    return this.tracks.filter(x => x && this.selected[x.id])
  }
  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.trackList && !this.trackList.nativeElement.contains(event.target)) {
      // This will be triggered if the click happens outside the list template
      this.deselectAll();
    }
  }
  previewTrack(track: SavedTrack) {
    if(!track){return}
    if(this.playingTrackId != track.id){
      this.playingTrackId = track.id!;
      this.getYoutubePreview(track);    }
    else{
      this.playingTrackId = '';
    }
  }
  getYoutubePreview(track: SavedTrack){
    if(!track){return}
    if(track.preview_url){
      this.audioUrl = track.preview_url
    return}
    if(this.audioUrl.length>0){return}
    let artistName = track['track_name']
    let trackName = track['track_name']
    let trackLength = Math.round(track['track_length']/1000); 
    this.audioUrl = Routes.Spotify.GetYoutubeMp3(encodeURIComponent(artistName),encodeURIComponent(trackName),encodeURIComponent(trackLength.toString()));
  }
  deselectAll(){
    for(let track of this.tracks){
      if(!track){continue}
      this.selected[track.id] = false
    }
  }
  async transferToYoutube(){
    this.preLoadingYoutube = true
    let tracksToPreload = []
    let savedTracks = this._spotifyAuth.savedTracks
    let savedIds = savedTracks.map(x => x.id)
    for(let track of this.tracks){
      if(!track){continue}
      if(savedIds.includes(track.id)){
        let savedTrack = savedTracks.find(x => x.id == track!.id)
        if(!savedTrack||savedTrack.youtube_url||savedTrack.youtube_url?.length>0){continue}
        tracksToPreload.push(track)
      }
    }
    if(tracksToPreload.length == 0){
      this.preLoadingYoutube = false
      this.messageService.add({severity:'warning', summary: 'Not found', detail: 'No tracks to preload'});
      return
    }
    await firstValueFrom( this._customClient.post<string[]>(Routes.Spotify.TransferToYoutube,{
      tracks: tracksToPreload
    })).then((r)=>{
      let ytUrls:string[] = r
      let i = 0
      for(let track of tracksToPreload){
        track['youtube_url'] = ytUrls[i]
        let index = savedIds.indexOf(track.id)
        savedTracks.splice(index,1,track)
        this.preLoadingYoutube = false
        i++
      }
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Preloaded youtube URLs successfully'});

      this._spotifyAuth.savedTracks = savedTracks
    }, (e)=>{
      this.preLoadingYoutube = false
      this.messageService.add({severity:'error', summary: 'Failed', detail: 'Failed to preload youtube URLs'});
    })
  }
  setLastSelected(track: SavedTrack){
    let index = this.tracks.findIndex(x => x.id === track?.id)
    if(this.isShiftPressed){
      if(this.lastSelected>-1 && index > this.lastSelected){
        for(let i = this.lastSelected; i < index; i++){
          if(this.tracks[i]?.id){
            let id = this.tracks[i]?.id!
            this.selected[id] = true
          }
        }
      }
      else if(this.lastSelected>-1 && index < this.lastSelected){
        for(let i = this.lastSelected; i >= index; i--){
          if(this.tracks[i]?.id){
            let id = this.tracks[i]?.id!
            this.selected[id] = true
          }
        }
      }
    }
    if(index == this.lastSelected){
      let last = -1
      for(let i = 0; i < Object.values(this.selected).length; i++){
        if(Object.values(this.selected)[i]){
          last = i
        }
      }
      this.lastSelected = last
    }
    else{
      this.lastSelected = index
    }
  }
  
  filterValue: string = ''

  ngOnInit() {
    this._loading = true;
    this.shuffled = false;
    this.shuffledTracks = [];
    this.ogTracks = [];
    if (this.playlistId !== '') {
      this._customClient
        .get<PlaylistDetail|PublicPlaylist>(Routes.Spotify.GetPlaylist(this.playlistId))
        .subscribe(async(response) => {
          if((response as PublicPlaylist).last_refreshed > 0||(response as any).generated){
            this.playlist = response as PublicPlaylist
            this.tracks = this.playlist.tracks;
          }
          else if ((response as PlaylistDetail).href ) {
            this.playlist = Playlist.toPublic(response as Playlist) as PublicPlaylist;
            this.tracks = (response as PlaylistDetail).tracks.items.map(x => { let t:Track = x; return Track.ToSavedTrack(t); });
          }
          this.tracks.forEach(track => {
            if (track) {
              this.selected[track.id] = false
            }
          })
          this._loading = false;
        });
    }
  }
  onSortChange(event: any){
    let value = event.value;
    this.shuffled = false
    this.sortField = value;
    this.ascendingSort = this.sortOrder == 1
  }
  toggleAscending(){
    this.shuffled = false
    this.ascendingSort = !this.ascendingSort
    if(this.ascendingSort){
      this.sortOrder = 1
    }else{
      this.sortOrder = -1
    }
  }
  EditSaved(tracks: SavedTrack[]) {
    let toRemove: SavedTrack[] = []
    let toAdd: SavedTrack[] = []
    tracks.forEach(track => {
      if (track.favourite) {
        toRemove.push(track)
        track.favourite = false
        this.messageService.add({ severity: 'error', summary: 'Track Removed From Favourites', detail: track['artist_name']+ ' - ' + track['track_name']});
      } else {
        toAdd.push(track)
        track.favourite = true
        this.messageService.add({ severity: 'success', summary: 'Track Added To Favourites', detail: track['artist_name']+ ' - ' + track['track_name']});
      }
    })
    this._spotifyAuth.removeFromSaved(toRemove)
    this._spotifyAuth.addToSaved(toAdd)
    if(toAdd.length == 0 && toRemove.length == 0){
      this.messageService.add({ severity: 'info', summary: 'No effect', detail: 'No changes' });
    }
    
  }
  shuffle(){
    this.shuffledTracks = Array.from(this.ogTracks.sort(() => Math.random() - 0.5));
    this.shuffled = !this.shuffled
  }
  onPlay(track: SavedTrack) {
    this.playingTrackId = "";
    this.playingTrack.emit(track);
  }
}
