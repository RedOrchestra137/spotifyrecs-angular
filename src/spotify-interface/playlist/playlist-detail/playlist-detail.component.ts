import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyAuthService } from '../../auth/spotify-auth.service';
import { Routes } from '../../../../routes';
import { ImportsModule } from '../../../app/imports';
import { Dictionary, PlaylistDetail, Track, TrackView } from '../../../interfaces/spotify';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
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
  @Output('playingTrack') playingTrack = new EventEmitter<Track>();
  @Output('startingPlaylistMode') startingPlaylistMode = new EventEmitter<startPlaylistModeEvent>();
  @ViewChild('trackList', { static: false }) trackList!: ElementRef;
  playlist!: PlaylistDetail;
  
  ogTracks: Array<Track> = [];
  shuffledTracks: Array<Track> = [];
  _loading: boolean = false;
  filterTracks: Array<Track> = [];
  sortOrder: number = -1;
  sortField: any = 'track.popularity';
  sortKey: any = 'track.popularity';
  ascendingSort: boolean = false;
  shuffled: boolean = false;
  preLoadingYoutube: boolean = false;
  sortOptions: any[] = [
    { label: 'Name', value: 'track.name' },
    { label: 'Popularity', value: 'track.popularity' }
  ]
  lastSelected:number = -1
  addedToSavedDict: Dictionary<boolean> = {};
  selected:Dictionary<boolean> = {};
  
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

  public get tracks(): Array<Track>{
    let sort:string[] = (this.sortField as string).split('.')

    if(this.shuffled){
      return this.shuffledTracks
      .filter(track => track?.track?.name.toLowerCase().includes(this.filterValue.toLowerCase()))
    }
    return this.ogTracks
    .filter(track => track?.track?.name.toLowerCase().includes(this.filterValue.toLowerCase()))
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
  public set tracks(value: Array<Track>){
    this.ogTracks = value.map(x => Track.FromObject(x))
  }
  public get onMobile(): boolean{
    
    return window.innerWidth < 768
  }
  public get hasSelected(): boolean{
    return Object.values(this.selected).filter(x => x==true).length > 0
  }
  public get selectedTracks(): Array<Track>{
    return this.tracks.filter(x => x.track && this.selected[x.track.id])
  }
  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.trackList && !this.trackList.nativeElement.contains(event.target)) {
      // This will be triggered if the click happens outside the list template
      this.deselectAll();
    }
  }
  deselectAll(){
    for(let track of this.tracks){
      if(!track.track){continue}
      this.selected[track.track.id] = false
    }
  }
  async transferToYoutube(){
    this.preLoadingYoutube = true
    let tracksToPreload = []
    let savedTracks = this._spotifyAuth.savedTracks
    let savedIds = savedTracks.map(x => x.id)
    for(let track of this.tracks){
      if(!track.track){continue}
      if(savedIds.includes(track.track.id)){
        let savedTrack = savedTracks.find(x => x.id == track.track!.id)
        if(!savedTrack||savedTrack.youtube_url||savedTrack.youtube_url?.length>0){continue}
        tracksToPreload.push(track)
      }
    }
    if(tracksToPreload.length == 0){
      this.preLoadingYoutube = false
      this.messageService.add({severity:'warning', summary: 'Not found', detail: 'No tracks to preload'});
      return
    }
    this._customClient.post<string[]>(Routes.Spotify.TransferToYoutube,{
      tracks: tracksToPreload
    }).subscribe(r=>{
      let ytUrls:string[] = r
      let i = 0
      for(let track of tracksToPreload){
        let tr:TrackView = {
          youtube_url: ytUrls[i]??"",
          id: track.track?.id??"",
          artist_ids: track.track?.artists?.map(a => a.id)??[],
          album_id: track.track?.album?.id??"",
          added_at: track.added_at??""
        }
        tr['youtube_url'] = ytUrls[i]
        let index = savedIds.indexOf(tr.id)
        savedTracks.splice(index,1,tr)
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
  setLastSelected(track: Track){
    let index = this.tracks.findIndex(x => x.track?.id === track.track?.id)
    if(this.isShiftPressed){
      if(this.lastSelected>-1 && index > this.lastSelected){
        for(let i = this.lastSelected; i < index; i++){
          if(this.tracks[i].track?.id){
            let id = this.tracks[i].track?.id!
            this.selected[id] = true
          }
        }
      }
      else if(this.lastSelected>-1 && index < this.lastSelected){
        for(let i = this.lastSelected; i >= index; i--){
          if(this.tracks[i].track?.id){
            let id = this.tracks[i].track?.id!
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
        .get<PlaylistDetail>(Routes.Spotify.GetPlaylist(this.playlistId))
        .subscribe((response) => {
          this.playlist = response;
          this.tracks = response.tracks.items;
          this.tracks.forEach(track => {
            if (track.track) {
              this.addedToSavedDict[track.track.id] = this.isSaved(track);
              this.selected[track.track.id] = false
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

  isSaved(track: Track): boolean {
    
    return this._spotifyAuth.savedTracks.some(savedTrack => savedTrack.id === track.track?.id)
  }
  EditSaved(tracks: Track[]) {
    let toRemove: Track[] = []
    let toAdd: Track[] = []
    tracks.forEach(track => {

      if (this.isSaved(track)) {
        toRemove.push(track)
      } else {
        toAdd.push(track)
      }
    })
    this._spotifyAuth.removeFromSaved(toRemove)
    this._spotifyAuth.addToSaved(toAdd)
    toRemove.forEach(track => {
      if(!track.track){return}
      this.addedToSavedDict[track.track.id] = false
      this.messageService.add({ severity: 'error', summary: 'Track Removed From Saved', detail: track.track.artists[0].name + ' - ' + track.track.name });
    })
    toAdd.forEach(track => {
      if(!track.track){return}
      this.addedToSavedDict[track.track.id] = true
      this.messageService.add({ severity: 'success', summary: 'Track Added To Saved', detail: track.track.artists[0].name + ' - ' + track.track.name });
    })
    if(toAdd.length == 0 && toRemove.length == 0){
      this.messageService.add({ severity: 'info', summary: 'No effect', detail: 'No changes' });
    }
    
  }
  shuffle(){
    this.shuffledTracks = Array.from(this.ogTracks.map(x => Track.FromObject(x))).sort(() => Math.random() - 0.5);
    this.shuffled = !this.shuffled
  }
  onPlay(track: Track) {
    this.playingTrack.emit(track);
  }
}
