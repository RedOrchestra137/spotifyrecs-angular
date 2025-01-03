import { Routes } from '@angular/router';
import { SpotifyInterfaceComponent } from '../spotify-interface/spotify-interface.component';
import { PlaylistComponent } from '../spotify-interface/playlist/playlist.component';
import { HomeComponent } from './home/home.component';
import { PlaylistDetailComponent } from '../spotify-interface/playlist/playlist-detail/playlist-detail.component';
import { ScreenerComponent } from '../spotify-interface/screener/screener.component';

export const routes: Routes = [

    { path: 'spotify', component: SpotifyInterfaceComponent, children: [
        { path: 'playlist', component: PlaylistComponent},
        { path: 'playlist-detail/:id', component: PlaylistDetailComponent }
    ]}, 
    { path: 'screener', component: ScreenerComponent},

    
    { path: '**', component: HomeComponent}

];
