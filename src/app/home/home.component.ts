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
      image: 'https://www.svgrepo.com/show/512899/spotify-162.svg',
      imageId: 'spotifyStyle_image'
    },
    // {
    //   title: 'Auto Slowed+Reverb',
    //   route: '/slowedNreverb',
    //   icon: 'pi pi-music',
    //   description: "Automatically generate your 'original content' by applying common effects to other people's music :)",
    //   colour: 'bg-blue-200',
    //   id: 'slowedNreverbStyle',
    //   image: 'https://www.svgrepo.com/show/320717/echo-ripples.svg',
    //   imageId: 'slowedNreverbStyle_image'
    // }
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
