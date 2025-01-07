import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SpotifyAuthService } from '../../services/spotify-auth.service';
import { Routes } from '../../../routes';
import { ImportsModule } from '../../app/imports';
import { DataView, DataViewModule } from 'primeng/dataview';
import { Router } from '@angular/router';
import { PlaylistDetailComponent } from './playlist-detail/playlist-detail.component';
import { CreatePlaylistComponent } from './create-playlist/create-playlist.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Dictionary, Playlist, PlaylistDetail, PublicPlaylist } from '../../interfaces/spotify';
import { KeyValue } from '@angular/common';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { PlayListDialogState } from '../spotify-interface.component';
import { ToastPositionType } from 'primeng/toast';
import { InputOtpChangeEvent } from 'primeng/inputotp';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { firstValueFrom } from 'rxjs';
export interface DetailsOpenedEvent{
  id:string,
  name:string
}
@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [ImportsModule,DataViewModule,PlaylistDetailComponent,CreatePlaylistComponent],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.css',
  encapsulation:ViewEncapsulation.None,
  providers: [MessageService]
})

export class PlaylistComponent implements OnInit{
  @ViewChild(DataView) dv!: DataView
  @Output() playlistSelected = new EventEmitter<Playlist|PublicPlaylist>();
  @Output() selectedPlaylists = new EventEmitter<string[]>();
  @Output() clearedSelection = new EventEmitter<void>();
  @Output() addingOtherPlaylists = new EventEmitter<boolean>();
  @Output() creatingPlaylist = new EventEmitter<boolean>();
  @Output() openingDetails = new EventEmitter<DetailsOpenedEvent>();

  state:PlayListDialogState = PlayListDialogState.SelectSingle
  layout: 'grid' | 'list' = 'list'
  playlists_ambivalent: Playlist[]|PublicPlaylist[] = []
  userPlaylistsSingle_ambivalent: Playlist[]|PublicPlaylist[] = []
  userPlaylistsMultiple_ambivalent: Playlist[]|PublicPlaylist[] = []
  filteredUserPlaylists_ambivalent: Playlist[]|PublicPlaylist[] = []

  public get playlists(){
   return this.authService.personal?this.playlists_ambivalent as Playlist[]:this.playlists_ambivalent as PublicPlaylist[]
  }
  public get userPlaylistsSingle(){
    return this.authService.personal?this.userPlaylistsSingle_ambivalent as Playlist[]:this.userPlaylistsSingle_ambivalent as PublicPlaylist[]
  }
  public get userPlaylistsMultiple(){
    return this.authService.personal?this.userPlaylistsMultiple_ambivalent as Playlist[]:this.userPlaylistsMultiple_ambivalent as PublicPlaylist[]
  }
  public get filteredUserPlaylists(){
    return this.authService.personal?this.filteredUserPlaylists_ambivalent as Playlist[]:this.filteredUserPlaylists_ambivalent as PublicPlaylist[]
  }
  public set playlists(value){
    if(this.authService.personal){
      this.playlists_ambivalent = value as Playlist[]
    }
    else{
      this.playlists_ambivalent = value as PublicPlaylist[]
    }
  }
  public set userPlaylistsSingle(value: Playlist[]|PublicPlaylist[]){
    if(this.authService.personal){
      this.userPlaylistsSingle_ambivalent = value as Playlist[]
    }
    else{
      this.userPlaylistsSingle_ambivalent = value as PublicPlaylist[]
    }
  }
  public set userPlaylistsMultiple(value: Playlist[]|PublicPlaylist[]){
    if(this.authService.personal){
      this.userPlaylistsMultiple_ambivalent = value as Playlist[]
    }
    else{
      this.userPlaylistsMultiple_ambivalent = value as PublicPlaylist[]
    }
  }
  public set filteredUserPlaylists(value: Playlist[]|PublicPlaylist[]){
    if(this.authService.personal){
      this.filteredUserPlaylists_ambivalent = value as Playlist[]
    }
    else{
      this.filteredUserPlaylists_ambivalent = value as PublicPlaylist[]
    }
  }

