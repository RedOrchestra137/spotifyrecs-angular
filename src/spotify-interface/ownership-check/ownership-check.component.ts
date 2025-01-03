import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { SpotifyAuthService } from '../auth/spotify-auth.service';
import { MessageService } from 'primeng/api';
import { Routes } from '../../../routes';
import { firstValueFrom } from 'rxjs';
import { ImportsModule } from '../../app/imports';

@Component({
  selector: 'app-ownership-check',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './ownership-check.component.html',
  styleUrl: './ownership-check.component.css'
})
export class OwnershipCheckComponent {
  @Input() ownerShipCode:string|undefined
  tempPassword:string|undefined
  @Input() authName!:string
  @Input() sessionId:string|undefined
  @Output() ownershipCallback:EventEmitter<any> = new EventEmitter()

  constructor(private http:HttpClient, private authService:SpotifyAuthService, private messageService: MessageService) {
    
  }
  ownerShipCheckFailed(){
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not verify ownership, please try again' });
  }
  async verifyAccountOwnership():Promise<boolean>{
    let ans = await firstValueFrom(this.http.post(Routes.Spotify.CheckUserAnswer(this.authName), {
      "session_id":this.sessionId,
      "code":this.ownerShipCode
    })).then((response:any)=>{
      this.tempPassword = response['password'];
      this.ownershipCallback.emit()
      return true}).catch((error)=>{
        this.ownerShipCheckFailed()
        return false})
    return ans
  }
}
