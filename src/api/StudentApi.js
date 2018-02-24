/**
 * Created by superpchelka on 23.02.18.
 */
import {ChainStore, FetchChain, TransactionBuilder} from "bitsharesjs";
import {apiCall} from './BlockchainApi';
import {BitsharesApiExtends} from './BitsharesApiExtends'
import {utSchoolTokenTicket, utSchoolTokenSession, utSchoolTokenGrade, utSchoolToken, utSchoolAccount} from '../common/Configs'


class StudentApi{

    constructor(account){
        this.account=account;
        this.feeAsset='bts';
    }

    @apiCall
    applyForLecture(lectureAccount){
        return Promise.all([
            FetchChain("getAccount", lectureAccount),
            FetchChain("getAccount", this.account.name),
            FetchChain("getAsset", utSchoolTokenTicket),
            FetchChain("getAsset", this.feeAsset)
        ]).then((res)=> {
            let [leactureAccount, studentAccount, sendAsset, feeAsset] = res;
            let tr = new TransactionBuilder();

            tr.add_type_operation("transfer", {
                fee: {
                    amount: 0,
                    asset_id: feeAsset.get("id")
                },
                from: leactureAccount.get("id"),
                to: studentAccount.get("id"),
                amount: { asset_id: sendAsset.get("id"), amount: 1},
            } );

            tr.propose({
                fee_paying_account: studentAccount.get("id"),
            });

            tr.set_required_fees().then(() => {
                tr.add_signer(this.account.privateKey, this.account.privateKey.toPublicKey().toPublicKeyString());
                console.log("serialized transaction:", tr.serialize());
                tr.broadcast()
            });
        });
    }

    @apiCall
    getLectureState(lectureAccount){
        return new Promise((resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", [utSchoolTokenTicket, utSchoolTokenSession, utSchoolTokenGrade])
            ]).then((res)=> {
                let [lectureAccount, studentAccount, assets] = res;
                lectureAccount = lectureAccount.get('id');
                studentAccount = studentAccount.get('id');

                let assetsMap = {};
                for(let asset of assets)
                    assetsMap[asset.get('id')] = {
                        'id': asset.get('id'),
                        'symbol': asset.get('symbol')
                    };

                BitsharesApiExtends.fetchHistory(lectureAccount, 100, 'transfer').then((operations)=>{
                    for(let operation of operations){
                        let transferData=operation.op[1];
                        if(transferData.from == lectureAccount
                            && transferData.to == studentAccount
                            && assetsMap[transferData.amount.asset_id]){
                            assetsMap[transferData.amount.asset_id].exists = true;
                        }
                    }
                    resolve(assetsMap);
                });
            });
        });
    }


    @apiCall
    getLectures(resolve){
        let lecturesList = [];
        return new Promise( (resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", utSchoolAccount),
                FetchChain("getAsset", utSchoolToken)
            ]).then((res)=> {
                let [utSchoolAccount, utSchoolAsset] = res;
                utSchoolAccount = utSchoolAccount.get('id');
                utSchoolAsset = utSchoolAsset.get('id');
                BitsharesApiExtends.fetchHistory(utSchoolAccount, 100, 'transfer').then((operations)=>{
                    let lecturesAccountsList = [];
                    for(let operation of operations){
                        let transferData=operation.op[1];

                        if(transferData.from == utSchoolAccount
                            && transferData.amount.asset_id == utSchoolAsset){
                            lecturesAccountsList.push(transferData.to);
                        }
                    }

                    if(lecturesAccountsList.length == 0) {
                        resolve(lecturesList);
                        return;
                    }

                    FetchChain("getAccount", lecturesAccountsList).then((lectures)=>{
                        lectures = lectures.toJS();
                        let teachersIds = [];
                        for(let lectureData of lectures){
                            lecturesList.push({
                                'id': lectureData.id,
                                'name': lectureData.name,
                                'teacher': {
                                    'id': lectureData.active.account_auths[0][0]
                                }
                            });

                            teachersIds.push(lectureData.active.account_auths[0][0]);
                        }

                        FetchChain("getAccount", teachersIds).then((teachers)=>{
                            let teachersMap = {};
                            teachers = teachers.toJS();
                            for(let teacher of teachers)
                                teachersMap[teacher.id] = teacher;

                            let lecturePromiseList = [];
                            for(let lecture of lecturesList) {
                                lecture.teacher.name = teachersMap[lecture.teacher.id].name;
                                lecturePromiseList.push(this.getLectureState(lecture.name))
                            }

                            Promise.all(lecturePromiseList).then((lecturesStates)=>{
                                for(let i=0;i<lecturesList.length;i++)
                                    lecturesList[i].states = lecturesStates[i];

                                resolve(lecturesList);
                            });
                        });
                    });
                });
            });
        });
    }


}

export {StudentApi}