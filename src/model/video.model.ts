import Bucket from "../database/bucket";
import Database from "../database/database";
import crypto from 'crypto';
import fs from 'fs';
import stream, { Readable } from "stream";


import encodeMultiBitrate, { Bitrate } from "../utils/ffmpeg";


export interface Video {
    ID?: number;
    title: string;
    hash: string;

}



export default class VideoModel {
    private Videos = (Database.getInstance())<Video>('Videos');
    private bucket = Bucket.getInstance();


    public async addVideoInfo(title: string, folderName: string) {

        const hashFileName = crypto.createHash('md5').update(title).digest('hex');


        return await this.Videos.clone().insert({ title, hash: hashFileName });
    }

    public uploadFile(filePath: string, fileName: string, destFileName: string) {

        this.bucket.upload(filePath + '/' + fileName, {
            destination: destFileName + '/' + fileName,
        });

    }





    public async getVideo(hash: string) {
        const info = (await this.Videos.clone().select('*').where('hash', '=', hash));
        console.log(info)
        const video = await this.bucket.file(hash + '.mp4');
        const [metaData] = await video.getMetadata();


        return { info: { ...info[0], size: metaData.size }, video };
    }
};