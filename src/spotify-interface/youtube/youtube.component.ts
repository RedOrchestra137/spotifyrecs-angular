import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Dictionary, SavedTrack, Track } from '../../interfaces/spotify';
import { HttpClient } from '@angular/common/http';
import { Routes } from '../../../routes';
import { firstValueFrom } from 'rxjs';
import {prominent} from "color.js"
import { ImportsModule } from '../../app/imports';
import { ChangeDetectorRef } from '@angular/core';
import { SpotifyAuthService } from '../../services/spotify-auth.service';
import { ThemeService } from '../../services/theme.service';
import invert, { RGB, RgbArray, HexColor, BlackWhite } from 'invert-color';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-youtube',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './youtube.component.html',
  styleUrl: './youtube.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeComponent implements OnInit {
  @Output("initialized") initialized = new EventEmitter();
  @Output("trackChange") trackChange = new EventEmitter();
  @ViewChild('dockContainer') dockContainer!: ElementRef;
  

  player: any = null;
  isPlayerReady: boolean = false;  // Flag to indicate if player is ready
  queuedVideoId: string | null = null;  // Store the video ID if the player isn't ready
  playerInitialized: boolean = false;  // Track if the player was initialized
  youtubeDialogVisible: boolean = false;
  scrollInitialized: boolean = false;
  done: boolean = false;
  tag: HTMLScriptElement = document.createElement('script');
  firstScriptTag = document.getElementsByTagName('script')[0]
  screening: boolean = false;
  colours: string[] = []
  selectedDict : Dictionary<boolean> = {}
  mouseX: number = 0;
  mouseY: number = 0;

  public get styles(){
    const colours = this.colours.length > 1 ? this.colours : ['var(--purple-text-color)', 'var(--spotify-green)'];
    return [
      { name: 'playerColour1', value: colours[0] },
      { name: 'playerColour2', value: colours[1] }
    ]
  }

  public get curTrackinView(){
    if(this.currentTrackRect && this.dockContainerRect){
      let inView = (this.currentTrackRect.right > this.dockContainerRect.left 
      && this.currentTrackRect.right < this.dockContainerRect.right)||
      (
        this.currentTrackRect.left > this.dockContainerRect.left
        && this.currentTrackRect.left < this.dockContainerRect.right
      )
      return inView
    }
    return false
  }
  public get curTrackForward(){
    if (this.currentTrackRect && this.dockContainerRect) {
      return this.currentTrackRect.right > this.dockContainerRect.right
    }
    return false
  }
  public get dockContainerRect(){
    return this.dockContainer?.nativeElement?.getBoundingClientRect()
  }

  onDockScroll(){
    let checkDock = this.dockContainerRect
    let checkTrack = this.currentTrackRect
    let checkInview = this.curTrackinView
    let forward = this.curTrackForward
    let left = this.calcLeft
    let top = this.calcTop
    this.scrollInitialized = true
  }
  onWheelScroll(event: WheelEvent): void {
    if(this.authService.onMobile) return
    const container = document.getElementById('trackDock');
    if (container) {
      event.preventDefault(); // Prevent the default vertical scrolling behavior
      container.scrollLeft += event.deltaY; // Scroll horizontally
    }
  }
  setScrollPosition() {
    const containerElement = this.dockContainer?.nativeElement;
    if (this.currentTrackRect && this.dockContainerRect && containerElement) {
        // Calculate the target offset, relative to the container's current scroll position
        const targetScrollLeft = 
            this.currentTrackRect.left - this.dockContainerRect.left + containerElement.scrollLeft;

        // Check if we are already at the target scroll position
        if (Math.abs(containerElement.scrollLeft - targetScrollLeft) > 1) { // Add a small tolerance
            containerElement.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        }
    }
}
  public get currentTrackRect(){
    return document.getElementById(this.audioService.currentTrack?.id!)?.getBoundingClientRect()
  }

  public get calcTop(){
    const containerElement = this.dockContainer?.nativeElement;
    const stickyDockResetButton = document.getElementById('stickyDockResetButton');
    if(this.dockContainerRect&&containerElement&&stickyDockResetButton){
      return this.dockContainerRect.top+containerElement.clientHeight/2-stickyDockResetButton.clientHeight/2+'px'
    }else{
      return 0
    }
  }
  
  ngOnInit(): void {
    
  }

  public get calcLeft(){
    const containerElement = this.dockContainer?.nativeElement;
    const stickyDockResetButton = document.getElementById('stickyDockResetButton');
    if(this.dockContainerRect&&containerElement&&stickyDockResetButton){
      if(this.curTrackForward){
        return this.dockContainerRect.left+containerElement.clientWidth-(stickyDockResetButton.clientWidth*1.5)+'px'
      }
      return this.dockContainerRect.left+stickyDockResetButton.clientWidth/2+'px'
    }else{
      return 0
    }
  }


     handleMouseMove(event:any) {
        var eventDoc, doc, body;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }
        this.mouseX = event.pageX;
        this.mouseY = event.pageY;
        // Use event.pageX / event.pageY here
    }

  public get thumbNailWidth():number{
    return window.innerWidth/20>50?window.innerWidth/15:75
  }

  public get thumbBarMaxWidth():number{
    return this.thumbNailWidth*7 > window.innerWidth ? window.innerWidth : this.thumbNailWidth*7
  }
  
  public get ColoursText() {
    const colours = this.colours.length > 1 ? this.colours : ['#ff0000', '#00ff00'];
    const inverseColours = [invert(colours[0]), invert(colours[1])];
    return {
      'background-image': `radial-gradient(circle, ${colours[1]}, ${colours[0]})`,
      'background-clip': 'text',
      '-webkit-background-clip': 'text',
      'color': 'transparent',
      'animation': 'nowplaying 15s linear infinite',
      'background-size': '200% 200%',
      'display': 'inline-block', // Ensures it takes up space
  };
}

  public constructor(private http:HttpClient,public el: ElementRef,
    private cdr: ChangeDetectorRef, public authService: SpotifyAuthService, public themeService: ThemeService, public audioService:AudioService
  ) {
    document.onmousemove = this.handleMouseMove;

  }

  async onShuffle(){
    this.audioService.shuffle()
    // this.shuffledTracks.unshift(this.currentTrack)
    for(let track of this.audioService.ogTracks){
      this.selectedDict[track?.id!] = this.audioService.playlistIndex == this.audioService.shuffledTracks.indexOf(track)
    }
    this.setNewTrack(this.audioService.shuffledTracks[0])
    await this.onPlay()
    this.onDockScroll()
    this.setScrollPosition()
  }
  setNewTrack(track:SavedTrack){
    this.selectedDict[this.audioService.currentTrack?.id!] = false;
    this.selectedDict[track?.id!] = true;
    this.audioService.playlistIndex = this.audioService.tracks.indexOf(track);
  }
  async onNewTrack(track:SavedTrack){
    this.setNewTrack(track)
    await this.onPlay(); 
    this.trackChange.emit()
  }
  trackByFn(index: number, item: Track): any {
    return item.track?.id; // Replace 'id' with a unique identifier for each track item
}
  getYoutubeHeader():string{
    return (this.audioService.currentTrack?.['artist_name']||"Unknown") + " - " + (this.audioService.currentTrack?.['track_name']|| "Unknown")
  }

  async getMostProminentColours(): Promise<string[]>{
    try {
      // Ensure there is a valid image URL
      const imageUrl = this.audioService.currentTrack?.album_image || "";
  
      if (!imageUrl) {
        console.log("No album image found.");
        return []; // Return an empty array if no image URL is provided
      }
  
      // Get the prominent colors from the image
      let colours = await prominent(imageUrl, { amount: 3, format: 'hex' }) as string[]
      
  
      if (!colours || colours.length === 0) {
        console.log("No colors found.");
        return []; // Return an empty array if no colors are found
      }
  
      return [colours[1], colours[2]];
    } catch (error) {
      console.error("Error extracting colors:", error);
      return []; // Return an empty array in case of error
    }
  }

  public get youtubeID(): string{
    return this.audioService.youtubeUrl.split("v=")[1]
  }

  async nextTrack() {
    if(this.audioService.playlistIndex + 1 >= this.audioService.tracks.length){
      return
    }
    this.onNewTrack(this.audioService.tracks[this.audioService.playlistIndex+1])

  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['colours']) {
        this.triggerAnimation();
    }
}

