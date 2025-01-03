import { Routes } from '@angular/router';
import { SpotifyInterfaceComponent } from '../spotify-interface/spotify-interface.component';
import { PlaylistComponent } from '../spotify-interface/playlist/playlist.component';
import { HomeComponent } from './home/home.component';
import { PlaylistDetailComponent } from '../spotify-interface/playlist/playlist-detail/playlist-detail.component';
import { AuthGuard } from '../auth.guard';
export const routes: Routes = [
    { path: 'spotify', component: SpotifyInterfaceComponent, children: [
        { path: 'playlist', component: PlaylistComponent},
        { path: 'playlist-detail/:id', component: PlaylistDetailComponent }
    ]},
    { path: '**', component: HomeComponent, canActivate: [AuthGuard] }
];
