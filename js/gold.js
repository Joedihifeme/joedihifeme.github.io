class Gold {
    constructor(value) {
        this.value = value;
        this.previousValue = 0;
        if (this.value.includes("x")) {
            this.multiplier = true;
        }
        else {
            this.multiplier = false;
        }
        if (this.value.includes("+") || this.value.includes("-")) {
            this.algebraic = true;
            this.operation = this.value[2];
            this.operator = Number(this.value.charAt(-1));
        }
        else {
            this.algebraic = false;
            this.operation = null;
            this.operator = 0;
        }
        if (!this.multiplier)
            this.num = Number(this.value);
        else {
            let temp = this.value.slice(this.value.indexOf("x"));
            this.num = temp === this.value ? 1 : Number(this.value.slice(0, this.value.indexOf("x")));
        }
    }
    updateValue() {
        if (!this.multiplier)
            this.value = String(this.num);
        else {
            let text = "x";
            if (!isNaN(this.num) && this.num > 1) {
                text = `${this.num}x`;
            }
            if (this.operation !== null) {
                text += ` ${this.operation} ${this.operator}`;
            }
            this.value = text;
        }
    }
    //used for comparisons
    get numeric() {
        if (!this.algebraic)
            return this.num;
        if (this.operation === "+")
            return (this.num * 1) + this.operator;
        else
            return (this.num * 1) - this.operator;
    }
    //used for spending/adding gold
    x(num = 1) {
        if (!this.multiplier)
            this.previousValue = this.num;
        else {
            this.previousValue = this.num * num;
            if (this.algebraic) {
                if (this.operation === "+")
                    this.previousValue += this.operator;
                else
                    this.previousValue -= this.operator;
            }
        }
        return this.previousValue;
    }
    add(num) {
        if (!this.multiplier)
            this.num += num;
        else if (!this.algebraic) {
            this.algebraic = true;
            this.operation = "+";
            this.operator = num;
        }
        else if (this.operation === "+")
            this.operator += num;
        else {
            this.operator -= num;
            if (this.operator === 0) {
                this.algebraic = false;
                this.operation = null;
            }
            else if (this.operator < 0) {
                this.operator = Math.abs(this.operator);
                this.operation = "+";
            }
        }
        this.updateValue();
    }
    subtract(num) {
        if (!this.multiplier) {
            this.num -= num;
            if (this.num < 0)
                this.num = 0;
        }
        else if (!this.algebraic) {
            this.algebraic = true;
            this.operation = "-";
            this.operator = num;
        }
        else if (this.operation === "-")
            this.operation += num;
        else {
            this.operator -= num;
            if (this.operator === 0) {
                this.algebraic = false;
                this.operation = null;
            }
            else if (this.operator < 0) {
                this.operator = Math.abs(this.operator);
                this.operation = "-";
            }
        }
        this.updateValue();
    }
    multiply(num) {
        if (!isNaN(this.num))
            this.num *= num;
        if (this.algebraic)
            this.operator *= num;
        this.updateValue();
    }
    divide(num) {
        if (!isNaN(this.num))
            this.num = Math.floor(this.num / num);
        if (this.algebraic)
            this.operator = Math.floor(this.operator / num);
        this.updateValue();
    }
}
export default Gold;
