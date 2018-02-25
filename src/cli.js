/**
 * Created by superpchelka on 24.02.18.
 */

import Api from './cli/Api';
import Commander from 'commander';
import readline from 'readline';
import util from "util";


Commander
    .version('1.0.0')
    .option('-l, --login <login>', 'login of your bitshares account')
    .option('-p, --password  [password]', 'password of your bitshares account')
    .option('-k, --privateKey [privateKey]', 'private key of your bitshares account')
    .option('-u, --url <nodeUrl>', 'url of node to connect')
    .parse(process.argv);

if(!Commander.password && !Commander.privateKey) {
    console.log("Error: you must provide password or privateKey for accessing to your bitshares account");
    process.exit();
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const prefix = '>';
let onResult = (commandName, resp, isError)=>{
    console.log(util.inspect(resp, false, null));
    rl.setPrompt(prefix, prefix.length);
    rl.prompt();
};

Api.getPrograms(Commander.url, Commander.login, Commander.password, Commander.privateKey, onResult).then((programs)=>{
    //programs.push(Commander);

    programs.push(
        new Commander.Command('help')
            .action((commandName)=>{
                if(commandName !== 'help')
                    return;
                for(let program of programs) {
                    program.outputHelp();
                    console.log("\n--------------------------\n");
                }
                onResult(commandName, '', false);
            })
    );

    programs.push(
        new Commander.Command('exit')
            .action((commandName)=>{
                if(commandName !== 'exit')
                    return;
                rl.close();
            })
    );

    function callCommand(programs, inputStr) {
        let params = inputStr.split(' ');
        let commandName = params[0];
        let pArgs = ['', '', ...params];

        let processed = false;

        for(let program of programs) {
            try{
                if(commandName===program.name())
                    processed = true;
                program.parse(pArgs);
            }catch(e){
                console.log(e);
            }
        }

        if(!processed)
            onResult(null, `Unknown command ${commandName}`, true)
    }

    rl.on('line', (line)=>{
        callCommand(programs, line.trim());
    }).on('close', ()=>{
        process.exit(0);
    });

    rl.setPrompt(prefix, prefix.length);
    rl.prompt();
}).catch((error)=>{console.log(error)});



