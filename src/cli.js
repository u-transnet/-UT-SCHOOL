/**
 * Created by superpchelka on 24.02.18.
 */

import Api from './cli/Api';
import Program from 'commander';
import readline from 'readline';


Program
    .version('1.0.0')
    .option('-l, --login', 'login of your bitshares account')
    .option('-p, --password', 'password of your bitshares account')
    .option('-pvk, --privateKey', 'private key of your bitshares account')
    .option('-n, --nodeUrl', 'url of node to connect')
    .parse(process.argv);

if(!Program.password && !Program.privateKey)
    throw "Error: you must provide password or privateKey for accessing to your bitshares account";

Api.patch(Program, Program.nodeUrl, Program.login, Program.password, Program.privateKey).then(()=>{
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const prefix = '>';

    function callCommand(inputStr) {
        Program.parse(['', '', ...inputStr.split(' ')]);
    }

    Program
        .command('help')
        .action(()=>{
            Program.outputHelp();
        });

    Program
        .command('exit')
        .action(()=>{
            rl.close();
        });

    rl.on('line', (line)=>{
        callCommand(line.trim());
        rl.setPrompt(prefix, prefix.length);
        rl.prompt();
    }).on('close', ()=>{
        process.exit(0);
    });

    rl.setPrompt(prefix, prefix.length);
    rl.prompt();
});



