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
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  newDataEvent: EventEmitter<ProgressData> = new EventEmitter<ProgressData>();
  private eventSource: EventSource | null = null;

  constructor() {}

  startProcess(userId: string, token: string) {
    // Close any existing connection first
    if (this.eventSource) {
      this.eventSource.close();
    }

    // Open the SSE connection
    this.eventSource = new EventSource(`https://redorchid.eu/api/progress?spotify-user-id=${userId}&user-token=${token}`);
    
    // Listen for progress updates
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.newDataEvent.emit(data);
        console.log("Progress update:", data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("Error in SSE stream", error);
      this.eventSource?.close();
      this.eventSource = null;
    };

    this.eventSource.onopen = () => {
      console.log("SSE connection opened");
    };
  }

  // Close the SSE connection when done
  stop() {
    if (this.eventSource) {
      console.log("Closing SSE connection");
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Check if connection is open
  isConnectionOpen(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}