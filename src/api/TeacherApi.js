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

    /**
     * @desc send education token from lecture account to particular student
     * @param lectureAccount - name of the bitshares lecture account
     * @param studentAccount - name of the bitshares student account
     * @param educationToken - name of the bitshares education token
     * @return serialized transaction
     */
    @apiCall
    _sendToken(lectureAccount, studentAccount, educationToken){
        return new Promise((resolve, reject)=>{
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAccount", studentAccount),
                FetchChain("getAsset", educationToken),
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

    /**
     * @desc send session token from lecture account to particular student
     * @param lectureAccount - name of the bitshares lecture account
     * @param studentAccount - name of the bitshares student account
     * @return serialized transaction
     */
    sendSessionToken(lectureAccount, studentAccount){
        return this._sendToken(lectureAccount, studentAccount, utSchoolTokenSession);
    }

    /**
     * @desc send grade token from lecture account to particular student
     * @param lectureAccount - name of the bitshares lecture account
     * @param studentAccount - name of the bitshares student account
     * @return serialized transaction
     */
    sendGradeToken(lectureAccount, studentAccount){
        return this._sendToken(lectureAccount, studentAccount, utSchoolTokenGrade);
    }


    /**
     * @desc request teacher role for current bitshares account
     * @return serialized proposal transaction
     */
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
                    amount: { asset_id: sendAsset.get("id"), amount: 1},
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

    /**
     * @desc fetch from blockchain information about participants of the lecture
     * @param lectureAccount - name of the bitshares lecture account
     * @return list of participants
     * participant: {
     *      id,
     *      name
     * }
     */
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
                    let lectureParticipantsIds = [];
                    for(let operation of operations){
                        let transferData=operation.op[1];
                        if(transferData.from == lectureAccount
                            && transferData.amount.asset_id == ticketAsset){
                            lectureParticipantsIds.push(transferData.to);
                        }
                    }


                    FetchChain('getAccount', lectureParticipantsIds).then((accounts)=>{
                        accounts = accounts.toJS();
                        let accountsMap = {};

                        for(let account of accounts)
                            if(account)
                                accountsMap[account.id] = account;

                        let lectureParticipants = [];
                        for(let participant of lectureParticipantsIds){
                            let accountData = accountsMap[participant];
                            lectureParticipants.push({
                                'id': accountData.id,
                                'name': accountData.name
                            });
                        }

                        resolve(lectureParticipants);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * @desc fetch from blockchain information about applications for the lecture
     * @param lectureAccount - name of the bitshares lecture account
     * @return list of applications
     * application: {
     *      id, - id of proposal
     *      account: { - information about student account requested application
     *          id,
     *          name
     *      }
     * }
     */
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

    /**
     * @desc accept proposal for application for the lecture
     * @param lectureApplicationId - id of the proposal for application for the lecture
     * @return serialized transaction
     */
    @apiCall
    acceptApplication(lectureApplicationId){
        return new Promise((resolve, reject)=>{
            Promise.all([
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", this.feeAsset)
            ]).then((res)=> {
                let [teacherAccount, feeAsset] = res;
                let tr = new TransactionBuilder();
                teacherAccount = teacherAccount.get('id');

                tr.add_type_operation("proposal_update", {
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

    /**
     * @desc return statistics about particular lecture
     * @param lectureAccount - name of the bitshares lecture accout
     * @return pair of results from getLectureParticipants and getLectureApplications
     */
    @apiCall
    getLectureStats(lectureAccount){
        return Promise.all([
            this.getLectureParticipants(lectureAccount),
            this.getLectureApplications(lectureAccount)
        ])
    }

    /**
     * @desc internal method for iterating through lectures and gathering stats
     * @param lectures - list of account objects fetched from blockchain with bitsharesjs
     * @param index - current index in list
     * @param onFinish - finish callback
     * @private
     */
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

    /**
     * @desc collect all lectures of the current user
     * @return list of lectures
     * lecture: {
     *      id,
     *      name,
     *      participants - result of getLectureParticipants
     *      applications - result of getLectureApplications
     * }
     */
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