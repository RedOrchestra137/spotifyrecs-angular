import { AfterViewInit, Component, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ImportsModule } from '../app/imports';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { Routes } from '../../routes';
import { SpotifyAuthService } from '../services/spotify-auth.service';
import { AuthInterceptService } from '../services/auth-intercept.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DetailsOpenedEvent, PlaylistComponent } from './playlist/playlist.component';
import { PlaylistDetailComponent, startPlaylistModeEvent } from './playlist/playlist-detail/playlist-detail.component';
import { Playlist, PlaylistDetail, PublicPlaylist, SavedTrack, Track } from '../interfaces/spotify';
import { SpotifyUser } from './response objects/UserResponse';
import { GeneratedResponse } from './response objects/TokenResponse';
import { ToastPositionType } from 'primeng/toast';
import { KeyValue, NgStyle } from '@angular/common';
import { firstValueFrom, forkJoin, Subscription } from 'rxjs';
import { YoutubeComponent } from './youtube/youtube.component';
import { AddOtherPlaylistComponent } from './playlist/add-other-playlist/add-other-playlist.component';
import { CreatePlaylistComponent } from './playlist/create-playlist/create-playlist.component';
import { ZIndexUtils } from 'primeng/utils';
import { ChangeDetectorRef } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ThemeService } from '../services/theme.service';
import { InputOtpChangeEvent } from 'primeng/inputotp';
import { v4 as uuidv4 } from 'uuid';
import { OwnershipCheckComponent } from './ownership-check/ownership-check.component';
import { Navigation, Router } from '@angular/router';
import { ProgressData, ProgressService } from '../services/progress.service';
import { AudioService } from '../services/audio.service';
import { MiniplayerComponent } from './miniplayer/miniplayer.component';

export enum PlayListDialogState {
  SelectMultipleLiked,
  SelectMultipleGenerated,
  SelectSingle
}
@Component({
  selector: 'app-spotify-interface',
  standalone: true,
  imports: [ImportsModule,PlaylistComponent,PlaylistDetailComponent, HttpClientModule,
    YoutubeComponent,AddOtherPlaylistComponent, CreatePlaylistComponent,
    OwnershipCheckComponent, MiniplayerComponent
  ],
  templateUrl: './spotify-interface.component.html',
  styleUrl: './spotify-interface.component.css',
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptService,
      multi: true,
    },
    MessageService,
    ConfirmationService
  ]
})

export class SpotifyInterfaceComponent implements OnInit,OnDestroy,AfterViewInit  {
  @ViewChild(PlaylistComponent) plComponent!: PlaylistComponent;
  @ViewChild(PlaylistDetailComponent) plDetailsComponent!: PlaylistDetailComponent;
  @ViewChild(YoutubeComponent) ytComponent!: YoutubeComponent;
  @ViewChild(AddOtherPlaylistComponent) addOtherPlComponent!: AddOtherPlaylistComponent;
  @ViewChild(CreatePlaylistComponent) createPlComponent!: CreatePlaylistComponent;
  @ViewChild('ytDialog') ytDialog!: Dialog;
  @ViewChild(OwnershipCheckComponent) ownershipCheck!: OwnershipCheckComponent;
  @ViewChild('scrollingText', { static: false }) scrollingText!: ElementRef;
  @ViewChild('scrollTextContainer', { static: false }) scrollTextContainer!: ElementRef;
  @ViewChild(MiniplayerComponent) miniplayer!: MiniplayerComponent
  playlistCreatedEmitter: EventEmitter<Playlist> = new EventEmitter<Playlist>()
  referenceButton: HTMLElement | null = null;
  showPlaylistDialog:boolean = false
  showPlaylistDetailDialog:boolean = false
  showScreenerDialog:boolean = false
  showOtherPlaylistDialog:boolean = false
  showCreatePlaylistDialog:boolean = false
  showYoutubeDialog:boolean = false
  showMinimizedPlayer:boolean = false

  checking:boolean = false
  code:string = ""
  state:string = ""
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;


