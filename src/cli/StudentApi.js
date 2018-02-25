/**
 * Created by superpchelka on 24.02.18.
 */

class StudentApi{

    static programs = [
        {
            command: {
                name: 'studentApi.applyForLecture',
                description: 'apply current user for the lecture'
            },
            options: [
                {
                    key: 'lectureAccount',
                    name: '-l, --lectureAccount <lectureAccount>',
                    description: 'name of the bitshares lecture account',
                    required: true
                },
            ],
            exec: 'applyForLecture'
        },
        {
            command: {
                name: 'studentApi.getLectureStats',
                description: 'collect information about lecture'
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
                name: 'studentApi.getLectures',
                description: 'return all available lectures for current user'
            },
            options: [
            ],
            exec: 'getLectures'
        },
    ];

}

export default StudentApi;