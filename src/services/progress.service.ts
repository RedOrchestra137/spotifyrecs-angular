import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpotifyAuthService } from './spotify-auth.service';
import { Routes } from '../../routes';
import { SavedTrack } from '../interfaces/spotify';
import { io, Socket } from 'socket.io-client';

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
  private socket: Socket | null = null;
  private isConnected = false;

  constructor() {}

  startProcess(userId: string, token: string) {
    // Initialize Socket.IO connection - remove the cors option
    this.socket = io('https://redorchid.eu', {
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Handle connection
    this.socket.on('connect', () => {
      console.log('Connected to progress WebSocket');
      this.isConnected = true;
      
      // Subscribe to progress updates for this user
      this.socket!.emit('subscribe-progress', {
        userId: userId,
        userToken: token
      });
    });

    // Listen for progress updates
    this.socket.on('progress-update', (data: ProgressData) => {
      console.log("Progress update:", data);
      this.newDataEvent.emit(data);
    });

    // Handle connection errors
    this.socket.on('connect_error', (error) => {
      console.error("Error in WebSocket connection", error);
      this.newDataEvent.emit({
        message: 'Connection error',
        progress: 0,
        response: null
      });
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from progress WebSocket:', reason);
      this.isConnected = false;
    });

    // Handle reconnection
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to progress WebSocket after', attemptNumber, 'attempts');
      this.isConnected = true;
    });
  }

  // Close the WebSocket connection when done
  stop() {
    if (this.socket) {
      console.log("Closing WebSocket connection");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Optional: Method to check connection status
  isConnectionOpen(): boolean {
    return this.isConnected;
  }

  // Optional: Method to send custom messages to server
  sendMessage(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}