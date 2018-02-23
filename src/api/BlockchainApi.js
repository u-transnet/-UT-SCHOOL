/**
 * Created by superpchelka on 23.02.18.
 */

import {ChainStore} from "bitsharesjs";
import {Apis} from "bitsharesjs-ws";

function command(target, key, descriptor) {
    const original = descriptor.value;
    if (typeof original === 'function')
        descriptor.value = function(...args) {
            return BlockchainApi.runCommand().then(()=>{
                return original.apply(this, args);
            })
        };
    return descriptor;
}

class BlockchainApi{

    static init(nodeUrl){
        return new Promise((resolved, rejected) => {
            Apis.instance(nodeUrl, true)
                .init_promise.then((res) => {
                console.log("connected to:", res[0].network_name, "network");
                resolved();
            });
        });
    }


    static runCommand(){
        return ChainStore.init();
    }

}

export {BlockchainApi, command}