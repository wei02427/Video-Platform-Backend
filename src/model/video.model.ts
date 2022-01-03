import Bucket from "../database/bucket";
import Database from "../database/database";



import path from "path";


export interface Video {
    ID?: number;
    title: string;
    hash: string;
    uid: number;
}



export default class VideoModel {
    private Videos = (Database.getInstance())<Video>('Videos');
    private bucket = Bucket.getInstance();


    public async addVideoInfo(userID: number, title: string, folderName: string) {


        return await this.Videos.clone().insert({ uid: userID, title, hash: folderName });
    }

    public uploadFile(folderPath: string, folderName: string, filename: string) {

        return this.bucket.upload(path.join(folderPath, folderName, filename), {
            destination: folderName + '/' + filename,
        });

    }





    public async getMPDFile(hash: string) {
        const info = (await this.Videos.clone().select('*').where('hash', '=', hash));

        const mpd = await this.bucket.file(hash + '/' + 'playlist.mpd');
        const [metaData] = await mpd.getMetadata();

        return mpd;
    }

    public async getMP4File(hash: string,filename:string) {
    

        const mp4 = await this.bucket.file(hash + '/' + filename);
        const [metaData] = await mp4.getMetadata();

        return mp4;

    }
};