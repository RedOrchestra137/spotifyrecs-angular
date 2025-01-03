import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpotifyAuthService } from './spotify-auth.service';
import { Routes } from '../../routes';
import { SavedTrack } from '../interfaces/spotify';

export interface ProgressData {
  message: string;
  progress: number;
  response: {
    userTracks: SavedTrack[];
    lastAdded: number;
  }|null;
}

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  newDataEvent:EventEmitter<ProgressData> = new EventEmitter<ProgressData>();
  private eventSource: EventSource | null = null;
  startProcess(userId: string, token: string) {
    // Open the SSE connection first
    this.eventSource = new EventSource(Routes.Spotify.Progress+`?spotify-user-id=${userId}&user-token=${token}`);

    // Listen for progress updates
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.newDataEvent.emit(data);
      console.log("Progress update:", data);
      // Handle progress updates (e.g., update UI)
    };

    this.eventSource.onerror = (error) => {
      console.error("Error in SSE stream", error);
      this.eventSource?.close();
    };
  }

  // Close the SSE connection when done
  stop() {
    if (this.eventSource) {
      console.log("Closing SSE connection");
      this.eventSource.close();
    }
  }
}
