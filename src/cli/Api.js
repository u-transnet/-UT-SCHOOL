/**
 * Created by superpchelka on 24.02.18.
 */

import StudentApi from './StudentApi';
import TeacherApi from './TeacherApi';
import {Api as SchoolApi} from '../api/Api';
import {generatePrograms} from './ProgramsGenerator'

class Api{

    static programs = [
        {
            command: {
                name: 'setPrivateKey',
                description: 'set private key of current user'
            },
            options: [
                {
                    key: 'privateKey',
                    name: '-p, --privateKey <privateKey>',
                    description: 'private key',
                    required: true
                }
            ],
            exec: 'setPrivateKey'
        },
        {
            command: {
                name: 'register',
                description: 'register user by login, password'
            },
            options: [
                {
                    key: 'login',
                    name: '-l, --login <login>',
                    description: 'name of the new bitshares account',
                    required: true
                },
                {
                    key: 'password',
                    name: '-p, --password <password>',
                    description: 'password for generating bitshares keys',
                    required: true
                },
            ],
            exec: 'register'
        },
    ];

    static getPrograms(nodeUrl, login, password, privateKey, onResult){
        return SchoolApi.init(nodeUrl, login, privateKey).then((api)=>{
            if(!privateKey)
                privateKey = SchoolApi.generateKeys(login, password).pubKeys.active;

            return [
                ...generatePrograms(Api.programs, api, onResult),
                ...generatePrograms(StudentApi.programs, api.studentApi, onResult),
                ...generatePrograms(TeacherApi.programs, api.teacherApi, onResult),
            ];
        });
    }

}

export default Api;