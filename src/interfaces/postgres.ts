export interface PostGresUser {
    id:string,
    sp_id:string
}
export interface PostGresTrack {
    id:string,
    sp_id:string,
    artist_id:string,
    title:string
}
export interface PostGresArtist {
    id:string,
    sp_id:string,
    name:string
}
export interface PostGresSavedTrack{
    id:string,
    user_id:string,
    track_id:string
}
export interface PostGresSavedArtist{
    id:string,
    user_id:string,
    artist_id:string
}