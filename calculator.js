let firstNum = NaN;
let secondNum = NaN;
let sign = 1;
let operator = 'none';
let errorMessage = "";

const operators = ['+', '-', '*', '/', '%'];
const validInputs = ['+', '-', '*', '/', '%', '=', '.', '+/-', 'C', 'AC', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelector("div.numpad");

    buttons.addEventListener("click", buttonClicked);
});

function buttonClicked(event) {
    const display = document.querySelector("div.screen span");
    let input = event.target.textContent;
    getDisplay(input, display);
}

/* Input is invalid if:
 * - an operator, equals sign or decimal point is entered where a number is expected
 * - an operation would be executed but needed inputs are missing 
 * - a sign is entered anywhere but the start of a number
 * - a decimal point would be added to a number that is already a decimal number
 * - the input is not in the list of valid inputs
 */
function invalidInput(input) {
    return invalidLeadingCharacter(input) ||
        invalidOperation(input) ||
        invalidSign(input) ||
        invalidDecimal(input) ||
        !(validInputs.includes(input));
}

function invalidLeadingCharacter(input) {
    let invalid = input == '=' || input == '.' || operators.includes(input);
    let out = (firstNumStart() && input == '=') || (secondNumStart() && invalid);
    if (out) { errorMessage = "invalid leading character"; }
    return out;
}

function invalidDecimal(input) {
    let out = (repeatedDecimal(firstNum) || repeatedDecimal(secondNum)) ||
        (input == '.' && ((expandsFirstNum() && isDecimalNumber(firstNum)) || (expandsSecondNum() && isDecimalNumber(secondNum))));
    if (out) { errorMessage = "invalid decimal point use"; }
    return out;
}

function invalidSign(input) {
    let out = (input == '+/-' && !(firstNumStart() || secondNumStart()));
    if (out) { errorMessage = "invalid sign use"; }
    return out;
}

function invalidOperation(input) {
    let out = ((input == '=' || expandsOperation(input)) && invalidOperateCall());
    if (out) { errorMessage = "invalid operation call" }
}

function invalidOperateCall() {
    let out = firstNumMissing() || operatorMissing() || firstNumStart() || secondNumStart() || leadingDecimal() || trailingDecimal() || trailingSign();
    return out;
}

function firstNumMissing() {
    let out = operators.includes(operator) && isNaN(firstNum);
    if (out) { errorMessage = "first number missing"; }
    return out;
}

function operatorMissing() {
    let out = !(operators.includes(operator)) && !isNaN(secondNum);
    if (out) { errorMessage = "operator missing"; }
    return out;
}

function lastCharacter(str) { return str[-1]; }
function firstCharacter(str) { return str[1]; }

function expandsOperation(input) {
    return operators.includes(input) && expandsSecondNum();
}

function trailingSign() {
    return firstNum[-1] == '-' || secondNum[-1] == '-';
}

function trailingDecimal() {
    let out = (expandsFirstNum() && lastCharacter(firstNum) == '.') || (expandsSecondNum() && lastCharacter(secondNum) == '.');
    if (out) { errorMessage = "trailing decimal sign"; }
    return out;
}

