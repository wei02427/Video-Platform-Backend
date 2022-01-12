import io from 'socket.io';
import http from 'http';
import _ from 'lodash';
import SocketBase from '../../../base/socket.base';
import Autobind from '../../../utils/autobind';

export default class AccountSocket extends SocketBase {



    @Autobind
    public InitSocketEvent(socket: io.Socket) {
        this.userLogin(socket);
        this.userDisconnect(socket);
    }


    private userLogin(socket: io.Socket) {

        socket.on('new_socket', ((info: any) => {
            const { uid, socketId } = info;
            this.addUserSocketId(uid, socketId);
            console.log(this.getUsers());
        }).bind(this));
    }


    private userDisconnect(socket: io.Socket) {

        socket.on('disconnect', (() => {
            console.log('user disconnected   ', socket.id);
            this.deleteSocketId(socket.id);
            console.log(this.getUsers());

        }).bind(this));
    }


}