  playlistId:string = "";
  trackAmt:number = 25;
  playlistChip:any = { text: "", image: "" };
  latestGeneratedPlaylist:PublicPlaylist|null = null


  loadingPlaylists:boolean = false
  generating:boolean = false
  registering:boolean = false
  loggingIn:boolean = false
  validUserName:boolean = false
  userNameError:boolean = false
  accountVerified:boolean = false
  passConfirmation:boolean = false
  changingPass:boolean = false
  hasGenerated:boolean = false
  isScrollingText:boolean = false

  showPlaylistChip:boolean = false

  playlistsSelectedLiked:boolean = false
  playlistsSelectedGenerated:boolean = false

  playlistDialogState:PlayListDialogState = PlayListDialogState.SelectSingle

  seedPlaylistsLiked:string[] = []
  seedPlaylistsGenerated:string[] = []
  detailsId: string = ""
  detailsName: string = ""
  ownerShipCode:string = ""
  tempPassword:string = ""
  
  authName:string=""
  sessionId:string

  oldPass:string = ""
  newPass:string = ""
  newPassConfirm:string = ""

  scrollAnimationFrameId: number | null = null; // Store the animation frame ID
  savedTracksSubscription:Subscription
  generateOptions: MenuItem[]|undefined

  generationMessage:string = ""
  generationProgress:number = 0


  playlistButtonItems:MenuItem[] = [
    {
      label: 'Get your recent favourites',
      command: () => {
          this.getRecentFavourites();
      },
      styleClass: 'generateDropdownOption'
    }
  ];
  constructor(
    public authService: SpotifyAuthService,
    private messageService: MessageService,
    private http:HttpClient,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService,
    private Router:Router,
    private progressService:ProgressService,
    public audioService:AudioService
  ) {
    this.sessionId = uuidv4()
    this.savedTracksSubscription = this.authService.savedTracksFinished.subscribe((value) => {
      if(value){
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Saved tracks loaded successfully'});
      }
      else{
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to load saved tracks'});
      }
    })

   }

   MoodBasedGeneration(){

   }
   GenreBasedGeneration(){
     
   }
   toTestComponent(){
     this.Router.navigate(['test'])
   }
   async RecentFavouritesBasedGeneration(){
    console.log("Recent Favourites Based Generation")
    if(this.authService.newlySavedTracks){
      let name = this.authService.authenticatedUser?.display_name??''
      this.createPlComponent.playlistName = `Recommendations for ${name}. ${new Date(Date.now()).toLocaleDateString()}`
      this.createPlComponent.playlistDescription = 'Based on recent favourites'
      this.createPlComponent.create()
      await firstValueFrom(this.playlistCreatedEmitter).then((pl:Playlist)=>{

      })
    }
    else{
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to load recent favourites'});
    }
   }

testMusicBrainz(ids:string[]){
  this.http.post<any>(Routes.Spotify.GetRecordingFromSpotify, {"spotify-ids":ids}).subscribe((data)=>{
    console.log(data)
  })
}
public get buttonWidth(): number {
    this.referenceButton = document.getElementById('referenceButton');
    if (this.isAuthenticated && this.referenceButton) {
        return this.referenceButton?.offsetWidth ?? 0;
    }
    return 0;
}
  ngAfterViewInit(): void {
  //  this.generateOptions = [
        
  //     {
  //         label: 'Generate Based on Mood',
  //         command: () => {
  //             this.MoodBasedGeneration()
  //         },
  //         styleClass: 'generateDropdownOption',
  //     },
      
  //     {
  //         label: 'Generate Based on Genre',
  //         command: () => {
  //             this.GenreBasedGeneration()
  //         },
  //         styleClass: 'generateDropdownOption',
  //     },

  //     {
  //       label: 'Generate Based on Recent Favourites',
  //       command: async () => {
  //           console.log("test")
  //           await this.RecentFavouritesBasedGeneration()
  //       },
  //       styleClass: 'generateDropdownOption',
  //     }
  // ];
  }

