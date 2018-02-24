/**
 * Created by superpchelka on 23.02.18.
 */
import {FetchChain, TransactionBuilder} from "bitsharesjs";
import {apiCall} from './BlockchainApi';
import {BitsharesApiExtends} from './BitsharesApiExtends'
import {utSchoolToken, utSchoolTokenTicket, utSchoolTokenSession, utSchoolTokenGrade, utSchoolAccount} from '../common/Configs'


class TeacherApi{

    constructor(account){
        this.account=account;
        this.feeAsset='BTS';
    }


    @apiCall
    _sendToken(lectureAccount, studentAccount, token){
        return new Promise((resolve, reject)=>{
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAccount", studentAccount),
                FetchChain("getAsset", token),
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

                tr.set_required_fees().then(() => {
                    tr.add_signer(this.account.privateKey, this.account.privateKey.toPublicKey().toPublicKeyString());
                    tr.broadcast().catch(reject);
                    resolve(tr.serialize());
                }).catch(reject);
            }).catch(reject);
        })
    }

    sendSessionToken(lectureAccount, studentAccount){
        return this._sendToken(lectureAccount, studentAccount, utSchoolTokenSession);
    }

    sendGradeToken(lectureAccount, studentAccount){
        return this._sendToken(lectureAccount, studentAccount, utSchoolTokenGrade);
    }


    @apiCall
    requestTeacherRole(){
        return new Promise((resolve, reject)=>{
            Promise.all([
                FetchChain("getAccount", utSchoolAccount),
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", utSchoolToken),
                FetchChain("getAsset", this.feeAsset)
            ]).then((res)=> {
                let [utSchoolAccount, teacherAccount, sendAsset, feeAsset] = res;
                let tr = new TransactionBuilder();

                tr.add_type_operation("transfer", {
                    fee: {
                        amount: 0,
                        asset_id: feeAsset.get("id")
                    },
                    from: utSchoolAccount.get("id"),
                    to: teacherAccount.get("id"),
                    amount: { asset_id: sendAsset.get("id"), amount: 0.00001},
                } );

                tr.propose({
                    fee_paying_account: teacherAccount.get("id")
                });

                tr.set_required_fees().then(() => {
                    tr.add_signer(this.account.privateKey, this.account.privateKey.toPublicKey().toPublicKeyString());
                    tr.broadcast().catch(reject);
                    resolve(tr.serialize());
                }).catch(reject);
            }).catch(reject);
        })
    }

    @apiCall
    getLectureParticipants(lectureAccount){
        return new Promise( (resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAsset", utSchoolTokenTicket)
            ]).then((res)=> {
                let [lectureAccount, ticketAsset] = res;
                lectureAccount = lectureAccount.get('id');
                ticketAsset = ticketAsset.get('id');


                BitsharesApiExtends.fetchHistory(lectureAccount, 100, 'transfer').then((operations)=>{
                    let studentApplications = [];
                    for(let operation of operations){
                        let transferData=operation.op[1];
                        if(transferData.from == lectureAccount
                            && transferData.amount.asset_id == ticketAsset){
                            studentApplications.push(transferData.to);
                        }
                    }
                    resolve(studentApplications);
                }).catch(reject);
            }).catch(reject);
        });
    }

    @apiCall
    getLectureApplications(lectureAccount){
        return new Promise( (resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAsset", utSchoolTokenTicket)
            ]).then((res)=> {
                let [lectureAccount, ticketAsset] = res;
                let lectureAccountId = lectureAccount.get('id');
                ticketAsset = ticketAsset.get('id');

                let proposals = lectureAccount.toJS().proposals;
                if(proposals.length == 0){
                    resolve([]);
                    return;
                }

                let applications = [];
                FetchChain("getObject", proposals).then((proposals)=>{
                    proposals = proposals.toJS();

                    let accountIds = [];
                    for(let proposal of proposals){
                        if(Date.parse(proposal.proposed_transaction.expiration) < new Date()/1000)
                            continue;
                        let operations = proposal.proposed_transaction.operations;
                        let acceptedOperation;
                        for(let operation of operations){
                            let operationData = operation[1];
                            if(operationData.amount.asset_id == ticketAsset
                                && operationData.from == lectureAccountId
                            ) {
                                acceptedOperation = operationData;
                                break;
                            }
                        }

                        if(!acceptedOperation)
                            continue;

                        accountIds.push(acceptedOperation.to);
                        applications.push({
                            'id': proposal.id,
                            'operation': acceptedOperation
                        });
                    }

                    if(applications.length == 0){
                        resolve([]);
                        return;
                    }
                    FetchChain('getAccount', accountIds).then((accounts)=>{
                        accounts = accounts.toJS();
                        let accountsMap = {};

                        for(let account of accounts)
                            if(account)
                                accountsMap[account.id] = account;

                        for(let application of applications){
                            let accountData = accountsMap[application.operation.to];
                            delete application.operation;
                            application.account = {
                                'id': accountData.id,
                                'name': accountData.name
                            };
                        }

                        resolve(applications);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }

    @apiCall
    acceptApplication(lectureApplicationId){
        return new Promise((resolve, reject)=>{
            Promise.all([
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", this.feeAsset)
            ]).then((res)=> {
                let [teacherAccount, feeAsset] = res;
                let tr = new TransactionBuilder();

                tr.add_type_operation("proposal_update_operation", {
                    fee: {
                        amount: 0,
                        asset_id: feeAsset.get("id")
                    },
                    fee_paying_account: teacherAccount,
                    proposal: lectureApplicationId,
                    active_approvals_to_add: [teacherAccount],
                } );

                tr.set_required_fees().then(() => {
                    tr.add_signer(this.account.privateKey, this.account.privateKey.toPublicKey().toPublicKeyString());
                    tr.broadcast().catch(reject);
                    resolve(tr.serialize());
                }).catch(reject);
            }).catch(reject);
        })
    }

    @apiCall
    getLectureStats(lectureAccount){
        return Promise.all([
            this.getLectureParticipants(lectureAccount),
            this.getLectureApplications(lectureAccount)
        ])
    }

    __processLectureQueue(lectures, index, onFinish){
        if(index>=lectures.length) {
            onFinish(lectures);
            return;
        }
        this.getLectureStats(lectures[index].name).then((res)=>{
            let [participants, applications] = res;
            lectures[index].participants = participants;
            lectures[index].applications = applications;

            this.__processLectureQueue(lectures, index+1, onFinish);
        })
    }

    @apiCall
    getLectures(){
        return new Promise( (resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", utSchoolAccount),
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", utSchoolToken)
            ]).then((res)=> {
                let [utSchoolAccount, teacherAccount, utSchoolAsset] = res;
                utSchoolAccount = utSchoolAccount.get('id');
                teacherAccount = teacherAccount.get('id');
                utSchoolAsset = utSchoolAsset.get('id');


                BitsharesApiExtends.fetchHistory(utSchoolAccount, 100, 'transfer').then((operations)=>{
                    let lecturesIdsList = [];
                    for(let operation of operations){
                        let transferData=operation.op[1];
                        if(transferData.from == utSchoolAccount
                            && transferData.amount.asset_id == utSchoolAsset)
                            lecturesIdsList.push(transferData.to);
                    }

                    if(lecturesIdsList.length == 0){
                        resolve([]);
                        return;
                    }

                    FetchChain("getAccount", lecturesIdsList).then((lectures)=>{
                        lectures = lectures.toJS();

                        let teachersLecturesList = [];

                        for(let lecture of lectures)  {
                            let currentTeacherId = lecture.active.account_auths[0][0];
                            if(currentTeacherId == teacherAccount) {
                                teachersLecturesList.push({
                                    'id': lecture.id,
                                    'name': lecture.name
                                });
                            }
                        }

                        if(teachersLecturesList.length == 0){
                            resolve([]);
                            return;
                        }


                        this.__processLectureQueue(teachersLecturesList, 0, resolve)
                    }).catch(reject)

                }).catch(reject);
            }).catch(reject);
        });
    }





}

export {TeacherApi}