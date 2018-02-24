/**
 * Created by superpchelka on 23.02.18.
 */

import {TransactionBuilder, ChainStore} from "bitsharesjs";
import {Apis} from "bitsharesjs-ws";

class BlockchainApi{

    static init(nodeUrl){
        return new Promise((resolved, rejected) => {
            Apis.instance(nodeUrl, true)
                .init_promise.then((res) => {
                Promise.all([
                    new TransactionBuilder().update_head_block(),
                    ChainStore.init()
                ]).then(()=>{
                    console.log("connected to:", res[0].network_name, "network");
                    resolved();
                }).catch(rejected);
            }).catch(rejected);
        });
    }
}

export {BlockchainApi}