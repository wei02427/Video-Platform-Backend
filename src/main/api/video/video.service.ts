import VideoModel from "../../../model/video.model";
import encodeMultiBitrate, { Bitrate } from "../../../utils/ffmpeg";
import tmp from 'tmp';
import encodeDash from "../../../utils/mp4box";
import Bucket from "../../../database/bucket";
import fs from 'fs';
import path from "path";
export class VideoService {
    private videoModel = new VideoModel();


    public async upload(title: string, folderName: string, data: Buffer) {

        const bitrates = [Bitrate.LOW_235K_240P];

        const encodeMultiBitrateCB = (files: [tmp.FileResult[], tmp.FileResult]) => {


            const [videosTmp, audioTmp] = files;

            const encodeDashCB = (code: number | null) => {
                audioTmp.removeCallback();
                videosTmp.forEach(video => video.removeCallback());

                if (code === 0) {

                    const videoPath = path.join(__dirname, '../../../../videos', folderName);
                    fs.readdirSync(videoPath).forEach(filename => {
                        console.log(filename);
                        this.videoModel.uploadFile(path.join(videoPath, filename), folderName, filename);
                    })
                }
            };


            const videosSource = videosTmp.map(((video, index) => ({ path: video.name, bitrate: bitrates[index].toString() })));



            encodeDash(videosSource, audioTmp.name, folderName, encodeDashCB);

        };

        encodeMultiBitrate(data, bitrates, encodeMultiBitrateCB);


    }

    public async get(hash: string) {
        return await this.videoModel.getVideo(hash);
    }

}

