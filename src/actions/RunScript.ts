import { ICCActionInputs, ICustomCode } from 'aitum.js/lib/interfaces';
import { StringInput } from 'aitum.js/lib/inputs';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn } from 'child_process';
import validation from '../lib/InputValidation';

/*********** CONFIG ***********/
// The custom code action name
const name: string = 'Run Script';

// The custom code inputs
const inputs: ICCActionInputs = {
  scriptName: new StringInput('Name of script?', { required: true }),
  twitchUser: new StringInput('Twitch User?', { required: false }),
  arg1: new StringInput('Argument 1?', { required: false }),
}

// The code executed.
async function method(inputs: { [key: string]: number | string | boolean | string[] }) {
  const scriptsDir = 'c:\\scripts\\'

  if (!fs.existsSync(scriptsDir)) {
    console.error(`The directory ${scriptsDir} must exist for this code to run.`)
  }

  if (!(inputs['scriptName'] as string).endsWith('.ps1')) {
    console.error('SEC001: all scripts MUST end with a .ps1 extension.'); 
  }

  var scriptName = validation.validateInput('scriptName', inputs['scriptName'] as string);
  var twitchUser = validation.validateInput('twitchUser', inputs['twitchUser'] as string);
  var arg1 = validation.validateInput('arg1', inputs['arg1'] as string);

  var ingameName;
  if (twitchUser != undefined) {
    var ingameNames = await mapUser(twitchUser);

    if (ingameNames.length == 0) {
      console.warn('Mapping of use {0} failed.', twitchUser)
    } else {
      ingameName = ingameNames[0];
    }
  }

  var fullyQualifiedPath = path.join(scriptsDir, scriptName as string);

  if (!fs.existsSync(fullyQualifiedPath)) {
    console.error(`The specified script (${fullyQualifiedPath}) does not exist.`)
  }

  console.log(scriptName + " Starting");
  var child = spawn("powershell.exe",[fullyQualifiedPath, ingameName as string, arg1 as string]);
  child.stdout.on("data",function(data){ console.log(scriptName + ": " + data);});
  child.stderr.on("data",function(data){ console.error(scriptName + ": " + data);});
  child.on("exit",function(){console.log(scriptName + " Script finished");});
  child.stdin.end();
}

async function mapUser(twitchUser: string): Promise<string[]> {
  const twitchUserMap = 'c:\\scripts\\usermap.txt';

  if (!fs.existsSync(twitchUserMap)) {
    throw new Error(`The file ${twitchUserMap} must exist for this code to run.`)
  }

  const fileStream = fs.createReadStream(twitchUserMap);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    var parts = line.trim().split(':');
    if (parts[0].trim().toLocaleLowerCase() === twitchUser.toLocaleLowerCase()) {
      return [ parts[1].trim() ];
    }
  }

  return [ ];
}

/*********** DON'T EDIT BELOW ***********/
export default { name, inputs, method } as ICustomCode;