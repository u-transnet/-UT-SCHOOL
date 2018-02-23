/**
 * Created by superpchelka on 23.02.18.
 */

import {PrivateKey} from "bitsharesjs";

class Account{

    constructor(account, privateKey){
        this.name=account;
        this.privateKey=privateKey?PrivateKey.fromWif(privateKey):'';
    }

}

export {Account}