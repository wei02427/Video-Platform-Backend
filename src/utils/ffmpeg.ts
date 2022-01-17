import Ffmpeg from 'fluent-ffmpeg';
import tmp from 'tmp';
import fs from 'fs';
import _ from 'lodash';

import path from "path";

export const enum Bitrate {
    LOW_235K_240P = 235,
    MIDDLE_1050k_480P = 1050,
    HIGH_4300K_1080P = 4300
};

const scale = {
    [Bitrate.HIGH_4300K_1080P]: '1080',
    [Bitrate.MIDDLE_1050k_480P]: '480',
    [Bitrate.LOW_235K_240P]: '240'
}



export default function encodeMultiBitrate(data: Buffer, bitrates: Bitrate[], updateProgress: (progress: number, step: 'encodeMultiBitrate' | 'encodeDash' | 'upload') => void) {

    return new Promise<[tmp.FileResult[], tmp.FileResult]>((resolve, reject) => {
        // 紀錄每個步驟完成狀態
        const stepsFinish = Array<boolean>(bitrates.length + 1).fill(false);


        // video 和 videos 暫存檔案
        const audioTmp = tmp.fileSync({ postfix: '.m4a' });
        const videosTmp: tmp.FileResult[] = [];


        let frames: number;
        let currentFrames = Array<number>(bitrates.length).fill(0);;

        tmp.file(async function _tempFileCreated(err: any, tmpPath: any, fd: any, cleanupTmpCallback: () => void) {


            function setStepFinish(step: number) {

                stepsFinish[step] = true;

                if (stepsFinish.every((val) => val === true)) {
                    cleanupTmpCallback();
                    resolve([videosTmp, audioTmp]);
                }

            }

            if (err) reject(err);

            fs.appendFile(tmpPath, data, () => {

                console.log('File: ', tmpPath);
                console.log('Filedescriptor: ', fd);


                // tmpPath = path.join("../../..", tmpPath);
                // Ffmpeg.setFfmpegPath(__dirname + '/ffprobe');
                Ffmpeg.ffprobe(tmpPath,
                    [
                        // '-v error',
                        // '-select_streams v:0',
                        '-count_packets',
                        // '-show_entries stream=nb_read_packets',
                        // '-of csv=p=0'
                    ], function (err, metadata) {
                        console.log(err);
                        frames = _.toNumber(metadata.streams[0].nb_read_packets) * bitrates.length;
                        console.log(frames);
                    });


                // 產生不同解析度影片
                for (const [index, bitrate] of bitrates.entries()) {


                    videosTmp.push(tmp.fileSync({ postfix: '.mp4' }));


                    Ffmpeg(tmpPath)
                        // .setFfmpegPath(__dirname + '/ffmpeg')
                        .videoCodec('libx264').outputOptions([
                            '-y',
                            // '-r 24',
                            `-x264opts keyint=48:min-keyint=48:no-scenecut`,
                            `-vf scale=-2:${scale[bitrate]}`,
                            `-b:v ${bitrate}k`,
                            `-maxrate ${bitrate}k`,
                            '-movflags faststart',
                            '-bufsize 8600k',
                            '-profile:v main',
                            '-preset fast',
                            '-progress pipe:2'
                        ]).on('stderr', (info: string) => {

                            if (_.startsWith(info, 'frame=') && !_.includes(info, 'fps')) {

                                currentFrames[index] = _.toNumber(info.split('=')[1]);
                                updateProgress(_.toInteger(_.sum(currentFrames) / frames * 100), 'encodeMultiBitrate');
                                // console.log(index, ' ', currentFrames[index], ' ', progress.encodeMultiBitrate);
                            }

                        }).on('end', (_: any) => {

                            // console.log('finish ' + bitrate);
                            setStepFinish(index);

                        }).on('error', (err, stdout, stderr) => {
                            reject(err);
                        }).noAudio().save(videosTmp[index].name);





                }

                // 抽出音檔
                Ffmpeg({ source: tmpPath })
                    // .setFfmpegPath(__dirname + '/ffmpeg')
                    .outputOptions([
                        '-y',
                        '-map 0:1',
                        `-vn`,
                        `-c:a aac`,
                        `-b:a 128k`,
                        `-ar 48000`,
                        '-ac 2'
                    ]).on('end', (_: any) => {
                        console.log('finish audio');

                        setStepFinish(bitrates.length);

                    }).on('error', (err, stdout, stderr) => {
                        reject(err);
                    })
                    .save(audioTmp.name)

            });
        });

    });
}