function leadingDecimal() {
    let out = (!isNaN(firstNum) && firstCharacter(firstNum) == '.') || (!isNaN(secondNum) && firstCharacter(secondNum) == '.');
    if (out) { errorMessage = "leading decimal sign"; }
    return out;
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

function repeatedDecimal(num) {
    let out = num.toString().split('.').length > 2;
    if (out) { errorMessage = "repeating decimal sign"; }
    return out;
}

function expandsFirstNum() {
    return !operators.includes(operator) && !isNaN(firstNum);
}

function expandsSecondNum() {
    return operators.includes(operator) && !isNaN(firstNum) && !isNaN(secondNum);
}

function firstNumStart() {
    return isNaN(firstNum) && isNaN(secondNum) && operator == 'none';
}

function secondNumStart() {
    return !isNaN(firstNum) && operators.includes(operator) && isNaN(secondNum);
}

//  Deal with too long integers by displaying them as a multiple of a power of ten
//  max = maximal length allocated for this number
function roundNumber(num, max) {
    let out = num;
    let len = num.toString().length;

    if (len > max) {
        let power = len - max + 2; // amount by which to shorten the number
        power += power.toString().length; // factor in the space used to display the power of ten

        let pre = Math.round(num / (10 ** power));
        out = pre + 'e+' + power;
    }

    return out;
}

// Clear the last character that was entered
function clearLast(display) {
    if (!isNaN(secondNum)) {
        secondNum = secondNum.toString().slice(0, -1);
        if (secondNum == '' || secondNum == '-') {
            secondNum = NaN;
            setDisplay(2, display);
        }
        else {
            secondNum = Number(secondNum);
            setDisplay(3, display);
        }
    }

    else if (operators.includes(operator)) {
        operator = 'none';
        setDisplay(1, display);
    }

    else if (!isNaN(firstNum)) {
        firstNum = firstNum.toString().slice(0, -1);
        if (firstNum == '' || firstNum == '-') {
            firstNum = NaN;
            setDisplay(0, display);
        }
        else {
            firstNum = Number(firstNum);
            setDisplay(1, display);
        }
    }

    else {
        setDisplay(0, display);
    }
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
// terms - number of operation components involved: 0 for none, 1 for the first number or the result, 2 for the first number and the operator and 3 for the first number, the operator and the second number.
// charNumber - maximum length of the string to be created, default 15 characters
// shortTo - minimum length of shortened numbers, default 6 characters
function createOutputString(terms, charNumber = 15, shortTo = 6) {
    let num1 = firstNum;
    let num2 = secondNum;

    switch (terms) {
        case 0:
            return 0; break;
        case 1:
            return roundNumber(firstNum, charNumber).toString(); break;
        case 2:
            return roundNumber(firstNum, charNumber - operator.length) + operator; break;
        case 3:
            return shortenNum(firstNum, secondNum, charNumber, operator.length, shortTo) + operator + shortenNum(secondNum, firstNum, charNumber, operator.length, shortTo); break;
        case 'default':
            return terms;
    }
}

function setDisplay(terms, display, charNumber = 15) {
    let out = createOutputString(terms);
    if ((out != undefined) && (out.length <= charNumber)) {
        display.textContent = out;
    }
    else {
        display.textContent = 'ERROR';
    }
}

// Process an input character and output the result to the display
function getDisplay(input, display) {
    if (!(invalidInput(input))) {
        if (operators.includes(input)) {
            if (firstNumStart()) {
                firstNum = 0;
                operator = input;
            }
            else if (expandsFirstNum()) {
                operator = input;
            }
            else if (expandsOperation) {
                firstNum = operate(firstNum, secondNum, operator);
                if (firstNum == undefined) {
                    setDisplay(undefined, display);
                    clear();
                }
                operator = input;
                secondNum = NaN;
            }
            setDisplay(2, display);
        }

        else if (input == '=') {
            let result = operate(firstNum, secondNum, operator);
            setDisplay(result, display);
            clear();
        }

        else if (input == 'AC') {
            clear();
            setDisplay(0, display);
        }

        else if (input == 'C') {
            clearLast(display);
        }

        else if (input == '.') {
            if (firstNumStart()) {
                firstNum = 0 + '.';
                setDisplay(1, display);
            }
            else if (expandsSecondNum()) {
                secondNum = secondNum + '.';
                setDisplay(3, display)
            }
            else if (expandsFirstNum()) {
                firstNum = firstNum + '.';
                setDisplay(1, display);
            }
        }

        else if (input == '+/-') {
            sign = -1;
        }

        else {
            if (firstNumStart()) {
                firstNum = sign * Number(input);
                sign = 1;
                setDisplay(1, display);
            }
            else if (secondNumStart()) {
                secondNum = sign * Number(input);
                sign = 1;
                setDisplay(3, display);
            }
            else if (expandsFirstNum()) {
                if (firstNum instanceof Number && firstNum == 0) {
                    firstNum = input;
                }
                else {
                    firstNum = Number(firstNum.toString() + input);
                }
                setDisplay(1, display);
            }
            else if (expandsSecondNum()) {
                secondNum = Number(secondNum.toString() + input);
                setDisplay(3, display);
            }
        }
    }

    else {
        console.error("Invalid input: " + errorMessage);
        setDisplay(undefined, display);
    }
}

// Fully clear the display
function clear() {
    sign = 1;
    firstNum = NaN;
    secondNum = NaN;
    operator = 'none';
}

function operate(num1, num2, operator) {
    if (operators.includes(operator) && !(isNaN(num1) || isNaN(num2))) {
        switch (operator) {
            case '+':
                return add(num1, num2);
            case '-':
                return substract(num1, num2);
            case '*':
                return multiply(num1, num2);
            case '/':
                return divide(num1, num2);
            case '%':
                return modulo(num1, num2);
        }
    }
}

function add(num1, num2) { return num1 + num2; }

function substract(num1, num2) { return num1 - num2; }

function multiply(num1, num2) { return num1 * num2; }

function divide(num1, num2) {
    if (num2 == 0) {
        console.error("Error: dividing by zero");
        return undefined;
    }
    else { return num1 / num2; }
}

function modulo(num1, num2) {
    if (num2 == 0) {
        console.error("Error: dividing by zero");
        return undefined;
    }
    else { return num1 % num2; }
}
// keyboard support
//TD: debuggen 