import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
  } from "@angular/common/http";
  import { Observable } from "rxjs";
  import { Injectable } from "@angular/core";
import { SpotifyAuthService } from "./spotify-auth.service";
  @Injectable()
  export class AuthInterceptService implements HttpInterceptor {
    constructor(private authService: SpotifyAuthService) {}
    intercept(
      req: HttpRequest<any>,
      next: HttpHandler
    ): Observable<HttpEvent<any>> {
        if(this.authService.checkTokens()){
          req = this.setHeaders(req)
        }
        return next.handle(req);        
    }
      setHeaders(req: HttpRequest<any>) {
        let access = sessionStorage.getItem('access_token')??""
        let refresh = sessionStorage.getItem('refresh_token')??""
        let user_id = sessionStorage.getItem('spotify_user_id')??localStorage.getItem('spotify_user_id')??""
        let user_token = localStorage.getItem('user_token')??""
        let last_added = sessionStorage.getItem('last-added-track')??""
        let tracks = sessionStorage.getItem('saved-tracks')??""
        let headers = access?req.headers.set('access-token', access):req.headers
        headers = refresh?headers.set('refresh-token', refresh):headers
        headers = user_id?headers.set('spotify-user-id', user_id):headers
        headers = last_added?headers.set('last-added-track', last_added):headers
        headers = user_token?headers.set('user-token', user_token):headers
        req = req.clone({
          headers: headers
        });
        //check if post request
        if(req.method == "POST" ){
          
          if(!req.body["saved-tracks"] && this.authService.personal ){
            req = req.clone({
              body: {
                ...req.body,
                "saved-tracks": tracks??""
              }
            })
          }
        }
        return req
    }
  }

 