/**
 * Created by superpchelka on 23.02.18.
 */

import {Account} from '../common/Account'
import {StudentApi} from "./StudentApi";
import {TeacherApi} from "./TeacherApi";
import {BlockchainApi} from "./BlockchainApi"
import assert from "assert";
import {FetchChain, TransactionBuilder, ChainValidation, Login} from "bitsharesjs";
import {utSchoolFaucet} from "../common/Configs"


class Api{


    /**
     * @desc initialize api for interacting with blockchain
     * @param nodeUrl - url of node for connection
     * @param accountName - name of bitshares account
     * @param [privateKey] - private of bitshares account (optional)
     * @return api object
     */
    static init(nodeUrl, accountName, privateKey){
        let api = new Api(accountName, privateKey);
        return new Promise((resolved, rejected)=>{
            BlockchainApi.init(nodeUrl).then(()=>resolved(api)).catch(rejected);
        });
    }

    /**
     * @desc generate public keys and private keys by login and password
     * @param login - login of the bitshares account
     * @param password - password of the bitshares account
     * @return Object{
     *      pubKeys: {active, owner, memo},
     *      privKeys: {active, owner, memo}
     * }
     */
    static generateKeys(login, password){
        return Login.generateKeys(login, password)
    }

    constructor(accountName, privateKey){
        this.account = new Account(accountName, privateKey);
        this.studentApi=new StudentApi(this.account);
        this.teacherApi=new TeacherApi(this.account);
    }

    /**
     * @desc set private key of current user
     * @param privateKey - private key
     */
    setPrivateKey(privateKey){
        this.account.privateKey = privateKey;
    }

    /**
     * @desc register user by login, password
     * @param login - name of the new bitshares account
     * @param password - password for generating bitshares keys
     * @return serialized transaction
     */
    register(
        login,
        password,
    ) {

        ChainValidation.required(utSchoolFaucet, "registrar_id");

        let keys = Api.generateKeys(login, password);

        return new Promise((resolve, reject) => {
            return Promise.all([
                FetchChain("getAccount", utSchoolFaucet),
            ]).then((res)=> {
                let [ chain_registrar ] = res;

                assert(chain_registrar, `Invalid faucet account ${utSchoolFaucet}`);

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
                    resolve(tr.serialize());
                });
            });
        });
    }
}

export {Api}