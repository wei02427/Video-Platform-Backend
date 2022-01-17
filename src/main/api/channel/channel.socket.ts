import io from 'socket.io';
import http from 'http';
import _ from 'lodash';
import SocketBase from '../../../base/socket.base';
import Autobind from '../../../utils/autobind';

export default class ChannelSocket extends SocketBase {



    @Autobind
    public InitSocketEvent(socket: io.Socket) {

    }

    public emitUploadProgress(uid: number, progress: number) {
        console.log(progress)
        SocketBase.socketIo.to(this.getSocketsByUid(uid))
            .emit('upload_progress', progress);
    }

    public emitUploadFinish(uid: number, vid: string) {
        SocketBase.socketIo.to(this.getSocketsByUid(uid))
            .emit('upload_finish', vid);
    }



}