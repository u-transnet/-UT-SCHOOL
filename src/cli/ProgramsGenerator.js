/**
 * Created by superpchelka on 25.02.18.
 */

import Program from "commander"

function generatePrograms(programsList, api, onResult) {
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
                    if((typeof optionValue === 'undefined' || optionValue === null) && option.required){
                        onResult(commandName, `Option ${option.name} is required for method ${commandName}`, true);
                        return;
                    }
                    apiArgs.push(optionValue)
                }

                api[programData.exec](...apiArgs)
                .then((resp)=>{
                    onResult(commandName, resp, false);
                })
                .catch((error)=>{
                    onResult(commandName, error, true);
                })
            }
        );

        programs.push(program);
    }

    return programs;
}


export {generatePrograms};