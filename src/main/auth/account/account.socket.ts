import _ from 'lodash';
import SocketBase from '../../../base/socket.base';
import Autobind from '../../../utils/autobind';
import { SessionSocket } from '../../../model/account.model';

export default class AccountSocket extends SocketBase {



    @Autobind
    public InitSocketEvent(socket: SessionSocket) {
        this.userLogin(socket);
        this.userDisconnect(socket);
    }


    private userLogin(socket: SessionSocket) {

        socket.on('new_socket', (() => {


            const uid = socket.request.session.passport?.user;

            // 如過使用者已登入 socket id 才紀錄
            if (!_.isUndefined(uid)) {
                console.log('user connected   ', socket.id);
                this.addUserSocketId(uid, socket.id);
            }

        }).bind(this));
    }


    private userDisconnect(socket: SessionSocket) {

        socket.on('disconnect', (() => {

            console.log('user disconnected   ', socket.id);
            this.deleteSocketId(socket.id);


        }).bind(this));
    }


}