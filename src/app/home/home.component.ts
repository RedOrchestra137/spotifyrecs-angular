import { Component } from '@angular/core';
import { ImportsModule } from '../imports';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  pages: Page[] = [
    {
      title: 'Spotify Discover Anytime',
      route: '/spotify',
      icon: 'pi pi-home',
      description: 'Tool to generate new recommendations based on your full Spotify library (likes). Will prefer obscure tracks over popular ones. Unlike Spotify Discover Weekly, you can discover anytime, within reason',
      colour: 'bg-green-200',
      id: 'spotifyStyle',
      image: 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_White.png',
      imageId: 'spotifyStyle_image'
    }
  ];

  constructor() { }

}
export interface Page { 
  title: string;
  route: string;
  icon: string;
  description: string;
  colour: string;
  id:string;
  image: string;
  imageId: string;
}