  listenInBackground(){
    this.showYoutubeDialog = false
    this.showMinimizedPlayer = true
    this.miniplayer.onPlay(true)
  }

  openFullPlayer(){
    this.showMinimizedPlayer = false
    this.ytDialog.maximize()
    this.showYoutubeDialog = true
    this.ytComponent.onPlay(true)
  }
  startScrolling() {
    const textElement = this.scrollingText.nativeElement;
    const containerWidth = textElement.parentElement.offsetWidth;
    const textWidth = textElement.offsetWidth;

    if (textWidth > containerWidth) { // Only scroll if text is wider than the container
      let startPosition = containerWidth;
      
      const animate = () => {
        if (!this.isScrollingText) {
          // Stop the animation if scrolling is disabled
          if (this.scrollAnimationFrameId !== null) {
            cancelAnimationFrame(this.scrollAnimationFrameId);
            this.scrollAnimationFrameId = null; // Reset the ID
          }
          return;
        }

        startPosition--;
        if (startPosition < -textWidth) {
          startPosition = containerWidth;
        }
        
        textElement.style.transform = `translateX(${startPosition}px)`;
        this.scrollAnimationFrameId = requestAnimationFrame(animate); // Store the frame ID
      };

      this.isScrollingText = true; // Set the flag
      animate(); // Start the animation loop
    }
  }



  // public get user_limit(){
  //   return this.authService.user_limit
  // }
  
  public get isAuthenticated(){
    return this.authService.authenticated
  }
  public get username(){
    return this.authService.authenticatedUser?.display_name??""
  }
  public get saveTracks(){
    if(this.authService.personal){
      return this.authService.saveTracks
    }
    else{
      return false
    }
  }
  public set saveTracks(value){
    this.authService.saveTracks = value
  }
  public get loadingSaved(){
    return this.authService.loadingSaved
  }

  public get ytHeaderStyle():any{
    if(this.ytComponent){
      return this.ytComponent.ColoursText
    }
    return {}
  }

  public get spotifyLogin():string{
    return this.authService.publicUsername
  }
  public get spotifyPassword():string{
    return this.authService.publicPassword
  }
  public set spotifyPassword(value:string){
    this.authService.publicPassword = value
  }
  public set spotifyLogin(value:string){
    this.authService.publicUsername = value
  }
  public get latestGeneratedPlaylistUrl():string{
    if(this.latestGeneratedPlaylist){
      return this.latestGeneratedPlaylist.url
    }
    return ""
  }

  public get latestGeneratedPlaylistImage():string{
    if(this.latestGeneratedPlaylist){
      return this.latestGeneratedPlaylist.image_url
    }
    return ""
  }

  public get latestGeneratedPlaylistId():string{
    if(this.latestGeneratedPlaylist){
      return this.latestGeneratedPlaylist.id
    }
    return ""
  }


