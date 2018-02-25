/**
 * Created by superpchelka on 24.02.18.
 */


class TeacherApi{

    static programs = [
        {
            command: {
                name: 'teacherApi.sendSessionToken',
                description: 'send session token from lecture account to particular student'
            },
            options: [
                {
                    key: 'lectureAccount',
                    name: '-l, --lectureAccount <lectureAccount>',
                    description: 'name of the bitshares lecture account',
                    required: true
                },
                {
                    key: 'studentAccount',
                    name: '-s, --studentAccount <studentAccount>',
                    description: 'name of the bitshares student account',
                    required: true
                },
            ],
            exec: 'sendSessionToken'
        },
        {
            command: {
                name: 'teacherApi.sendGradeToken',
                description: 'send grade token from lecture account to particular student'
            },
            options: [
                {
                    key: 'lectureAccount',
                    name: '-l, --lectureAccount <lectureAccount>',
                    description: 'name of the bitshares lecture account',
                    required: true
                },
                {
                    key: 'studentAccount',
                    name: '-s, --studentAccount <studentAccount>',
                    description: 'name of the bitshares student account',
                    required: true
                },
            ],
            exec: 'sendGradeToken'
        },
        {
            command: {
                name: 'teacherApi.getLectureParticipants',
                description: 'fetch from blockchain information about participants of the lecture'
            },
            options: [
                {
                    key: 'lectureAccount',
                    name: '-l, --lectureAccount <lectureAccount>',
                    description: 'name of the bitshares lecture account',
                    required: true
                },
            ],
            exec: 'getLectureParticipants'
        },
        {
            command: {
                name: 'teacherApi.getLectureApplications',
                description: 'fetch from blockchain information about applications for the lecture'
            },
            options: [
                {
                    key: 'lectureAccount',
                    name: '-l, --lectureAccount <lectureAccount>',
                    description: 'name of the bitshares lecture account',
                    required: true
                },
            ],
            exec: 'getLectureApplications'
        },
        {
            command: {
                name: 'teacherApi.acceptApplication',
                description: 'accept proposal for application for the lecture'
            },
            options: [
                {
                    key: 'lectureApplicationId',
                    name: '-i, --lectureApplicationId <lectureApplicationId>',
                    description: 'id of the proposal for application for the lecture',
                    required: true
                },
            ],
            exec: 'acceptApplication'
        },
        {
            command: {
                name: 'teacherApi.getLectureStats',
                description: 'return statistics about particular lecture'
            },
            options: [
                {
                    key: 'lectureAccount',
                    name: '-l, --lectureAccount <lectureAccount>',
                    description: 'name of the bitshares lecture account',
                    required: true
                },
            ],
            exec: 'getLectureStats'
        },
        {
            command: {
                name: 'teacherApi.getLectures',
                description: 'collect all lectures of the current user'
            },
            options: [
            ],
            exec: 'getLectures'
        },

    ];

}

export default TeacherApi;