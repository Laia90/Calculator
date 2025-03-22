let firstNum = NaN;
let secondNum = NaN;
let operator = 'none';

const operators = ['+', '-', '*', '/', '%'];

function setDisplay(num) {
    decimal = num.split('.');

    if (decimal.length > 2) {
        //throw error
        console.error("invalid output string");
    }

    else if (decimal.length == 2) {
        if (decimal[1].length > 10) {
            num = round(num * 100) / 100;
        }
    }

    document.querySelector("div.screen span").textContent = num;
}

function getDisplay() {
    input = this.textContent;

    if (input in operators) {
        if ((operator in operators && (firstNum == NaN || secondNum == NaN)) || (!(operator in operators) && endsWithDecimal(firstNum) || endsWithDecimal(secondNum))) {
            //throw error/ignore
            console.log("Not allowed");
        }
        else if (!(operator in operators)) {
            operator = input;
        }
        else if (operator in operators && firstNum != NaN && secondNum != NaN) {
            firstNum = operate(firstNum, secondNum, operator);
            operator = input;
            secondNum = NaN;
            setDisplay(firstNum);
        }
    }

    else if (input == '=') {
        if (!(operator in operators) || firstNum == NaN || secondNum == NaN) {
            //throw error/ignore
            console.log("Not allowed");
        }
        else {
            let display = operate(firstNum, secondNum, operator);
            setDisplay(display);
            clear();
        }
    }

    else if (input == 'C') {
        clear();
    }

    else if (input == '.') {
        if ((operator in operators && secondNum == NaN) || firstNum == NaN || (operator in operators && endsWithDecimal(secondNum)) || (!(operator in operators) && endsWithDecimal(firstNum))) {
            //throw error/ignore
            console.log("Not allowed");
        }
        else if (operator in operators) { secondNum = secondNum + '.'; }
        else { firstNum = firstNum + '.' }
    }

    else if (Number(input) != NaN) {
        if ((operator in operators && firstNum == NaN) || (!(operator in operators && secondNum != NaN))) {
            //throw error/ignore
            console.log("Not allowed");
        }
        else if (operator in operators && firstNum != NaN && secondNum != NaN) {
            secondNum = secondNum.toString() + input.toString();
            setDisplay(secondNum);
        }
        else if (operator in operators && firstNum != NaN && secondNum == NaN) {
            secondNum = input;
            setDisplay(secondNum);
        }
        else if (!(operator in operators) && firstNum == NaN && secondNum == NaN) {
            firstNum = input;
            setDisplay(firstNum);
        }
        else if (!(operator in operators) && firstNum != NaN && secondNum == NaN) {
            firstNum = firstNum.toString + input.toString;
            setDisplay(firstNum);
        }
    }

    else { console.error("Invalid input"); }
}

function clear() {
    firstNum = NaN;
    secondNum = NaN;
    operator = 'none';
}

endsWithDecimal(num){
    return num[-1] == '.';
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

//TD: backspace button, keyboard support
//TD: debuggen 