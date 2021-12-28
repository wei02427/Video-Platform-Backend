import { spawn } from 'child_process';
import Bucket from '../database/bucket';
import fs from 'fs';
import path from 'path';

export default function encodeDash(videos: { path: string, bitrate: string }[], audio: string, outputFolder: string, callback: (code: number | null) => void) {

    const videoSource: string[] = [];

    for (const video of videos) {
        videoSource.push(`${video.path}#video:id=${video.bitrate}p`);
    }



    const child = spawn(`MP4Box`, [
        '-dash', '4000',
        '-frag', '4000',
        '-rap',
        '-segment-name', 'segment_$RepresentationID$_',
        '-fps', '24',
        ...videoSource,
        `${audio}#audio:id=English:role=main`,
        '-out', path.join(__dirname, '../../videos') + `/${outputFolder}/playlist.mpd`
    ])



    child.on('exit', (code) => {
        console.log(`Child process exited with code ${code}`);
        callback(code);

    });
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

}