  EditSaved(tracks: SavedTrack[]) {
    this.plDetailsComponent.EditSaved(tracks)
  }
  async ngOnInit() {    
    this.items = [
      { label: 'Prepare "Liked" Playlist', icon: 'pi pi-home', route: '/spotify/playlist' },
      // { label: 'Transactions', icon: 'pi pi-chart-line', route:'' },
      // { label: 'Products', icon: 'pi pi-list', route:'' },
    ];
    this.activeItem = this.items[0];
    await firstValueFrom(this.http.get(Routes.Spotify.Patch))
    if(!this.authService.authenticatedUser&&this.authService.lsUser){
      await this.http.get<SpotifyUser>(Routes.Spotify.GetUser).subscribe((response)=>{
        this.authService.SetUser(response)
        this.authService.authenticated = true
      }, (error)=>{
        if(error.status == 444){
          this.authService.logout()
        }
      })
    }
    let i = 0
    while(this.loadingSaved && i<10){
      await new Promise(resolve => setTimeout(resolve, 1000));
      i++
    }
    await this.plComponent.ngOnInit()
  }
  toastPosition():ToastPositionType{
    if(window.innerWidth>575){
      return "top-right"
    }
    else{
      return "top-center"
    }
  }
  onYoutubeClose() {
    this.audioService.currentTimeDict[this.audioService.currentTrack?.id!] = this.ytComponent.player?.getCurrentTime()
    this.authService.youtube = false
    this.ytComponent.selectedDict[this.audioService.currentTrack?.id!] = false
    this.ytComponent.scrollInitialized = false
    this.audioService.shuffled = false
  }
  showAddedToLiked() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Added all to "Liked"',  });
  }
  showGenerated() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Generated ' + this.trackAmt + ' new tracks' });
  }
  showError(error:string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
  onUsernameChange(event:any) {
    this.checking = true

    this.http.post(Routes.Spotify.CheckUserQuestion(this.spotifyLogin),{"session_id":this.sessionId} ).subscribe((response:any)=>{
      this.validUserName = true
      this.userNameError = false
      this.checking = false
      this.ownerShipCode = response['code']
      this.ownershipCheck.ownerShipCode = this.ownerShipCode
      this.ownershipCheck.spotifyLogin = this.spotifyLogin
      this.ownershipCheck.sessionId = this.sessionId
    }, (error)=>{
      this.validUserName = false
      this.userNameError = true
      this.checking = false
    })
  }
  invalidUsername(){
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter a valid username' });
  }


  playlistChanged(){
    if(this.playlistId.length==22){
      let playlist = this.plComponent.playlists[this.plComponent.playlists.findIndex((playlist)=>{return playlist.id==this.playlistId})]
      if(playlist){
        this.showPlaylistChip = true
        this.playlistChip.text = playlist.name
        this.playlistChip.image = this.authService.personal ? (playlist as Playlist).images[0].url : (playlist as PublicPlaylist).image_url
      }
      else{
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User playlist not found' });
      }
    }
    else{
      this.showPlaylistChip = false
    }
  }
  ytTrackChange() {    
    const textWidth = this.scrollingText.nativeElement.clientWidth;
    const containerWidth = this.scrollTextContainer.nativeElement.clientWidth;
        
    this.isScrollingText = textWidth > containerWidth; // Determine if scrolling is needed    
    if (this.isScrollingText) {
      this.startScrolling();
    } else {
      this.stopScrolling();
    }
  }
  stopScrolling() {
    this.isScrollingText = false; // Unset the flag
    if (this.scrollAnimationFrameId !== null) {
      cancelAnimationFrame(this.scrollAnimationFrameId); // Stop the animation loop
      this.scrollAnimationFrameId = null; // Reset the frame ID
    }
    
    // Reset the position of the text to the start
    const textElement = this.scrollingText.nativeElement;
    textElement.style.transform = `translateX(0)`;
  }
  async Login(){
    this.registering = false
    this.changingPass = false
    let ret = await this.authService.Authenticate()
    if(ret==null){
      if(!this.authService.personal){
        this.loggingIn = true
      }
    }
  }
  async PublicLogin(){
    let ret = await this.authService.PublicLogin()
    if(!ret){
      this.loggingIn = true
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Login failed, invalid username or password' });
    }
    else{
      this.loggingIn = false
      this.registering = false
      this.changingPass = false
      await this.getRecentFavourites(true)
    }
  }
  async Register(){
    let ret = await this.authService.Authenticate()
    this.loggingIn = false
    this.changingPass = false
    if(ret==null){
      if(!this.authService.personal){
        this.registering = true      
      }
    }

  }
  startChangePassword(){
    this.changingPass = true
    this.registering = false
    this.loggingIn = false
  }
  async ChangePassword(){
    let ret = await this.http.get(Routes.Spotify.ChangePassword,{headers:{"username":this.spotifyLogin,"old-password":this.oldPass,"new-password":this.newPass}}).subscribe((response:any)=>{
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully' });
      this.spotifyPassword = this.newPass
      this.changingPass = false
      this.registering = false
      this.loggingIn = true
    }, (error)=>{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to change password' });
    })

  }

  Logout(){
    this.authService.Logout();
  }

  PrepPlaylists(){
    this.loadingPlaylists = true
    let seed_tracks:any[] = []
    let obsArr = []
    for(let playlistID of this.seedPlaylistsLiked){
      obsArr.push(this.http.get<PlaylistDetail>(Routes.Spotify.GetPlaylist(playlistID)))
    }
    if(obsArr.length == 0){
      this.http.post(Routes.Spotify.PrepPlaylists,{}).subscribe(()=>{this.loadingPlaylists = false;this.showAddedToLiked()
      },(error)=>{console.log(error);this.loadingPlaylists = false;this.showError(error.status+" - "+error.statusText+": "+error.error)})
      return
    }
    forkJoin(
      obsArr
    ).subscribe(async (details)=>{
      for(let detail of details){
        for(let track of detail.tracks.items){
          seed_tracks.push({
            id: track.track?.id,
            added_at: track.added_at,
            artist_ids: track.track?.artists.map((artist)=>{return artist.id})
          })
        }
      }
      let body = seed_tracks.length > 0 ? { "tracks-to-add":JSON.stringify(seed_tracks)} : {}

      this.http.post(Routes.Spotify.PrepPlaylists,body).subscribe(()=>{this.loadingPlaylists = false;this.showAddedToLiked()
      },(error)=>{console.log(error);this.loadingPlaylists = false;this.showError(error.status+" - "+error.statusText+": "+error.error)})
    })

  }

  async getRecentFavourites(login:boolean=false){
    await this.authService.getRecentFavourites(login).then((response:{success:boolean, playlist:PublicPlaylist|null})=>{
      if(response.success && !login){
        this.openDetails(response.playlist)
      }
      else if(!login){
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No recent favourites' });
      }
    })
  }

  async GenerateTracks(id:string){
    this.generating = true
    this.progressService.newDataEvent.subscribe((data:ProgressData)=>{
      this.generationProgress = data.progress
      this.generationMessage = data.message
      if(data.response){
        this.generating = false
        this.progressService.stop()
        this.generationMessage = ""
        this.generationProgress = 0
      }
    })
    this.progressService.startProcess(this.authService.authenticatedUser?.id??"",this.authService.lsUser??"")
    this.generationMessage = "Starting Recommendation Process.."
    this.generationProgress = 0
    if(id==""&&this.authService.personal){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please provide ID of playlist to store recommendations' });
      this.generating = false
      
      return 
    }

    let seed_tracks:any[] = []
    console.time("Execution Time")
    console.log("generating tracks based on")

    let obsArr = []
    for(let playlistID of this.seedPlaylistsGenerated){
      obsArr.push(this.http.get<PublicPlaylist>(Routes.Spotify.GetPlaylist(playlistID)))
    }
    if(obsArr.length == 0){
      console.log('all library tracks')
      let body:any = { 
        "seed-tracks":JSON.stringify(this.authService.savedTracks),
        "pop-pref":this.authService.popularityPreference,
        "new-artists-pref":this.authService.newArtistsOnly,
        "new-albums-pref":this.authService.newAlbumsOnly,
        "no-duplicate-albums":this.authService.noDuplicateAlbums,
        "no-duplicate-artists":this.authService.noDuplicateArtists
      }
      if(this.authService.personal){
        body["destination-id"] = id
      }
      else{
        body["seed-playlists"]= JSON.stringify(obsArr)
      }
      console.timeEnd("Execution Time")
      this.http.post<GeneratedResponse>(Routes.Spotify.GenerateTracks(this.trackAmt), body, {headers:!this.authService.personal?{"middle-man":"true"}:{}}).subscribe((response:GeneratedResponse)=>{
        this.generating = false;
        this.hasGenerated = true
        this.latestGeneratedPlaylist = JSON.parse(response.your_playlist)

        this.http.post(Routes.Spotify.AddUserFavourites, {"playlist":this.latestGeneratedPlaylist}).subscribe((response:any)=>{
          this.openDetails(null,this.latestGeneratedPlaylist)
          this.showGenerated()
        },(error)=>{console.log(error);this.generating = false;this.showError(error.status+" - "+error.statusText+": "+error.error)})

        // this.authService.SetGenerationLimits(response.user_limit,response.app_limit)
      },(error)=>{console.log(error);this.generating = false;this.showError(error.status+" - "+error.statusText+": "+error.error)})
      return
    }
    console.log('seed tracks')

    forkJoin(
      obsArr
    ).subscribe(async (details)=>{

      let seed_playlists:any[] = []
      for(let detail of details){
        seed_playlists.push(detail)
        seed_tracks = detail.tracks
      }
      let body:any = seed_tracks.length > 0 ? { 
        "seed-tracks":JSON.stringify(seed_tracks),
        "pop-pref":this.authService.popularityPreference,
        "new-artists-pref":this.authService.newArtistsOnly,
        "new-albums-pref":this.authService.newAlbumsOnly,
        "no-duplicate-albums":this.authService.noDuplicateAlbums,
        "no-duplicate-artists":this.authService.noDuplicateArtists
      } : {}
      if(this.authService.personal){
        body["destination-id"] = id
      }
      else{
        body["seed-playlists"]= JSON.stringify(seed_playlists)
      }
      this.http.post<GeneratedResponse>(Routes.Spotify.GenerateTracks(this.trackAmt), body, {headers:!this.authService.personal?{"middle-man":"true"}:{}}).subscribe((response:GeneratedResponse)=>{
        this.generating = false;
        this.hasGenerated = true
        
        this.latestGeneratedPlaylist = JSON.parse(response.your_playlist)
        this.http.post(Routes.Spotify.AddUserFavourites, {"playlist": this.latestGeneratedPlaylist}).subscribe((response:any)=>{
          this.openDetails(null,this.latestGeneratedPlaylist)
          this.showGenerated()
        },(error)=>{console.log(error);this.generating = false;this.showError(error.status+" - "+error.statusText+": "+error.error)})
        // this.authService.SetGenerationLimits(response.user_limit,response.app_limit)

      },(error)=>{console.log(error);this.generating = false;this.showError(error.status+" - "+error.statusText+": "+error.error)})
  
    })
  }

  async OpenUserPlaylists(state:number){
    this.plComponent.state = state
    this.playlistDialogState = state
    this.showPlaylistDialog = true
    this.plComponent.refresh()
  }
  selectedPlaylistsCleared(){
    this.playlistsSelectedLiked = false
    this.playlistsSelectedGenerated = false
  }
  increment(){
    if(this.trackAmt+25>200){
      this.trackAmt=200;
    }
    else{
      this.trackAmt+=25;
    }
  }

  decrement(){
    if(this.trackAmt-25<25){
      this.trackAmt=25;
    }
    else{
      this.trackAmt-=25;
    }
  }

  selectedPlaylists(event:string[]){
    if(this.playlistDialogState==PlayListDialogState.SelectMultipleLiked){
      this.seedPlaylistsLiked = event
      this.playlistsSelectedLiked = true
    }
    else{
      this.seedPlaylistsGenerated = event
      this.playlistsSelectedGenerated = true
    }
    this.showPlaylistDialog = false
  }
  playlistSelected (event:Playlist|PublicPlaylist){
    this.playlistId = event.id
    this.showPlaylistDialog = false
    this.playlistChanged()
  }
  getPlaylist(id:string):Playlist|PublicPlaylist|undefined
  {
    return this.plComponent.playlists.find((playlist)=>{return playlist.id == id})
  }

  getPlaylistName(id:string):string{
    return this.plComponent.playlists.find((playlist)=>{return playlist.id == id})?.name || ""
  }
  getPlaylistImg(id:string):string{
    let pl = this.plComponent.playlists.find((playlist)=>{return playlist.id == id})
    return this.authService.personal?(pl as Playlist).images?.at(0)?.url??"":(pl as PublicPlaylist).image_url??""
  }
  removePlaylistLiked(id:string){
    this.seedPlaylistsLiked = this.seedPlaylistsLiked.filter((playlistID)=>{return playlistID != id})
    let pl = this.getPlaylist(id)
    let trackNr = this.authService.personal ? (pl as Playlist).tracks.total : undefined
    
    this.plComponent.onCheckboxChange({checked:false},id,trackNr || 0)
    this.plComponent.checkedPlaylistsLiked[id] = false
    if(this.seedPlaylistsLiked.length == 0){
      this.playlistsSelectedLiked = false
    }
  }
  removePlaylistGenerated(id:string){
    this.seedPlaylistsGenerated = this.seedPlaylistsGenerated.filter((playlistID)=>{return playlistID != id})
    let pl = this.getPlaylist(id)
    let trackNr = this.authService.personal ? (pl as Playlist).tracks.total : undefined
    this.plComponent.onCheckboxChange({checked:false},id,trackNr || 0)
    this.plComponent.checkedPlaylistsGenerated[id] = false
    if(this.seedPlaylistsGenerated.length == 0){
      this.playlistsSelectedGenerated = false
    }
  }
  async openDetails(event:DetailsOpenedEvent|null=null, playlist:PublicPlaylist|null=this.latestGeneratedPlaylist){
    if(event){
      this.detailsId = event.id
      this.detailsName = event.name
      this.plDetailsComponent.playlistId = event.id
    }
    else if(playlist){
      this.detailsId = playlist.id
      this.detailsName = playlist.name
      this.plDetailsComponent.playlistId = playlist.id
    }
    this.plDetailsComponent.ngOnInit()
    this.showPlaylistDetailDialog = true
  }
  addingOtherPlaylists(){
    this.showOtherPlaylistDialog = true
  }

  createPlaylist(){
    this.createPlComponent.ngOnInit()
    this.showCreatePlaylistDialog = true
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async playlistCreated(event:Playlist){
    if(event){
      await this.ngOnInit()
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Playlist created' });
      this.showCreatePlaylistDialog = false
      this.playlistCreatedEmitter.emit(event);
    }
    else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not create playlist' });
    }
  }

  addedOtherPlaylists(event:Playlist[]){
    this.showOtherPlaylistDialog = false
    let pl:any = event
    if(!this.authService.personal){
      pl = event.map((playlist)=>{return Playlist.toPublic(playlist)})
    }
    console.log("addedOtherPlaylists: ", pl)
    this.plComponent.userPlaylists = this.plComponent.userPlaylists.concat(pl)
  }
  initPlayer(){
    this.ytComponent.initPlayer()
    this.startScrolling();
  }
 async playingTrack(track:SavedTrack){
    if(this.audioService.shuffled){
      this.audioService.tracks = this.plDetailsComponent.tracks
    }
    else{
      let sort:string[] = (this.plDetailsComponent.sortField as string).split('.')
      let sortOrder = this.plDetailsComponent.sortOrder
      this.audioService.tracks = Array.from(this.plDetailsComponent.tracks).sort(
        (a,b)=>{
          let aVal:any = a
          let bVal:any = b
          for (let i = 0; i < sort.length; i++) {
            aVal = aVal[sort[i]]
            bVal = bVal[sort[i]]
          }
          if(typeof aVal == "string"){
            if(sortOrder == -1){
              return bVal.localeCompare(aVal)
            }
            return aVal.localeCompare(bVal)
          }
          else if (typeof aVal == "number"){
            if(sortOrder == -1){
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
    this.ytComponent.setNewTrack(track)
    ZIndexUtils.set('modal', this.ytComponent.el.nativeElement, 11000);
    if(!this.authService.onMobile){
      this.ytDialog.maximize()
    }
    this.ytComponent.ngOnInit()
    await this.ytComponent.onPlay()
    
    this.showYoutubeDialog = true
    this.authService.youtube = true
    await this.ytComponent.setScrollPosition()
  }
  getYoutubeHeader():string{
    if(this.ytComponent){
      return this.ytComponent.getYoutubeHeader()
    }
    return ""
  }


  ngOnDestroy(): void {
    this.savedTracksSubscription.unsubscribe()
  }
}
