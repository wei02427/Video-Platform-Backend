import VideoModel from "../../../model/video.model";
import encodeMultiBitrate, { Bitrate } from "../../../utils/ffmpeg";
import tmp from 'tmp';
import encodeDash from "../../../utils/mp4box";

import fs from 'fs';
import path from "path";
export class VideoService {
    private videoModel = new VideoModel();


    public async upload(userID: number, title: string, folderName: string, data: Buffer) {

        const bitrates = [Bitrate.LOW_235K_240P];
        const folderPath = path.join(__dirname, '../../../../videos');
        let videosTmp: tmp.FileResult[], audioTmp: tmp.FileResult;

        // 轉成不同畫質
        encodeMultiBitrate(data, bitrates)
            .then((files: [tmp.FileResult[], tmp.FileResult]) => {

                [videosTmp, audioTmp] = files;


                const videosSource = videosTmp.map(((video, index) => ({ path: video.name, bitrate: bitrates[index].toString() })));

                // 產生 dash 檔
                return encodeDash(videosSource, audioTmp.name, folderName);

            }).then(code => {
                // 遍歷資料夾檔案上傳
                return new Promise<void>((resolve, reject) => {
                    audioTmp.removeCallback();
                    videosTmp.forEach(video => video.removeCallback());


                    const mpegDashFiles = fs.readdirSync(path.join(folderPath, folderName));
                    mpegDashFiles.forEach((filename, index) => {

                        this.videoModel.uploadFile(folderPath, folderName, filename)
                            .then(() => {
                                if (index === mpegDashFiles.length - 1)
                                    resolve();
                            })
                            .catch(err => reject(err));

                    });


                })

            }).then(() => {

                this.videoModel.addVideoInfo(userID, title, folderName);
                // 上傳後刪除資料夾
                fs.rmdir(path.join(folderPath, folderName), { recursive: true }, (err) => {
                    if (err) {
                        throw err;
                    }

                    console.log(`${folderName} is deleted!`);
                });

            })
            .catch(err => {
                console.log(err);
            });


    }

    public async getMPD(hash: string) {
        return await this.videoModel.getMPDFile(hash);
    }

    public async getMP4(hash: string, filename: string) {
        return await this.videoModel.getMP4File(hash, filename);
    }

}

