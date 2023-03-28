import validation from '../src/lib/InputValidation';

describe('checkString function', () => {
    test('undefined should return undefined', () => {
        expect(validation.checkString(undefined, '/', 'message')).toBe(undefined);
    });

    test('empty should return empty', () => {
        expect(validation.checkString('', '/', 'message')).toBe('');
    });
    
    test('should return valid file name unchanged', () => {
        expect(validation.checkString('test-script.ps1', '/', 'message')).toBe('test-script.ps1');
    });

    test('should strip out multiple instances', () => {
        expect(validation.checkString('c::test:script:ps1', ':', 'message')).toBe('ctestscriptps1');
    });

    test('should strip out directory seprators', () => {
        expect(validation.checkString('../test-script.ps1', '/', 'message')).toBe('..test-script.ps1');
        expect(validation.checkString('..\\test-script.ps1', '\\', 'message')).toBe('..test-script.ps1');
    });

    test('should strip out drive seprators', () => {
        expect(validation.checkString('c:test-script.ps1', ':', 'message')).toBe('ctest-script.ps1');
    });

    test('should strip out redirection', () => {
        expect(validation.checkString('test-script.ps1 > test', '>', 'message')).toBe('test-script.ps1  test');
        expect(validation.checkString('test-script.ps1 < test', '<', 'message')).toBe('test-script.ps1  test');
    });

    test('should strip quotes', () => {
        expect(validation.checkString('test-script.ps1"test', '"', 'message')).toBe('test-script.ps1test');
        expect(validation.checkString('test-script.ps1\'test', '\'', 'message')).toBe('test-script.ps1test');
    });
    
    test('should strip pipe character', () => {
        expect(validation.checkString('test-script.ps1 | test', '|', 'message')).toBe('test-script.ps1  test');
    });

    test('should strip glob characters', () => {
        expect(validation.checkString('test-script.ps1*test', '*', 'message')).toBe('test-script.ps1test');
        expect(validation.checkString('test-script.ps1?test', '?', 'message')).toBe('test-script.ps1test');
    });
});

describe('checkString function', () => {
    test('undefined should return undefined', () => {
        expect(validation.validateInput('argument', undefined)).toBe(undefined);
    });

    test('empty should return empty', () => {
        expect(validation.validateInput('argument', '')).toBe('');
    });

    test('empty should valid script', () => {
        expect(validation.validateInput('argument', 'test-1.ps1')).toBe('test-1.ps1');
    });

    test('should strip out path traversal #1', () => {
        expect(validation.validateInput('argument', '../test-script.ps1')).toBe('..test-script.ps1');
    });

    test('should strip out path traversal #2', () => {
        expect(validation.validateInput('argument', '..\\test-script.ps1')).toBe('..test-script.ps1');
    });

    test('should strip out path traversal #3', () => {
        expect(validation.validateInput('argument', 'c:/test-script.ps1')).toBe('ctest-script.ps1');
    });

    test('should strip out path traversal #4', () => {
        expect(validation.validateInput('argument', 'c:\\test-script.ps1')).toBe('ctest-script.ps1');
    });

    test('should strip out output redirection #1', () => {
        expect(validation.validateInput('argument', 'test-script.ps1 > c:\\windows\\system32\\win.ini')).toBe('test-script.ps1  cwindowssystem32win.ini');
    });

    test('should strip out output redirection #2', () => {
        expect(validation.validateInput('argument', 'test-script.ps1 | netcat')).toBe('test-script.ps1  netcat');
    });

    test('should strip out quotes', () => {
        expect(validation.validateInput('argument', 'test-"script\'.ps1')).toBe('test-script.ps1');
    });

    test('should strip out glob characters', () => {
        expect(validation.validateInput('argument', '*.ps?')).toBe('.ps');
    });

    test('should null reserved files', () => {
        expect(validation.validateInput('argument', 'LPT1')).toBe(undefined);
        expect(validation.validateInput('argument', 'COM0')).toBe(undefined);
        expect(validation.validateInput('argument', 'NUL')).toBe(undefined);
    });

    test('should strip trailing dot/fullstop/period', () => {
        expect(validation.validateInput('argument', 'test-script.ps1.')).toBe('test-script.ps1');
    });
});
