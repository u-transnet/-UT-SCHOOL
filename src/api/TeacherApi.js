/**
 * Created by superpchelka on 23.02.18.
 */
import {FetchChain, TransactionBuilder} from "bitsharesjs";
import {BitsharesApiExtends} from './BitsharesApiExtends'
import {utSchoolToken, utSchoolTokenTicket, utSchoolTokenSession, utSchoolTokenGrade, utSchoolAccount} from '../common/Configs'
import assert from "assert";

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
    _sendToken(lectureAccount, studentAccount, educationToken){
        return new Promise((resolve, reject)=>{
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAccount", studentAccount),
                FetchChain("getAsset", educationToken),
                FetchChain("getAsset", this.feeAsset)
            ]).then((res)=> {
                let [cLectureAccount, cStudentAccount, cEducationToken, cFeeAsset] = res;

                assert(cLectureAccount !== null, `Invalid lecture account ${lectureAccount}`);
                assert(cStudentAccount !== null, `Invalid student account ${studentAccount}`);
                assert(cEducationToken !== null, `Invalid education token ${educationToken}`);
                assert(cFeeAsset !== null, `Invalid fee asset ${this.feeAsset}`);

                let tr = new TransactionBuilder();

                tr.add_type_operation("transfer", {
                    fee: {
                        amount: 0,
                        asset_id: cFeeAsset.get("id")
                    },
                    from: cLectureAccount.get("id"),
                    to: cStudentAccount.get("id"),
                    amount: { asset_id: cEducationToken.get("id"), amount: 1},
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
     * @desc fetch from blockchain information about participants of the lecture
     * @param lectureAccount - name of the bitshares lecture account
     * @return list of participants
     * participant: {
     *      id,
     *      name
     * }
     */
    getLectureParticipants(lectureAccount){
        return new Promise( (resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAsset", utSchoolTokenTicket)
            ]).then((res)=> {
                let [cLectureAccount, cTicketToken] = res;

                assert(cLectureAccount !== null, `Invalid lecture account ${lectureAccount}`);
                assert(cTicketToken !== null, `Invalid ticket token ${utSchoolTokenTicket}`);

                cLectureAccount = cLectureAccount.get('id');
                cTicketToken = cTicketToken.get('id');


                BitsharesApiExtends.fetchHistory(cLectureAccount, 100, 'transfer').then((operations)=>{
                    let lectureParticipantsIds = [];
                    for(let operation of operations){
                        let transferData=operation.op[1];
                        if(transferData.from == cLectureAccount
                            && transferData.amount.asset_id == cTicketToken){
                            lectureParticipantsIds.push(transferData.to);
                        }
                    }


                    FetchChain('getAccount', lectureParticipantsIds).then((accounts)=>{
                        accounts = accounts.toJS();
                        let accountsMap = {};

                        let index = -1;
                        for(let account of accounts){
                            index++;
                            if(!account){
                                console.log(`Have no information about account ${lectureParticipants[index]}`);
                                continue;
                            }
                            accountsMap[account.id] = account;
                        }

                        let lectureParticipants = [];
                        for(let participant of lectureParticipantsIds){
                            let accountData = accountsMap[participant];
                            if(!accountData)
                                continue;
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
    getLectureApplications(lectureAccount){
        return new Promise( (resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", lectureAccount),
                FetchChain("getAsset", utSchoolTokenTicket)
            ]).then((res)=> {
                let [cLectureAccount, cTicketToken] = res;

                assert(cLectureAccount !== null, `Invalid lecture account ${lectureAccount}`);
                assert(cTicketToken !== null, `Invalid ticket token ${utSchoolTokenTicket}`);

                let lectureAccountId = cLectureAccount.get('id');
                cTicketToken = cTicketToken.get('id');

                let proposals = cLectureAccount.toJS().proposals;
                if(proposals.length == 0){
                    resolve([]);
                    return;
                }

                let applications = [];
                FetchChain("getObject", proposals).then((cProposals)=>{
                    cProposals = cProposals.toJS();

                    let accountIds = [];
                    let index = -1;
                    for(let cProposal of cProposals){
                        index++;
                        if(!cProposal){
                            console.log(`Have no information about proposal ${proposals[index]}`);
                            continue;
                        }

                        if(Date.parse(cProposal.proposed_transaction.expiration) < new Date()/1000)
                            continue;
                        let operations = cProposal.proposed_transaction.operations;
                        let acceptedOperation;
                        for(let operation of operations){
                            let operationData = operation[1];
                            if(operationData.amount.asset_id == cTicketToken
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
                            'id': cProposal.id,
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

                        let index = -1;
                        for(let account of accounts){
                            index++;
                            let accountId=accountIds[index];
                            if(!account){
                                console.log(`Have no information about account ${accountId}`);
                                account = {id: accountId};
                            }
                            accountsMap[accountId] = account;
                        }

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
    acceptApplication(lectureApplicationId){
        return new Promise((resolve, reject)=>{
            Promise.all([
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", this.feeAsset)
            ]).then((res)=> {
                let [teacherAccount, feeAsset] = res;

                assert(teacherAccount !== null, `Invalid teacher account ${this.account.name}`);
                assert(feeAsset !== null, `Invalid fee asset ${this.feeAsset}`);

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
    getLectures(){
        return new Promise( (resolve, reject) => {
            Promise.all([
                FetchChain("getAccount", utSchoolAccount),
                FetchChain("getAccount", this.account.name),
                FetchChain("getAsset", utSchoolToken)
            ]).then((res)=> {
                let [cUtSchoolAccount, cTeacherAccount, cUtSchoolToken] = res;

                assert(cUtSchoolAccount !== null, `Invalid utSchoolAccount ${utSchoolAccount}`);
                assert(cTeacherAccount !== null, `Invalid teacher account ${this.account.name}`);
                assert(cUtSchoolToken !== null, `Invalid utSchoolToken ${utSchoolToken}`);


                cUtSchoolAccount = cUtSchoolAccount.get('id');
                cTeacherAccount = cTeacherAccount.get('id');
                cUtSchoolToken = cUtSchoolToken.get('id');


                BitsharesApiExtends.fetchHistory(cUtSchoolAccount, 100, 'transfer').then((operations)=>{
                    let lecturesIdsList = [];
                    for(let operation of operations){
                        let transferData=operation.op[1];
                        if(transferData.from === cUtSchoolAccount
                            && transferData.amount.asset_id === cUtSchoolToken)
                            lecturesIdsList.push(transferData.to);
                    }

                    if(lecturesIdsList.length === 0){
                        resolve([]);
                        return;
                    }

                    FetchChain("getAccount", lecturesIdsList).then((lectures)=>{
                        lectures = lectures.toJS();

                        let teachersLecturesList = [];

                        let index = -1;
                        for(let lecture of lectures)  {
                            index++;
                            if(!lecture){
                                console.log(`Have no information about lecture ${lecturesIdsList[index]}`);
                                continue;
                            }

                            let account_auths = lecture.active.account_auths;
                            if(account_auths.length === 0 || account_auths[0].length === 0)
                                continue;

                            let potentialTeacherIds = account_auths[0];
                            for(let currentTeacherId of potentialTeacherIds){
                                if(currentTeacherId === cTeacherAccount) {
                                    teachersLecturesList.push({
                                        'id': lecture.id,
                                        'name': lecture.name
                                    });
                                    break;
                                }
                            }
                        }

                        if(teachersLecturesList.length === 0){
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