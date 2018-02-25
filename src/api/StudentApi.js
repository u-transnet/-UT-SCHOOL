/**
 * Created by superpchelka on 23.02.18.
 */
import {ChainStore, FetchChain, TransactionBuilder} from "bitsharesjs";
import {BitsharesApiExtends} from './BitsharesApiExtends'
import {utSchoolTokenTicket, utSchoolTokenSession, utSchoolTokenGrade, utSchoolToken, utSchoolAccount} from '../common/Configs'
import assert from "assert";



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
    applyForLecture(lectureAccount){
        return new Promise((resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", utSchoolTokenTicket),
                FetchChain("getAsset", this.feeAsset)
            ]).then((res)=> {
                let [cLectureAccount, cStudentAccount, sendAsset, feeAsset] = res;

                assert(cLectureAccount !== null, `Invalid lecture account ${lectureAccount}`);
                assert(cStudentAccount !== null, `Invalid student account ${this.account.name}`);
                assert(sendAsset !== null, `Invalid ticket token ${utSchoolTokenTicket}`);
                assert(feeAsset !== null, `Invalid fee asset name ${this.feeAsset}`);

                let tr = new TransactionBuilder();
                tr.add_type_operation("transfer", {
                    fee: {
                        amount: 0,
                        asset_id: feeAsset.get("id")
                    },
                    from: cLectureAccount.get("id"),
                    to: cStudentAccount.get("id"),
                    amount: { asset_id: sendAsset.get("id"), amount: 1},
                } );

                tr.propose({
                    fee_paying_account: cStudentAccount.get("id"),
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
    getLectureStats(lectureAccount){
        return new Promise((resolve, reject) => {
            let schoolTokens = [utSchoolTokenTicket, utSchoolTokenSession, utSchoolTokenGrade];
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", schoolTokens)
            ]).then((res)=> {
                let [cLectureAccount, studentAccount, assets] = res;

                assert(cLectureAccount !== null, `Invalid lecture account ${cLectureAccount}`);
                assert(studentAccount !== null, `Invalid student account ${this.account.name}`);
                assert(assets[0] !== null, `Invalid ticket token ${schoolTokens[0]}`);
                assert(assets[1] !== null, `Invalid session token ${schoolTokens[1]}`);
                assert(assets[2] !== null, `Invalid grade token ${schoolTokens[2]}`);


                let lectureAccountId = cLectureAccount.get('id');
                let studentAccountId = studentAccount.get('id');

                let assetsMap = {};
                for(let asset of assets)
                    assetsMap[asset.get('id')] = {
                        'id': asset.get('id'),
                        'symbol': asset.get('symbol'),
                        'accepted': false,
                        'balance': ChainStore.getAccountBalance(cLectureAccount, asset.get('id'))
                    };

                BitsharesApiExtends.fetchHistory(lectureAccountId, 100, 'transfer').then((operations)=>{
                    for(let operation of operations){
                        let transferData=operation.op[1];
                        if(transferData.from === lectureAccountId
                            && transferData.to === studentAccountId
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
    getLectures(){
        let lecturesList = [];
        return new Promise( (resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", utSchoolAccount),
                FetchChain("getAsset", utSchoolToken)
            ]).then((res)=> {
                let [cUtSchoolAccount, cUtSchoolAsset] = res;

                assert(cUtSchoolAccount !== null, `Invalid utSchoolAccount ${utSchoolAccount}`);
                assert(cUtSchoolAsset !== null, `Invalid utSchoolToken ${utSchoolToken}`);

                cUtSchoolAccount = cUtSchoolAccount.get('id');
                cUtSchoolAsset = cUtSchoolAsset.get('id');
                BitsharesApiExtends.fetchHistory(cUtSchoolAccount, 100, 'transfer').then((operations)=>{
                    let lecturesAccountsList = [];
                    for(let operation of operations){
                        let transferData=operation.op[1];

                        if(transferData.from === cUtSchoolAccount
                            && transferData.amount.asset_id === cUtSchoolAsset){
                            lecturesAccountsList.push(transferData.to);
                        }
                    }

                    if(lecturesAccountsList.length === 0) {
                        resolve(lecturesList);
                        return;
                    }

                    FetchChain("getAccount", lecturesAccountsList).then((lectures)=>{
                        lectures = lectures.toJS();
                        let teachersIds = [];
                        let index = -1;
                        for(let lectureData of lectures){
                            index++;
                            if(!lectureData){
                                console.log(`Have no information about lecture with id ${lecturesAccountsList[index]}`);
                                continue;
                            }
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
                            let index = -1;
                            teachers = teachers.toJS();
                            for(let teacher of teachers) {
                                index++;
                                if(!teacher){
                                    console.log(`Have no information about teacher with id ${teachersIds[index]}`);
                                    continue;
                                }
                                teachersMap[teacher.id] = teacher;
                            }

                            let lectureStatePromiseList = [];
                            for(let lecture of lecturesList) {
                                let teacherData = teachersMap[lecture.teacher.id];
                                if(teacherData)
                                    lecture.teacher.name = teacherData.name;
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