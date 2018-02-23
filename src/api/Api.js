/**
 * Created by superpchelka on 23.02.18.
 */

import {Account} from '../common/Account'
import {StudentApi} from "./StudentApi";
import {TeacherApi} from "./TeacherApi";
import {BlockchainApi} from "./BlockchainApi"

class Api{


    static init(nodeUrl, accountName, privateKey){
        this.account = new Account(accountName, privateKey);

        this.studentApi=new StudentApi(this.account);
        this.teacherApi=new TeacherApi(this.account);

        return new Promise((resolved, rejected)=>{
            BlockchainApi.init(nodeUrl).then(()=>{
                resolved(this);
            });
        });
    }
}

export {Api}