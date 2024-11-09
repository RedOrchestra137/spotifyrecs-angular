import { Injectable, OnInit } from '@angular/core';
import { GeoLocationResponse } from '../spotify-interface/response objects/TokenResponse';
import { HttpClient } from '@angular/common/http';
import { Routes } from '../../routes';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService{
  UserGeoLocation:GeoLocationResponse|undefined
  constructor(private http:HttpClient) { 
  }

  async getGeoLocation(){
    await this.http.get<GeoLocationResponse>(Routes.Localization.GetGeoLocation).subscribe
    (
      (response)=>{
        this.UserGeoLocation = response
      },
      (error)=>{
        console.log(error)
      }
    )
  }

}
