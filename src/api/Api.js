/**
 * Created by superpchelka on 23.02.18.
 */

import {Account} from '../common/Account'
import {StudentApi} from "./StudentApi";
import {TeacherApi} from "./TeacherApi";
import {BlockchainApi, apiCall} from "./BlockchainApi"
import {FetchChain, TransactionBuilder, ChainValidation, Login} from "bitsharesjs";
import {utSchoolFaucet} from "../common/Configs"


class Api{


    static init(nodeUrl, accountName, privateKey){
        let api = new Api(accountName, privateKey);
        return new Promise((resolved, rejected)=>{
            BlockchainApi.init(nodeUrl).then(()=>{
                resolved(api);
            });
        });
    }

    constructor(accountName, privateKey){
        this.account = new Account(accountName, privateKey);
        this.studentApi=new StudentApi(this.account);
        this.teacherApi=new TeacherApi(this.account);
    }

    generateKeys(login, password){
       return Login.generateKeys(login, password)
    }


    @apiCall
    register(
        login,
        password,
    ) {

        ChainValidation.required(utSchoolFaucet, "registrar_id");

        let keys = this.generateKeys(login, password);

        return new Promise((resolve, reject) => {
            return Promise.all([
                FetchChain("getAccount", utSchoolFaucet),
            ]).then((res)=> {
                let [ chain_registrar ] = res;

                let tr = new TransactionBuilder();
                tr.add_type_operation("account_create", {
                    fee: {
                        amount: 0,
                        asset_id: 0
                    },
                    "registrar": chain_registrar.get("id"),
                    "referrer": chain_registrar.get("id"),
                    "name": login,
                    "owner": {
                        "weight_threshold": 1,
                        "account_auths": [],
                        "key_auths": [[ keys.pubKeys.owner, 1 ]],
                        "address_auths": []
                    },
                    "active": {
                        "weight_threshold": 1,
                        "account_auths": [ ],
                        "key_auths": [[ keys.pubKeys.active, 1 ]],
                        "address_auths": []
                    },
                    "options": {
                        "memo_key": keys.pubKeys.memo,
                        "voting_account": "1.2.5",
                        "num_witness": 0,
                        "num_committee": 0,
                        "votes": [ ]
                    }
                });
                tr.set_required_fees().then(() => {
                    console.log("serialized transaction:", tr.serialize());
                    tr.broadcast();
                });
            });
        });
    }
}

export {Api}