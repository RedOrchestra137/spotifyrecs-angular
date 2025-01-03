import { environment } from "./src/environments/environment"
export class Routes{
    static WebBaseSpotify = environment.apiUrl
    static Spotify = {
        Authenticate: this.WebBaseSpotify+"users/getAuthURL",
        CheckAuthorized: this.WebBaseSpotify+"isAuthorized",
        CheckCode: this.WebBaseSpotify+"users/checkCode",
        PrepPlaylists: this.WebBaseSpotify+"playlists/prepPlaylists",
        GetUserPlaylists: this.WebBaseSpotify+"playlists/getUserPlaylists",
        GetUser: this.WebBaseSpotify+"users/getUser",
        GetUserSeeds: this.WebBaseSpotify+"getSeeds",
        GenerateTracks(amount:number){return (Routes.WebBaseSpotify+"playlists/generatePlaylist/"+amount.toString())},
        GetPlaylist(id:string):string{return (Routes.WebBaseSpotify+"playlists/getPlaylist/"+id)},
        CreatePlaylist: this.WebBaseSpotify+"playlists/createPlaylist",
        GetSavedTracks: this.WebBaseSpotify+"tracks/getSavedTracks",
        EmptyPlaylist(id:string){return Routes.WebBaseSpotify+"playlists/emptyPlaylist/"+id},
        Logout: this.WebBaseSpotify+"users/logout",
        SearchPlaylists: this.WebBaseSpotify+"search/searchPlaylist",
        GetYoutubeUrl: this.WebBaseSpotify+"youtube",
        AddTrackToSaved:this.WebBaseSpotify+"tracks/addTracksToSaved/",
        RemoveTrackFromSaved:this.WebBaseSpotify+"tracks/removeTracksFromSaved/",
        CheckUserQuestion(id:string){ return Routes.WebBaseSpotify+"checkUserQuestion/"+id},
        CheckUserAnswer(id:string){ return Routes.WebBaseSpotify+"checkUserAnswer/"+id},
        PublicLogin: this.WebBaseSpotify+"publicLogin",
        ChangePassword:this.WebBaseSpotify+"passwordChange",
        TransferToYoutube: this.WebBaseSpotify+"transferToYoutube",
        AddUserFavourites: this.WebBaseSpotify+"playlists/addUserFavourites",
        GetYoutubeMp3(artistName:string, trackName:string, trackLength:string){return Routes.WebBaseSpotify+"youtubeMp3"+"?a="+artistName+"&t="+trackName+"&l="+trackLength} ,
        UpdateFavourites: this.WebBaseSpotify+"playlists/updateFavourites",
        GetRecordingFromSpotify:this.WebBaseSpotify+"api/musicbrainz/recording/fromSpotify",
        Progress: this.WebBaseSpotify+"progress",
        DeletePlaylist(id:string){return Routes.WebBaseSpotify+"playlists/deletePlaylist/"+id}
    }
    static PostGres = {
        USERS:this.WebBaseSpotify+"users",
        TRACKS:this.WebBaseSpotify+"tracks",
        ARTISTS:this.WebBaseSpotify+"artists",
        ById(id:string,base:string):string{return (base+id)},
        ByUser(userId:string,base:string):string{return (base+"/user/"+userId)},
        ByArtist(artistId:string,base:string):string{return (base+"/artist/"+artistId)},
        UserRelation(base:string):string{return (base+"/user")}
    }
    static Localization = {
        GetGeoLocation: "https://geolocation-db.com/json/"
    }

}