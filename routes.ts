import { environment } from "./src/environments/environment"
export class Routes{
    static WebBaseSpotify = environment.apiUrl
    static Spotify = {
        Authenticate: this.WebBaseSpotify+"getAuthURL",
        CheckAuthorized: this.WebBaseSpotify+"isAuthorized",
        CheckCode: this.WebBaseSpotify+"checkCode",
        PrepPlaylists: this.WebBaseSpotify+"prepPlaylists",
        GetUserPlaylists: this.WebBaseSpotify+"getUserPlaylists",
        GetUser: this.WebBaseSpotify+"getUser",
        GetUserSeeds: this.WebBaseSpotify+"getSeeds",
        GenerateTracks(amount:number){return (Routes.WebBaseSpotify+"generatePlaylist/"+amount.toString())},
        GetPlaylist(id:string):string{return (Routes.WebBaseSpotify+"getPlaylist/"+id)},
        CreatePlaylist: this.WebBaseSpotify+"createPlaylist",
        GetSavedTracks: this.WebBaseSpotify+"getSavedTracks",
        EmptyPlaylist(id:string){return Routes.WebBaseSpotify+"emptyPlaylist/"+id},
        Logout: this.WebBaseSpotify+"logout",
        SearchPlaylists: this.WebBaseSpotify+"searchPlaylist",
        GetYoutubeUrl: this.WebBaseSpotify+"youtube",
        AddTrackToSaved:this.WebBaseSpotify+"addTracksToSaved/",
        RemoveTrackFromSaved:this.WebBaseSpotify+"removeTracksFromSaved/",
        CheckUserQuestion(id:string){ return Routes.WebBaseSpotify+"checkUserQuestion/"+id},
        CheckUserAnswer(id:string){ return Routes.WebBaseSpotify+"checkUserAnswer/"+id},
        PublicLogin: this.WebBaseSpotify+"publicLogin",
        ChangePassword:this.WebBaseSpotify+"passwordChange",
        TransferToYoutube: this.WebBaseSpotify+"transferToYoutube",
        AddUserSavedPlaylist: this.WebBaseSpotify+"addUserSavedPlaylist",
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