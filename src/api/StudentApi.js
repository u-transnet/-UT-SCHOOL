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
        this.feeAsset='BTS';
    }

    /**
     * @desc apply current user for the lecture
     * @param lectureAccount - name of the bitshares lecture account
     * @return serialized transaction
     */
    @apiCall
    applyForLecture(lectureAccount){
        return new Promise((resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", utSchoolTokenTicket),
                FetchChain("getAsset", this.feeAsset)
            ]).then((res)=> {
                let [lectureAccount, studentAccount, sendAsset, feeAsset] = res;
                let tr = new TransactionBuilder();

                tr.add_type_operation("transfer", {
                    fee: {
                        amount: 0,
                        asset_id: feeAsset.get("id")
                    },
                    from: lectureAccount.get("id"),
                    to: studentAccount.get("id"),
                    amount: { asset_id: sendAsset.get("id"), amount: 1},
                } );

                tr.propose({
                    fee_paying_account: studentAccount.get("id"),
                });

                tr.set_required_fees().then(() => {
                    tr.add_signer(this.account.privateKey, this.account.privateKey.toPublicKey().toPublicKeyString());
                    tr.broadcast().catch(reject);
                    resolve(tr.serialize());
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * @desc collect information about lecture
     * @param lectureAccount - name of the bitshares lecture account
     * @return return map of stats by tokens UTSchoolTokenTicket, UTSchoolTokenSession, UTSchoolTokenGrade
     * stat: {
     *      id - id of the token,
     *      symbol - name of the token
     *      accepted - use was accepted to lecture
     *      balance - balance of the particular token on the account
     * }
     */
    @apiCall
    getLectureStats(lectureAccount){
        return new Promise((resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", [utSchoolTokenTicket, utSchoolTokenSession, utSchoolTokenGrade])
            ]).then((res)=> {
                let [lectureAccount, studentAccount, assets] = res;
                let lectureAccountId = lectureAccount.get('id');
                let studentAccountId = studentAccount.get('id');

                let assetsMap = {};
                for(let asset of assets)
                    assetsMap[asset.get('id')] = {
                        'id': asset.get('id'),
                        'symbol': asset.get('symbol'),
                        'accepted': false,
                        'balance': ChainStore.getAccountBalance(lectureAccount, asset.get('id'))
                    };

                BitsharesApiExtends.fetchHistory(lectureAccountId, 100, 'transfer').then((operations)=>{
                    for(let operation of operations){
                        let transferData=operation.op[1];
                        if(transferData.from == lectureAccountId
                            && transferData.to == studentAccountId
                            && assetsMap[transferData.amount.asset_id]){
                            assetsMap[transferData.amount.asset_id].accepted = true;
                        }
                    }
                    resolve(assetsMap);
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * @desc return all available lectures for current user
     * @return list of lectures
     * lecture: {
     *      id - id of the bitshares lecture account
     *      name - name of the bitshares lecture account
     *      teacher: {
     *          id - id of the bitshares teacher account
     *          name - id of the bitshares teacher account
     *      }
     *      stats - result from getLectureStats
     * }
     */
    @apiCall
    getLectures(){
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

                            let lectureStatePromiseList = [];
                            for(let lecture of lecturesList) {
                                lecture.teacher.name = teachersMap[lecture.teacher.id].name;
                                lectureStatePromiseList.push(this.getLectureStats(lecture.name));
                            }

                            Promise.all(lectureStatePromiseList).then((lecturesStates)=>{
                                for(let i=0;i<lecturesList.length;i++)
                                    lecturesList[i].stats = lecturesStates[i];

                                resolve(lecturesList);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }


}

export {StudentApi}