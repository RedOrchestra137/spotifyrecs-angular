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
      url:null,
      icon: 'pi pi-home',
      description: 'Tool to generate new recommendations based on your full Spotify library (likes). Will prefer obscure tracks over popular ones. Unlike Spotify Discover Weekly, you can discover anytime, within reason',
      colour: 'bg-green-200',
      id: 'spotifyStyle',
      image: 'https://www.svgrepo.com/show/512899/spotify-162.svg',
      imageId: 'spotifyStyle_image'
    },
    {
      title: 'Aphex tracks (covers+midi)',
      route: null,
      url: 'https://drive.google.com/drive/u/1/folders/1PmJa6HFroiDde4ydL47z4cQfVyMzLZJi',
      icon: 'pi pi-music',
      description: "Midi covers of electronic music i did.",
      colour: 'bg-blue-200',
      id: 'aphexStyle',
      image: 'https://images.seeklogo.com/logo-png/0/1/aphex-twin-logo-png_seeklogo-9672.png',
      imageId: 'aphex_image'
    },
    {
      title: 'Aphex Live Tracks',
      route: null,
      url: 'https://drive.google.com/drive/u/1/folders/1L1709wMEx908VZZf_bwE5mCU5SG11kh9',
      icon: 'pi pi-music',
      description: "Separated tracks scraped from recent RDJ live gigs. Scraper script available too.",
      colour: 'bg-blue-200',
      id: 'aphexStyle',
      image: 'https://images.seeklogo.com/logo-png/0/1/aphex-twin-logo-png_seeklogo-9672.png',
      imageId: 'aphex_image'
    },
    {
      title: 'TouchDesigner networks',
      route: null,
      url: 'https://drive.google.com/drive/folders/1AJNWhz4zqJ9DY8gXCiL01VtGhCZVHh5S?usp=drive_link',
      icon: 'pi pi-music',
      description: "Touchdesigner networks for the visuals i've done.",
      colour: 'bg-blue-200',
      id: 'tdStyle',
      image: 'https://derivative-devforum-backups.s3.us-east-2.amazonaws.com/static/manifest512.png',
      imageId: 'td_image'
    }
  ];

  constructor() { }

}
export interface Page { 
  title: string;
  route: string|null;
  url:string|null
  icon: string;
  description: string;
  colour: string;
  id:string;
  image: string;
  imageId: string;
}
