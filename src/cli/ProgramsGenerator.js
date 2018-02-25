/**
 * Created by superpchelka on 25.02.18.
 */

import Program from "commander"

function generatePrograms(programsList, api) {
    let programs = [];
    for(let programData of programsList){
        let program = new Program.Command();
        program.command(programData.command.name);
        program.description(programData.command.description);
        for(let option of programData.options)
            program.option(option.name, option.description);
        program.action(
            (commandName, command)=>{
                if(commandName !== programData.command.name)
                    return;

                let apiArgs = [];
                for(let option of programData.options)
                    apiArgs.push(command[option.key])

                api[programData.exec](...apiArgs)
                    .then((resp)=>{console.log(resp)})
                    .catch((error)=>{console.log(error)})
            }
        );

        programs.push(program);
    }

    return programs;
}


export {generatePrograms};