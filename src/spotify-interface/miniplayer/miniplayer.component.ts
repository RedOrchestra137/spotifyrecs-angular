import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { SavedTrack } from '../../interfaces/spotify';
import { ImportsModule } from '../../app/imports';
import { HttpClient } from '@angular/common/http';
import { Routes } from '../../../routes';
import { firstValueFrom } from 'rxjs';
import { SpotifyAuthService } from '../../services/spotify-auth.service';

@Component({
  selector: 'app-miniplayer',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './miniplayer.component.html',
  styleUrl: './miniplayer.component.css'
})
export class MiniplayerComponent{
  player:any = null
  isPlayerReady: boolean = false
  queuedVideoId: string | null = null
  switchingTrack:boolean = false
  init:boolean = false
  constructor(public audioService:AudioService, private http:HttpClient, private authService:SpotifyAuthService){
    
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
        videoId: videoId,
        height: '0',
        width: '0',
        playerVars: {
          playsinline: 1,
          controls: 0,
          height: '0',
          width: '0'
        },
        events: {
          'onReady': (event: any) => this.onPlayerReady(event), // Ensure this function is assigned correctly
          'onStateChange': (event: any) => this.onPlayerStateChange(event)
        }
      });

    } else if(resume){
      this.player.seekTo(this.audioService.currentTimeDict[this.audioService.currentTrack?.id!])
      this.player.playVideo();
    }
    else{
      this.player.destroy();
      this.player = undefined;
      this.initPlayer();
    }
  }
  onPlayerReady(event: any) {
    event.target.setPlaybackQuality('small');
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
  setNewTrack(track:SavedTrack){
    this.audioService.playlistIndex = this.audioService.tracks.indexOf(track);
  }
  async onNewTrack(track:SavedTrack){
    this.setNewTrack(track)
    await this.onPlay(); 
  }
  async nextTrack() {
    if(this.audioService.playlistIndex + 1 >= this.audioService.tracks.length){
      return
    }
    this.switchingTrack = true
    this.onNewTrack(this.audioService.tracks[this.audioService.playlistIndex+1])
    this.switchingTrack = false

  }
  async prevTrack(){
    if(this.audioService.playlistIndex - 1 < 0){
      return
    }
    this.switchingTrack = true
    this.onNewTrack(this.audioService.tracks[this.audioService.playlistIndex-1])
    this.switchingTrack = false
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
  onPlayerStateChange(event: any) {
    if (event.data === (window as any).YT.PlayerState.PLAYING) {
      this.player.setPlaybackQuality('small');
    }
    if (event.data === (window as any).YT.PlayerState.ENDED) {
      console.log('Video ended.');
        this.nextTrack()
    }
  }


  public get header(){
    return this.audioService.playing?"Now Playing: "+this.audioService.currentTrack?.artist_name + " - " + this.audioService.currentTrack?.track_name:
    "Paused: "+this.audioService.currentTrack?.artist_name + " - " + this.audioService.currentTrack?.track_name
  }
  public get image(){
    return this.audioService.currentTrack?.album_image??""
  }
  async onPlay(resume:boolean = false, playerId:string = 'player') {
    if(!this.switchingTrack && this.player && !resume){
      this.audioService.playing = true
      this.player.playVideo();
      return
    }

    if (this.audioService.currentTrack?.album_id && this.audioService.currentTrack?.artist_ids) {
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
      this.audioService.playing = true
      // Initialize the player or load the new video
      this.initPlayer(resume, playerId);
    }

  }

  onPause(){
    this.audioService.playing = false
    this.player.pauseVideo();
  }

  public get currentTime() {
    try {
      return this.player?.getCurrentTime() || 0;
    } catch {
      return 0;
    }
  }
  
  public get duration() {
    try {
      return this.player?.getDuration() || 0;
    } catch {
      return 0;
    }
  }
  onSliderChange(event: any) {
    if (this.player) {
      this.player.seekTo(event.value);
    }
    this.audioService.currentTimeDict[this.audioService.currentTrack?.id!] = event.value
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

}
