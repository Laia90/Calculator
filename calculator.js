// CALCULATOR STATE

const calculator = {
    firstNum: NaN,
    secondNum: NaN,
    sign: 1,
    operator: 'none',
    display: null,
    errorHandler: {
        errorMessage: "",
        operators: ['+', '-', '*', '/', '%'],
        validInputs: ['+', '-', '*', '/', '%', '=', '.', '+/-', 'C', 'AC', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        validKeys: ['+', '-', '*', '/', '%', '=', '.', 'Backspace', 'Delete', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
}


// LISTENERS

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelector("div.numpad");
    calculator.display = document.querySelector("div.screen span");

    buttons.addEventListener("click", (event) => { buttonClicked(event, calculator); });
    document.addEventListener("keydown", (event) => { keyPushed(event, calculator); });
});

function buttonClicked(event, calculator) {
    let input = event.target.textContent;
    getDisplay(input, calculator);
}

function keyPushed(event, calculator) {
    let input = event.key;

    if (calculator.errorHandler.validKeys.includes(input)) {
        event.preventDefault();
        getDisplay(input, calculator);
    }
}


// OPERATIONAL LOGIC

// Process an input character and output the result to the display
function getDisplay(input, calculator) {
    input = parseKey(input, calculator); // In the case of keyboard entry 

    if (!(invalidInput(input, calculator))) {
        if (calculator.errorHandler.operators.includes(input)) {
            if (firstNumStart(calculator)) {
                calculator.firstNum = 0;
                calculator.operator = input;
            }
            else if (expandsFirstNum(calculator)) {
                calculator.operator = input;
            }
            else if (expandsOperation(calculator)) {
                calculator.firstNum = operate(calculator);
                if (calculator.firstNum == undefined) {
                    setDisplay(undefined, calculator);
                    clear(calculator);
                }
                calculator.operator = input;
                calculator.secondNum = NaN;
            }
            setDisplay('o', calculator);
        }

        else if (input == '=') {
            let result = operate(calculator);
            setDisplay(result, calculator);
            clear(calculator);
        }

        else if (input == 'AC') {
            clear(calculator);
            setDisplay('n', calculator);
        }

        else if (input == 'C') {
            clearLast(calculator);
        }

        else if (input == '.') {
            if (firstNumStart(calculator)) {
                calculator.firstNum = 0 + '.';
                setDisplay('f', calculator);
            }
            else if (expandsSecondNum(calculator)) {
                calculator.secondNum = calculator.secondNum + '.';
                setDisplay('s', calculator)
            }
            else if (expandsFirstNum(calculator)) {
                calculator.firstNum = calculator.firstNum + '.';
                setDisplay('f', calculator);
            }
        }

        else if (input == '+/-') {
            calculator.sign = -1;
        }

        else {
            if (firstNumStart(calculator)) {
                calculator.firstNum = calculator.sign * Number(input);
                calculator.sign = 1;

                setDisplay('f', calculator);
            }
            else if (secondNumStart(calculator)) {
                calculator.secondNum = calculator.sign * Number(input);
                calculator.sign = 1;
                setDisplay('s', calculator);
            }
            else if (expandsFirstNum(calculator)) {
                if (calculator.firstNum instanceof Number && calculator.firstNum == 0) {
                    calculator.firstNum = input;
                }
                else {
                    calculator.firstNum = shiftNumber(calculator.firstNum, input);
                }
                setDisplay('f', calculator);
            }
            else if (expandsSecondNum(calculator)) {
                calculator.secondNum = shiftNumber(calculator.secondNum, input);
                setDisplay('s', calculator);
            }
        }
    }

    else if (!(input == 'ignore')) {
        console.error("Invalid input: " + calculator.errorHandler.errorMessage);
        setDisplay(undefined, calculator);
    }
}

// Generate display output
function setDisplay(terms, calculator, charNumber = 15) {
    let out = createOutputString(calculator, terms);

    if ((out != undefined) && (out.length <= charNumber)) {
        calculator.display.textContent = out;
    }
    else {
        calculator.display.textContent = 'ERROR';
    }
}

// Clear the last character that was entered
function clearLast(calculator) {
    if (!isNaN(calculator.secondNum)) {
        calculator.secondNum = calculator.secondNum.toString().slice(0, -1);
        if (calculator.secondNum == '' || calculator.secondNum == '-') {
            calculator.secondNum = NaN;
            setDisplay('o', calculator);
        }
        else {
            calculator.secondNum = Number(calculator.secondNum);
            setDisplay('s', calculator);
        }
    }

    else if (calculator.errorHandler.operators.includes(calculator.operator)) {
        calculator.operator = 'none';
        setDisplay('f', calculator);
    }

    else if (!isNaN(calculator.firstNum)) {
        calculator.firstNum = calculator.firstNum.toString().slice(0, -1);
        if (calculator.firstNum == '' || calculator.firstNum == '-') {
            calculator.firstNum = NaN;
            setDisplay('n', calculator);
        }
        else {
            calculator.firstNum = Number(calculator.firstNum);
            setDisplay('f', calculator);
        }
    }

    else {
        setDisplay('n', calculator);
    }
}

// Fully clear the display
function clear(calculator) {
    calculator.sign = 1;
    calculator.firstNum = NaN;
    calculator.secondNum = NaN;
    calculator.operator = 'none';
}

//Execute current operation
function operate(calculator) {
    if (calculator.errorHandler.operators.includes(calculator.operator) && !(isNaN(calculator.firstNum) || isNaN(calculator.secondNum))) {
        let op = calculator.operator;
        calculator.operator = 'none';
        switch (op) {
            case '+':
                return add(calculator.firstNum, calculator.secondNum);
            case '-':
                return substract(calculator.firstNum, calculator.secondNum);
            case '*':
                return multiply(calculator.firstNum, calculator.secondNum);
            case '/':
                return divide(calculator.firstNum, calculator.secondNum);
            case '%':
                return modulo(calculator.firstNum, calculator.secondNum);
        }
    }
}


// MATH HELPERS

function add(num1, num2) { return num1 + num2; }

function substract(num1, num2) { return num1 - num2; }

function multiply(num1, num2) { return num1 * num2; }

function divide(num1, num2) {
    if ((num2 == 0) || (num2 == NaN) || (num2 == undefined)) {
        console.error("Error: illegal denominator");
        return undefined;
    }
    else { return num1 / num2; }
}

function modulo(num1, num2) {
    if ((num2 == 0) || (num2 == NaN) || (num2 == undefined)) {
        console.error("Error: illegal denominator");
        return undefined;
    }
    else { return num1 % num2; }
}


// FORMAT HELPERS

/* Parse keyboard input.
 * The Backspace key replaces the C button and the Delete key the AC button.
 * If the position of the new character allows a sign, the '-' key replaces the +/- button.
 */
function parseKey(input, calculator) {
    if (input == '-' && (firstNumStart(calculator) || (secondNumStart(calculator) && !(calculator.operator == 'none')))) { return '+/-'; }
    else if (input == 'Backspace') { return 'C'; }
    else if (input == 'Delete') { return 'AC'; }
    else if (calculator.errorHandler.validInputs.includes(input)) { return input; }
    else { return 'ignore'; }
}

function isDecimalNumber(num) {
    if (num != undefined) {
        return num.toString().split('.').length == 2;
    }
    else {
        console.error('Variable not defined');
        return false;
    }
}

// Add input to the number in a manner dependent on wether the number is in exponential notation or not.
function shiftNumber(num, input) {
    num = num.toString();
    if (num.includes('e')) {
        num = Number(num) * 10 + Number(input);
    }
    else {
        num = num + input;
    }
    return num;
}

//  Deal with too long numbers by displaying them as exponential numbers.
//  max = maximal length allocated for this number
function roundNumber(num, max) {
    let decLength = max - 4;

    if (isDecimalNumber(num) && (num.toString().split('.'))[0].length == 1) {
        if (num.toString().length > max) {
            num = Number(num).toFixed(decLength);
        }
    }

    while (num.toString().length > max) {
        if (decLength > 20) { return undefined; break; } // too many decimal numbers, do not try to convert
        num = Number(num).toExponential(decLength);
        decLength -= 1;
    }; // if power is a longer number than currently planned for, round again with 1 more character allocated to power

    return num;
}


// Shorten a number to either the number of characters fitting on the display after substracting the lengths of the operator and the other number, or to a given minimum length. Meant only for full equations with two numbers and an operator.
// num1 - the number to be shortened
// num2 - the equation's other number
// charNumber - the maximal number of characters for the expression string / the display length
// operatorLength - number of characters to reserve for the operator
// shortTo - minimum length of the shortened number
function shortenNum(num1, num2, charNumber, operatorLength, shortTo) {
    let max = charNumber - operatorLength - num2.toString().length;

    max = max > shortTo ? max : shortTo;

    return roundNumber(num1, max);
}

// Create an output string of the correct length for the display, rounding numbers as necessary
// terms - number of operation components involved: n for none, f for the first number, o for the first number and the operator, s for the first number, the operator and the second number and everything else to be interpreted as a result.
// charNumber - maximum length of the string to be created, default 15 characters
// shortTo - minimum length of shortened numbers, default 6 characters
function createOutputString(calculator, terms, charNumber = 15, shortTo = 5) {
    switch (terms) {
        case 'n':
            return '0'; break;
        case 'f':
            return roundNumber(calculator.firstNum, charNumber).toString(); break;
        case 'o':
            return roundNumber(calculator.firstNum, charNumber - calculator.operator.length - 1) + ' ' + calculator.operator; break;
        case 's':
            return shortenNum(calculator.firstNum, calculator.secondNum, charNumber, calculator.operator.length + 2, shortTo) + ' ' + calculator.operator + ' ' + shortenNum(calculator.secondNum, calculator.firstNum, charNumber, calculator.operator.length + 2, shortTo); break;
        default:
            return roundNumber(Number(terms), charNumber).toString();
    }
}


// POSITION HELPERS

function lastCharacter(str) { return str[-1]; }
function firstCharacter(str) { return str[1]; }

function expandsOperation(input, calculator) {
    return calculator.errorHandler.operators.includes(input) && expandsSecondNum(calculator);
}

function expandsFirstNum(calculator) {
    return !calculator.errorHandler.operators.includes(calculator.operator) && !isNaN(calculator.firstNum);
}

function expandsSecondNum(calculator) {
    return calculator.errorHandler.operators.includes(calculator.operator) && !isNaN(calculator.firstNum) && !isNaN(calculator.secondNum);
}

function firstNumStart(calculator) {
    return isNaN(calculator.firstNum) && isNaN(calculator.secondNum) && calculator.operator == 'none';
}

function secondNumStart(calculator) {
    return !isNaN(calculator.firstNum) && calculator.errorHandler.operators.includes(calculator.operator) && isNaN(calculator.secondNum);
}


// CHECKS AND ERROR HANDLING


/* Input is invalid if:
 * - an operator, equals sign or decimal point is entered where a number is expected
 * - an operation would be executed but needed inputs are missing 
 * - a sign is entered anywhere but the start of a number
 * - a decimal point would be added to a number that is already a decimal number
 * - the input is not in the list of valid inputs
 */
function invalidInput(input, calculator) {
    return invalidLeadingCharacter(input, calculator) ||
        invalidOperation(input, calculator) ||
        invalidSign(input, calculator) ||
        invalidDecimal(input, calculator) ||
        !(calculator.errorHandler.validInputs.includes(input));
}

function invalidLeadingCharacter(input, calculator) {
    let invalid = input == '=' || input == '.' || calculator.errorHandler.operators.includes(input);
    let out = (firstNumStart(calculator) && input == '=') || (secondNumStart(calculator) && invalid);
    if (out) { calculator.errorHandler.errorMessage = "invalid leading character"; }
    return out;
}

function invalidOperation(input, calculator) {
    let out = ((input == '=' || expandsOperation(input, calculator)) && invalidOperateCall(calculator));
    if (out) { calculator.errorHandler.errorMessage = "invalid operation call" }
}

function invalidSign(input, calculator) {
    let out = (input == '+/-' && !(firstNumStart(calculator) || secondNumStart(calculator)));
    if (out) { calculator.errorHandler.errorMessage = "invalid sign use"; }
    return out;
}

function invalidDecimal(input, calculator) {
    let out = (repeatedDecimal(calculator.firstNum) || repeatedDecimal(calculator.secondNum)) ||
        (input == '.' && ((expandsFirstNum(calculator) && isDecimalNumber(calculator.firstNum)) || (expandsSecondNum(calculator) && isDecimalNumber(calculator.secondNum))));
    if (out) { calculator.errorHandler.errorMessage = "invalid decimal point use"; }
    return out;
}

function invalidOperateCall(calculator) {
    let out = firstNumMissing(calculator) || operatorMissing(calculator) || firstNumStart(calculator) || secondNumStart(calculator) || leadingDecimal(calculator) || trailingDecimal(calculator) || trailingSign(calculator);
    return out;
}

function firstNumMissing(calculator) {
    let out = calculator.errorHandler.operators.includes(calculator.operator) && isNaN(calculator.firstNum);
    if (out) { calculator.errorHandler.errorMessage = "first number missing"; }
    return out;
}

function operatorMissing(calculator) {
    let out = !(calculator.errorHandler.operators.includes(calculator.operator)) && !isNaN(calculator.secondNum);
    if (out) { calculator.errorHandler.errorMessage = "operator missing"; }
    return out;
}

function trailingSign(calculator) {
    return calculator.firstNum[-1] == '-' || calculator.secondNum[-1] == '-';
}

function leadingDecimal(calculator) {
    let out = (!isNaN(calculator.firstNum) && firstCharacter(calculator.firstNum) == '.') || (!isNaN(calculator.secondNum) && firstCharacter(calculator.secondNum) == '.');
    if (out) { calculator.errorHandler.errorMessage = "leading decimal sign"; }
    return out;
}

function trailingDecimal(calculator) {
    let out = (expandsFirstNum(calculator) && lastCharacter(calculator.firstNum) == '.') || (expandsSecondNum(calculator) && lastCharacter(calculator.secondNum) == '.');
    if (out) { calculator.errorHandler.errorMessage = "trailing decimal sign"; }
    return out;
}

function repeatedDecimal(num) {
    let out = num.toString().split('.').length > 2;
    if (out) { errorMessage = "repeating decimal sign"; }
    return out;
}