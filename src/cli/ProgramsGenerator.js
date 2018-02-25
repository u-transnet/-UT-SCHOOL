/**
 * Created by superpchelka on 25.02.18.
 */

import Program from "commander"
import util from "util";

function generatePrograms(programsList, api) {
    let programs = [];
    for(let programData of programsList){
        let program = new Program.Command(programData.command.name);
        program.description(programData.command.description);
        for(let option of programData.options)
            program.option(option.name, option.description);
        program.action(
            (commandName, command)=>{
                if(commandName !== programData.command.name)
                    return;

                let apiArgs = [];
                for(let option of programData.options) {
                    let optionValue = command[option.key];
                    if((typeof optionValue === 'undefined' || optionValue === null) && option.required)
                        throw `Option ${option.name} is required for method ${commandName}`;
                    apiArgs.push(optionValue)
                }

                api[programData.exec](...apiArgs)
                    .then((resp)=>{console.log(util.inspect(resp, false, null))})
                    .catch((error)=>{console.log(error)})
            }
        );

        programs.push(program);
    }

    return programs;
}


export {generatePrograms};