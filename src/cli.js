/**
 * Created by superpchelka on 24.02.18.
 */

import Api from './cli/Api';
import Commander from 'commander';
import readline from 'readline';


Commander
    .version('1.0.0')
    .option('-l, --login <login>', 'login of your bitshares account')
    .option('-p, --password  [password]', 'password of your bitshares account')
    .option('-k, --privateKey [privateKey]', 'private key of your bitshares account')
    .option('-u, --url <nodeUrl>', 'url of node to connect')
    .parse(process.argv);

if(!Commander.password && !Commander.privateKey)
    throw "Error: you must provide password or privateKey for accessing to your bitshares account";

Api.getPrograms(Commander.url, Commander.login, Commander.password, Commander.privateKey).then((programs)=>{
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const prefix = '>';

    function callCommand(programs, inputStr) {
        let pArgs = ['', '', ...inputStr.split(' ')];
        Commander.parse(pArgs);
        for(let program of programs) {
            program.parse(pArgs);
        }
    }

    Commander
        .command('help')
        .action(()=>{
            for(let program of programs) {
                program.outputHelp();
                console.log("\n--------------------------\n");
            }
        });

    Commander
        .command('exit')
        .action(()=>{
            rl.close();
        });

    rl.on('line', (line)=>{
        callCommand(programs, line.trim());
        rl.setPrompt(prefix, prefix.length);
        rl.prompt();
    }).on('close', ()=>{
        process.exit(0);
    });

    rl.setPrompt(prefix, prefix.length);
    rl.prompt();
}).catch((error)=>{console.log(error)});



