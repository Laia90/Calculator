let firstNum = NaN;
let secondNum = NaN;
let operator = 'none';

const operators = ['+', '-', '*', '/', '%'];
const validInputs = ['+', '-', '*', '/', '%', '=', '.', '+/-', 'C', 'AC', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const display = document.querySelector("div.screen span");
const buttons = document.querySelector("div.numpad");

buttons.addEventListener("click", buttonClicked);

function buttonClicked(event) {
    getDisplay(event.target.textContent);
}

/* Input is invalid if:
 * - an operator, equals sign or decimal point is entered where a number is expected
 * - an operation would be executed but needed inputs are missing 
 * - single character clear would be called before any input is entered
 * - a sign is entered anywhere but the start of a number
 * - a decimal point would be added to a number that is already a decimal number
 * - the input is not in the list of valid inputs
 */
function invalidInput(input) {
    return invalidLeadingCharacter(input) ||
        ((input == '=' || expandsOperation(input)) && invalidOperateCall()) ||
        (input == 'C' && firstNumStart()) ||
        (input == '+/-' && !(firstNumStart() || secondNumStart())) ||
        (repeatedDecimal(firstNum) || repeatedDecimal(secondNum)) ||
        (input == '.' && (expandsFirstNum() && isDecimalNumber(firstNum)) || (expandsSecondNum() && isDecimalNumber(secondNum))) ||
        !(input in validInputs);
}

function invalidLeadingCharacter(input) {
    let invalid = input == '=' || input == '.' || input in operators;
    return (firstNumStart() && invalid) || (secondNumStart() && invalid);
}

function invalidOperateCall() {
    return firstNumMissing() || operatorMissing() || firstNumStart() || secondNumStart() || leadingDecimal() || trailingDecimal() || trailingSign();
}

function firstNumMissing() {
    return operator in operators && firstNum == NaN;
}

function operatorMissing() {
    return !(operator in operators) && secondNum != NaN;
}

function lastCharacter(str) { return str[-1]; }
function firstCharacter(str) { return str[1]; }

function expandsOperation(input) {
    return input in operators && expandsSecondNum();
}

function trailingSign() {
    return firstNum[-1] == '-' || secondNum[-1] == '-';
}

function trailingDecimal() {
    return (expandsFirstNum() && lastCharacter(firstNum) == '.') || (expandsSecondNum() && lastCharacter(secondNum) == '.');
}

function leadingDecimal() {
    return (firstNum != NaN && firstCharacter(firstNum) == '.') || (secondNum != NaN && firstCharacter(secondNum) == '.');
}

function isDecimalNumber(num) {
    return num.split('.').length == 2;
}

function repeatedDecimal(num) {
    return num.split('.') > 2;
}

function expandsFirstNum() {
    return !(operator in operators) && firstNum != NaN;
}

function expandsSecondNum() {
    return operator in operators && firstNum != NaN && secondNum != NaN;
}

function firstNumStart() {
    return firstNum == NaN && secondNum == NaN && operator == 'none';
}

function secondNumStart() {
    return firstNum != NaN && operator in operators && secondNum == NaN;
}

function roundDecimal(num) {
    if (isDecimalNumber(num)) {
        if (num.split()[1].length > 10) {
            num = round(num * 100) / 100;
        }
    }
    return num;
}

function clearLast() {
    if (secondNum != NaN) {
        secondNum = secondNum.slice(0, -1);
        if (secondNum == '') {
            secondNum = NaN;
            operator = NaN;
            setDisplay(firstNum);
        }
    }
    else if (operator in operators) {
        operator = NaN;
        setDisplay(firstNum);
    }

    else if (firstNum != NaN) {
        firstNum = firstNum.slice(0, -1);
        if (firstNum == '') {
            firstNum = NaN;
            setDisplay(0);
        }
    }
}

function setDisplay(num) {
    num = roundDecimal(num);
    display.textContent = num;
}

function getDisplay(input) {
    if (!(invalidInput(input))) {
        if (input in operators) {
            if (expandsFirstNum()) {
                operator = input;
            }
            else if (expandsOperation) {
                firstNum = operate(firstNum, secondNum, operator);
                operator = input;
                secondNum = NaN;
                setDisplay(firstNum);
            }
        }

        else if (input == '=') {
            let display = operate(firstNum, secondNum, operator);
            setDisplay(display);
            clear();
        }

        else if (input == 'AC') {
            clear();
        }

        else if (input == 'C') {
            clearLast();
        }

        else if (input == '.') {
            if (expandsSecondNum) { secondNum = secondNum + '.'; }
            else if (expandsFirstNum) { firstNum = firstNum + '.' }
        }

        else if (input == '+/-') {
            if (firstNumStart()) {
                firstNum = input;
            }
            else if (secondNumStart()) {
                secondNum = input;
            }
        }

        else {
            if (firstNumStart()) {
                firstNum = input;
                setDisplay(firstNum);
            }
            else if (secondNumStart()) {
                secondNum = input;
                setDisplay(secondNum);
            }
            else if (expandsFirstNum()) {
                firstNum = firstNum.toString + input.toString;
                setDisplay(firstNum);
            }
            else if (expandsSecondNum()) {
                secondNum = secondNum.toString() + input.toString();
                setDisplay(secondNum);
            }
        }
    }

    else {
        console.error("Invalid input");
    }
}

function clear() {
    firstNum = NaN;
    secondNum = NaN;
    operator = 'none';
}

function operate(num1, num2, operator) {
    if (operator in operators) {
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
        alarm("Cannot divide by zero!");
        return NaN;
    }
    else { return num1 / num2; }
}

function modulo(num1, num2) {
    if (num2 == 0) {
        alarm("Cannot divide by zero!");
        return NaN;
    }
    else { return num1 % num2; }
}
// keyboard support
//TD: debuggen 