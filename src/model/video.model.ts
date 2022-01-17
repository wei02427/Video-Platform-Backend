import Bucket from "../database/bucket";
import Database from "../database/database";
import moment from 'moment';
import imageType from 'image-type';
import path from "path";
export interface Video {
    ID?: number;
    title: string;
    description: string;
    hash: string;
    uid: number;
    upload_date: string;
}



export default class VideoModel {
    private Videos = (Database.getInstance())<Video>('Videos');
    private bucket = Bucket.getInstance();


    public async addVideoInfo(userID: number, title: string, description: string, folderName: string) {


        return await this.Videos.clone().insert({ uid: userID, title, description, hash: folderName, upload_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') });
    }

    public uploadDashFile(folderPath: string, folderName: string, filename: string) {

        return this.bucket.upload(path.join(folderPath, folderName, filename), {
            destination: folderName + '/' + filename,
        });

    }

    public uploadVideoCover(cover: Buffer, folderName: string) {

        const file = this.bucket.file(`${folderName}/cover.${imageType(cover)?.ext}`);
        return file.save(cover);

    }


    public async getVideo(hash: string, filename: string) {


        const file = await this.bucket.file(hash + '/' + filename);
        const [metaData] = await file.getMetadata();

        return [file, metaData];

    }

    public async getVideoCover(hash: string) {

        const [files] = await this.bucket.getFiles({ prefix: `${hash}/cover`, delimiter: '/' });

        const [metaData] = await files[0].getMetadata();

        return [files[0], metaData];

    }

    public async getVideos(uid: number) {

        return await this.Videos.clone().select('title', 'hash', 'description', 'upload_date').where('uid', '=', uid);

    }

    public async deleteVideo(hash: string) {

        return new Promise<number>((reslove, reject) => {
            this.bucket.deleteFiles({ prefix: `${hash}/` })
                .then(() => {
                    this.Videos.clone().delete().where('hash', '=', hash)
                        .then(res => reslove(res))
                        .catch(err => reject(err));
                }).catch(err => {
                    reject(err);
                });

        })

    }
};