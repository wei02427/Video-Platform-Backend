import VideoModel from "../../../model/video.model";


export class VideoService {
    private videoModel = new VideoModel();


    public async upload(title: string, filename: string, data: Buffer) {
        this.videoModel.addVideo(title, filename, data);
    }

}