  checkedPlaylistsLiked: Dictionary<boolean> = {}
  checkedPlaylistsGenerated: Dictionary<boolean> = {}
  selectedPlaylistIdsLiked:string[] = []
  selectedPlaylistIdsGenerated:string[] = []
  selectedTracksAmtLiked:number = 0
  selectedTracksAmtGenerated:number = 0

  selectingPlaylists:boolean = false
  _loading = false;
  refreshing = false

  public get onMobile(): boolean {
    return window.innerWidth < 768
  }

  loadingDict:Dictionary<boolean> = {}
  removingDict:Dictionary<boolean> = {}
  
  sortOptions:any = [

  ]

  sortOrder: number = -1;
  sortField: any = 'track_total';
  sortKey: any = 'track_total';
  ascendingSort: boolean = false;

  speedDialOpened: boolean = false
  searching:boolean = false

  
  filterValue: string = '';

  onSortChange(event: any) {
    let value = event.value;
    this.sortField = value;
    this.ascendingSort = this.sortOrder == 1
  }

  constructor(private _http: HttpClient,public authService: SpotifyAuthService
    ,private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef) {
      this.sortOptions = [
        {label: 'Sort by Name', value: 'name'},
        {label:'Sort by # Tracks', value: this.authService.personal?'tracks.total':'track_total'}
      ]
      this.sortKey = this.authService.personal?'tracks.total':'track_total'
      this.sortField = this.authService.personal?'tracks.total':'track_total'
  }
  async ngOnInit() {
    await this.loadPlaylists()
  }
  toggleSearch(){
    this.searching = !this.searching
    if(!this.searching){
      this.filterValue = ""
    }
  }
  get itemsSpeedDial(){
    if(this.state==PlayListDialogState.SelectSingle){
      return [
        {
          icon: 'pi pi-refresh',
          command: () => {
            this.refresh()
          },
          tooltipOptions: {
            tooltipLabel: 'Refresh Playlists',
  
          }
        },
        {
          icon: 'pi pi-search',
          command: () => {
            this.toggleSearch()
          },
          tooltipOptions: {
            tooltipLabel: 'Search',
          }
        }
      ]
    }else{
      return [
        {
          icon: 'pi pi-refresh',
          command: () => {
            this.refresh()
          },
          tooltipOptions: {
            tooltipLabel: 'Refresh Playlists',
    
          }
        },
        {
          icon: 'pi pi-search',
          command: () => {
            this.toggleSearch()
          },
          tooltipOptions: {
            tooltipLabel: 'Search',
          }
        },
        {
          icon: 'pi pi-plus',
  
          command: () => {
            this.addOtherPlaylist()          
          },
          tooltipOptions: {
            tooltipLabel: 'Add Other Playlists',
          }
        },
        {
          icon: 'pi pi-check',
          command: () => {
            this.submitSelection()
          },
          tooltipOptions: {
            tooltipLabel: 'Submit Selection',
          }
        }
      ]
    }
  }
  get userPlaylists(){
    let ret = []
    let sort:string[] = (this.sortField as string).split('.')
    if(this.state == PlayListDialogState.SelectSingle){
      ret = this.userPlaylistsSingle
    }
    else{
      ret = this.userPlaylistsMultiple
    }
    return ret.filter(playlist => playlist.name.toLowerCase().includes(this.filterValue.toLowerCase()))
    .sort(
      (a,b)=>{
        let aVal:any = a
        let bVal:any = b
        for (let i = 0; i < sort.length; i++) {
          if(aVal == undefined || bVal == undefined){
            return 0
          }
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
  set userPlaylists(value){
    let val = this.authService.personal?value as Playlist[]:value as PublicPlaylist[]
    if(this.state == PlayListDialogState.SelectSingle){
      this.userPlaylistsSingle = val
    }
    else{
      this.userPlaylistsMultiple = val
    }
  }
  get checkedPlaylists(){
    if(this.state == PlayListDialogState.SelectMultipleGenerated){
      return this.checkedPlaylistsGenerated
    }
    else if(this.state == PlayListDialogState.SelectMultipleLiked){
      return this.checkedPlaylistsLiked
    }
    else{
      return {}
    }
  }
  set checkedPlaylists(value){
    if(this.state == PlayListDialogState.SelectMultipleGenerated){
      this.checkedPlaylistsGenerated = value
    }
    else if(this.state == PlayListDialogState.SelectMultipleLiked){
      this.checkedPlaylistsLiked = value
    }
  }
  get selectedPlaylistIds(){
    if(this.state == PlayListDialogState.SelectMultipleGenerated){
      return this.selectedPlaylistIdsGenerated
    }
    else if(this.state == PlayListDialogState.SelectMultipleLiked){
      return this.selectedPlaylistIdsLiked
    }
    else{
      return []
    }
  }
  set selectedPlaylistIds(value){
    if(this.state == PlayListDialogState.SelectMultipleGenerated){
      this.selectedPlaylistIdsGenerated = value
    }
    else if(this.state == PlayListDialogState.SelectMultipleLiked){
      this.selectedPlaylistIdsLiked = value
    }
  }
  get selectedTracksAmt(){
    if(this.state == PlayListDialogState.SelectMultipleGenerated){
      return this.selectedTracksAmtGenerated
    }
    else if(this.state == PlayListDialogState.SelectMultipleLiked){
      return this.selectedTracksAmtLiked
    }
    else{
      return 0
    }
  }
  set selectedTracksAmt(value){
    if(this.state == PlayListDialogState.SelectMultipleGenerated){
      this.selectedTracksAmtGenerated = value
    }
    else if(this.state == PlayListDialogState.SelectMultipleLiked){
      this.selectedTracksAmtLiked = value
    }
  }

  createPlaylist(){
    this.creatingPlaylist.emit(true)
  }

  openSpeedDial(){
    let element = document.querySelector('.playlist-speeddial>.p-speeddial-linear>.p-speeddial-list') as HTMLElement;
    element.style.setProperty('--speeddial-open', 'flex');
    this.speedDialOpened = true
  }

  closeSpeedDial(){
    let element = document.querySelector('.playlist-speeddial>.p-speeddial-linear>.p-speeddial-list') as HTMLElement;
    element.style.setProperty('--speeddial-open', 'none');
    this.speedDialOpened = false
  }

  confirmDelete(event: Event, id:string) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to remove this playlist?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass:"ml-3",
        acceptLabel:"Delete",
        rejectLabel:"Cancel",
        accept: async () => {
            this.removingDict[id] = true
            this._http.delete(Routes.Spotify.DeletePlaylist(id), {headers:{"middle-man":"true"}}).subscribe(async (response) => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Playlist deleted' });
              this.removingDict[id] = false
              await new Promise(resolve => setTimeout(resolve, 2000));
              await this.ngOnInit()
            }, (error) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message }); 
            this.removingDict[id] = false
          })
        },  
        reject: () => {
          this.removingDict[id] = false
        }
    })
  }

  confirmEmpty(event: Event, id:string) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Are you sure you want to empty this playlist?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass:"ml-3",
        acceptLabel:"Empty",
        rejectLabel:"Cancel",
        accept: async () => {
            this.loadingDict[id] = true
            this._http.get(Routes.Spotify.EmptyPlaylist(id)).subscribe(async (response) => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Playlist emptied' });
              this.loadingDict[id] = false
              await new Promise(resolve => setTimeout(resolve, 2000));
              await this.ngOnInit()
            }, (error) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message }); 
            this.loadingDict[id] = false
          })
        },

        reject: () => {
          // this.loadingDict[id] = false
        }
    });
}

  toggleAscending(){
    this.ascendingSort = !this.ascendingSort
    if(this.ascendingSort){
      this.sortOrder = 1
    }else{
      this.sortOrder = -1
    }
  }

  toastPosition():ToastPositionType{
    if(window.innerWidth>575){
      return "top-right"
    }
    else{
      return "top-center"
    }
  }
  pickPlaylist(id:string){
    this.playlistSelected.emit(this.userPlaylists.filter(playlist => playlist.id === id)[0])
  }
  onCheckboxChange(event: CheckboxChangeEvent, id: string, tracknr: number) {
    console.log("checkbox change", event, id, tracknr)
    if(event.checked){
      this.selectedPlaylistIds.push(id)
      this.selectedTracksAmt += tracknr
    }
    else{
      this.selectedPlaylistIds = this.selectedPlaylistIds.filter(playlistId => playlistId !== id)
      this.selectedTracksAmt -= tracknr
    }
  }

  private async loadPlaylists() {
    this._loading = true;
  
    if (this.authService.authenticated) {
      this._http.get<any>(Routes.Spotify.GetUserPlaylists).subscribe((response) => {
        if(this.authService.personal){
          this.playlists = response.items as Playlist[];
        }
        else{
          this.playlists = (response as PublicPlaylist[])
        }
        if(this.userPlaylistsMultiple.length>0){
          for (let pl of this.playlists){
            let owner_id = this.authService.personal ? (pl as Playlist).owner.id : pl.owner_id
            let includes = this.userPlaylistsMultiple.filter(playlist => playlist.id == pl.id).length > 0;
            if(!includes && owner_id == this.authService.user_id){
              this.userPlaylistsMultiple.push(pl as Playlist&PublicPlaylist)
            }
            else if(owner_id == this.authService.user_id){
              this.userPlaylistsMultiple = (this.userPlaylistsMultiple as Playlist[]).filter(playlist => playlist.id !== pl.id)
              this.userPlaylistsMultiple.push(pl as Playlist&PublicPlaylist)
            }
          }
        }
        else{

          this.userPlaylistsMultiple = (this.playlists.filter(playlist => (this.authService.personal ? (playlist as Playlist).owner.id : playlist.owner_id) === this.authService.user_id)) as Playlist[]|PublicPlaylist[];
        }
        this.userPlaylistsSingle = (this.playlists.filter(playlist => (this.authService.personal ? (playlist as Playlist).owner.id : playlist.owner_id) === this.authService.user_id)) as Playlist[]|PublicPlaylist[]; 
        this._loading = false;
  
      }, (error) => {
        this._loading = false;
        console.log(error);
        if (error.status === 444) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Session expired. Please log in again.' });
          this.authService.logout();
        }
      });
    }
  }
  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


  openDetails(id:string,name:string) {
    this.openingDetails.emit({id:id,name:name})
  }
  addOtherPlaylist(){
    this.addingOtherPlaylists.emit(true)
  }
  getImage(pl:Playlist|PublicPlaylist|null){
    if(!pl){
      return ""
    }
    if(this.authService.personal){
      let pList = pl as Playlist
      if(pList.images){
        if(pList.images.length > 0){
          return pList.images[0].url
        }
        return ""
      }
    }
    else{
      let pList = pl as PublicPlaylist
      if(pList.image_url){
        return pList.image_url
      }
    }
    return ""
  }
  getPlaylistUrl(pl:Playlist|PublicPlaylist){
    if(this.authService.personal){
      pl = pl as Playlist
      if(!pl.external_urls){
        return ""
      }
      return pl.external_urls.spotify
    }
    else{
      pl = pl as PublicPlaylist
      return pl.url
    }
  }
  getTrackTotal(pl:Playlist|PublicPlaylist){
    if(this.authService.personal){
      pl = pl as Playlist
      return (pl.tracks?.total??"unknown #")+" tracks"
    }
    else{
      pl = pl as PublicPlaylist
      return (pl.track_total??"unknown #")+" tracks"
    }
  }
  submitSelection(){
    if(this.selectedPlaylistIds.length > 0 && this.selectedTracksAmt >= 5){
      this.selectedPlaylists.emit(this.selectedPlaylistIds)
    }
    else if(this.selectedTracksAmt > 0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select at least 5 tracks worth of playlists' });
    }
    else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No usable playlist selected' });
    }
  }
  clearSelection(){
    this.selectedPlaylistIds.forEach(playlistId => {
      this.checkedPlaylists[playlistId] = false
    })
    this.selectedPlaylistIds = []
    this.selectedTracksAmt = 0
    this.clearedSelection.emit()
  }
  async refresh(){
    this.refreshing = true
    await this.ngOnInit()
    this.refreshing = false
  }
}






