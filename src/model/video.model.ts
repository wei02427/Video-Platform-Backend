import Bucket from "../database/bucket";
import Database from "../database/database";
import crypto from 'crypto';
import fs from 'fs';
import stream from "stream";

export interface Video {
    ID?: number;
    title: string;
    hash: string;
}



export default class VideoModel {
    private Videos = (Database.getInstance())<Video>('Videos');
    private bucket = Bucket.getInstance();


    public async addVideo(title: string, filename: string, data: Buffer) {

        const hashFileName = crypto.createHash('md5').update(title).digest('hex');
        const file = this.bucket.file(hashFileName + '.' + filename.split('.').slice(-1)[0]);


        const readStream = new stream.PassThrough();
        readStream.end(data);



        await readStream.pipe(file.createWriteStream()).on('finish', () => {

            console.log(' The file upload is complete')
        });

        return await this.Videos.clone().insert({ title, hash: hashFileName });
    }

    public async getVideos(id: number) {
        return await this.Videos.clone().where('ID', '=', id);
    }
};