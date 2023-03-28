
function validateInput(inputType: string, input: string | undefined): string | undefined {
    if (input == undefined) {
      return undefined;
    }

    var reserved = [ 'CON', 'PRN', 'AUX', 'NUL', 'COM0', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT0', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9' ]
    if (reserved.some(element => element.toLocaleUpperCase() === input)) {
      console.warn(`SEC008: ${inputType} may not contain be equal to the name of a standard Windows device.`);
      return undefined;
    }
  
    var output = input as string | undefined;
    output = checkString(output, '/', `SEC002: ${inputType} may not contain directory seperators.`);
    output = checkString(output, '\\', `SEC002: ${inputType} may not contain directory seperators.`);
    output = checkString(output, '<', `SEC003: ${inputType} may not contain file redirection operators.`);
    output = checkString(output, '>', `SEC003: ${inputType} may not contain file redirection operators.`);
    output = checkString(output, ':', `SEC004: ${inputType} may not contain drive separators.`);
    output = checkString(output, '\'', `SEC005: ${inputType} may not contain quotation marks separators.`);
    output = checkString(output, '\"', `SEC005: ${inputType} may not contain quotation marks separators.`);
    output = checkString(output, '|', `SEC006: ${inputType} may not contain pipe characters.`);
    output = checkString(output, '?', `SEC007: ${inputType} may not contain glob characters ('?' or '*').`);
    output = checkString(output, '*', `SEC007: ${inputType} may not contain glob characters ('?' or '*').`);

    if (output?.endsWith('.')) {
      output = output?.substring(0, output.length - 1)
    }
  
    return output;
  }
  
  function checkString(input: string | undefined, illegal: string, message: string): string | undefined {
    const emptyString = '';

    if (input === undefined) {
      return undefined;
    }
  
    if (!input.includes(illegal)) {
      return input;
    }
  
    console.warn(message);
    return input.replaceAll(illegal, emptyString);
  }

  export default { validateInput, checkString }