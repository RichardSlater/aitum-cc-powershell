import { ICCActionInputs, ICustomCode } from 'aitum.js/lib/interfaces';
import { StringInput } from 'aitum.js/lib/inputs';
import { AitumCC } from 'aitum.js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn, spawnSync } from 'child_process';

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
    throw new Error(`The directory ${scriptsDir} must exist for this code to run.`)
  }

  if (!(inputs['scriptName'] as string).endsWith('.ps1')) {
    throw new Error('SEC001: all scripts MUST end with a .ps1 extension.'); 
  }

  var scriptName = validateInput('scriptName', inputs['scriptName'] as string);
  var twitchUser = validateInput('twitchUser', inputs['twitchUser'] as string);
  var arg1 = validateInput('arg1', inputs['arg1'] as string);

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
    throw new Error(`The specified script (${fullyQualifiedPath}) does not exist.`)
  }

  console.log(scriptName + " Starting");
  var child = spawn("pwsh.exe",[fullyQualifiedPath, ingameName as string, arg1 as string]);
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

function validateInput(inputType: string, input: string): string | undefined {
  if (input == undefined) {
    return undefined;
  }

  if (input.includes('/') || input.includes('\\')) {
    throw new Error(`SEC002: ${inputType} may not contain directory seperators.`); 
  }

  if (input.includes('<') || input.includes('>')) {
    throw new Error(`SEC003: ${inputType} may not contain file redirection operators.`); 
  }

  if (input.includes(':')) {
    throw new Error(`SEC004: ${inputType} may not contain drive separators.`); 
  }

  if (input.includes('\'') || input.includes('\"')) {
    throw new Error(`SEC005: ${inputType} may not contain quotation marks separators.`); 
  }

  if (input.includes('|')) {
    throw new Error(`SEC006: ${inputType} may not contain pipe characters.`); 
  }

  if (input.includes('?') || input.includes('*')) {
    throw new Error(`SEC007: ${inputType} may not contain glob characters ('?' or '*').`); 
  }

  var reserved = [ 'CON', 'PRN', 'AUX', 'NUL', 'COM0', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT0', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9' ]
  if (reserved.some(element => element.toLocaleUpperCase() === input)) {
    throw new Error(`SEC008: ${inputType} may not contain be equal to the name of a standard Windows device.`); 
  }

  if (input.endsWith('.')) {
    throw new Error(`SEC009: ${inputType} end with a full-stop/period.`); 
  }

  return input;
}

/*********** DON'T EDIT BELOW ***********/
export default { name, inputs, method } as ICustomCode;