triggerAnimation() {
    const element = document.querySelector('.now-playing-header');
    if (element) {
        // Remove and re-add the class to force a reflow
        element.classList.remove('animate-class');  // Replace with your animation class
        void element.clientWidth;  // Trigger reflow
        element.classList.add('animate-class'); // Add the animation class back
    }
}
  async prevTrack(){
    if(this.audioService.playlistIndex - 1 < 0){
      return
    }
    this.onNewTrack(this.audioService.tracks[this.audioService.playlistIndex-1])
  }
  ngAfterViewInit() {
    this.loadYouTubeAPI();
    this.initialized.emit();
  }
  loadYouTubeAPI() {
    if (!(window as any).YT) {
      // Set up callback for when the API is ready
      (window as any).onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        this.isPlayerReady = false;  // Reset the player readiness flag
        this.initPlayer();
      };
    } else {
      console.log("YouTube API already loaded.");
      this.initPlayer();  // Initialize player immediately if the API is already loaded
    }
  }
  calcPlayerHeight() {
    let footer = document.getElementById('footer')
    let header = document.getElementById('ytDialogHeader')
    let trackDock = document.getElementById('trackDock')
    return window.innerHeight-90-50-(footer?.clientHeight || 0) - 4 - (header?.clientHeight || 0) - (trackDock?.clientHeight || 0)  - 20
  }

  initPlayer(resume:boolean = false, playerId:string = 'player') {
    const videoId = this.audioService.youtubeUrl.split('v=')[1];
    if (!videoId) {
      console.error('Invalid YouTube URL');
      return;
    }

    if (!this.player) {
      // Initialize the YouTube player if not already initialized
      this.player = new (window as any).YT.Player(playerId, {
        height: this.authService.onMobile ? window.innerWidth/(640/390) : this.calcPlayerHeight(),
        width: this.authService.onMobile ? window.innerWidth : this.calcPlayerHeight()*(640/390),
        videoId: videoId,
        
        playerVars: {
          playsinline: 1,
        },
        events: {
          'onReady': (event: any) => this.onPlayerReady(event), // Ensure this function is assigned correctly
          'onStateChange': (event: any) => this.onPlayerStateChange(event)
        }
      });

    } 
    else if (resume)
    {
      this.player.seekTo(this.audioService.currentTimeDict[this.audioService.currentTrack?.id!])
      this.player.playVideo();
    }
    else {
      this.player.destroy();
      this.player = undefined;
      this.initPlayer();
    }
  }

  onPlayerReady(event: any) {
    this.isPlayerReady = true;  // Mark player as ready
    if(this.audioService.currentTimeDict[this.audioService.currentTrack?.id!] > 0){
      this.player.seekTo(this.audioService.currentTimeDict[this.audioService.currentTrack?.id!])
    }
    if (this.queuedVideoId) {
      console.log('Loading queued video:', this.queuedVideoId);
      this.player.loadVideoById(this.queuedVideoId);  // Load queued video
      this.queuedVideoId = null;  // Clear the queue after loading
    } else {
      event.target.playVideo();  // Autoplay the video when player is ready
    }
  }

  onPlayerStateChange(event: any) {
    if (event.data === (window as any).YT.PlayerState.ENDED) {
      console.log('Video ended.');
        this.nextTrack()
    }
  }

  async onPlay(resume:boolean = false, playerId:string = 'player') {
    this.colours = await this.getMostProminentColours()
    this.cdr.detectChanges(); 
    this.styles.forEach(data => {
      document.documentElement.style.setProperty(`--${data.name}`, data.value);
    });
    if (this.audioService.currentTrack?.album_id && this.audioService.currentTrack?.artist_ids ) {
      const trackName = this.audioService.currentTrack['track_name']
      const artistName = this.audioService.currentTrack['artist_name']
      const length = Math.round(this.audioService.currentTrack['track_length']/ 1000);
      let tracksToCheck = []
      this.audioService.playlistIndex = this.audioService.tracks.indexOf(this.audioService.currentTrack);
      let nextIndex = this.audioService.playlistIndex+1>this.audioService.tracks.length-1?this.audioService.tracks.length-1:this.audioService.playlistIndex+1
      let prevIndex = this.audioService.playlistIndex-1<0?0:this.audioService.playlistIndex-1
      tracksToCheck.push(...[this.audioService.tracks[prevIndex], this.audioService.currentTrack, this.audioService.tracks[nextIndex]])
      for (let track of tracksToCheck){
        let savedTrack = this.authService.savedTracks.find(x => x.id == track?.id)
        let index = this.authService.savedTracks.findIndex(x => x.id == track?.id)
        if (savedTrack?.youtube_url) {
          if(track?.id == this.audioService.currentTrack?.id){
            this.audioService.youtubeUrl = savedTrack.youtube_url
          }
        }
        else{
          const response: any = await firstValueFrom(
            this.http.get(Routes.Spotify.GetYoutubeUrl, {
              params: { t: trackName, a: artistName, l:length},
            })
          );
          this.audioService.youtubeUrl = response.message;
          if(savedTrack){
            savedTrack.youtube_url = this.audioService.youtubeUrl
            this.authService.savedTracks.splice(index, 1, savedTrack)
          }
        }
      }
     
      const videoId = this.audioService.youtubeUrl.split('v=')[1];
      if (!videoId) {
        console.error('Invalid YouTube URL: Unable to extract video ID');
        return;
      }

      // Initialize the player or load the new video
      this.initPlayer(resume,playerId);
      this.youtubeDialogVisible = true;
    }
    this.onDockScroll()

  }
}
