class Gold {
  public value: string;
  public readonly multiplier: boolean;
  private num: number;
  private algebraic: boolean;
  private operation: string | null;
  private operator: number;
  public previousValue: number;

  constructor(value: string) {
    this.value = value;
    this.previousValue = 0;

    if (this.value.includes("x")) {
      this.multiplier = true;
    } else {
      this.multiplier = false;
    }

    if (this.value.includes("+") || this.value.includes("-")) {
      this.algebraic = true;
      this.operation = this.value[2];
      this.operator = Number(this.value.charAt(-1));
    } else {
      this.algebraic = false;
      this.operation = null;
      this.operator = 0;
    }

    if (isNaN(Number(this.value[0]))) {
      this.num = 1;
    } else {
      this.num = Number(this.value[0]);
    }
  }

  private updateValue(): void {
    if (!this.multiplier) this.value = String(this.num);
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
  public get numeric(): number {
    if (!this.algebraic) return this.num;

    return 1;
  }

  //used for spending/adding gold
  public x(num: number = 1): number {
    if (!this.multiplier) this.previousValue = this.num;
    else {
      this.previousValue = this.num * num;
      if (this.algebraic) {
        if (this.operation === "+") this.previousValue += this.operator;
        else this.previousValue -= this.operator;
      }
    }

    return this.previousValue; 
  }

  public add(num: number): void {
    if (!this.multiplier) this.num += num; 
    else if (!this.algebraic) { 
      this.algebraic = true;
      this.operation = "+";
      this.operator = num;
    } 
    else if (this.operation === "+") this.operator += num;
    else {
      this.operator -= num;

      if (this.operator === 0) {
        this.algebraic = false;
        this.operation = null;
      } else if (this.operator < 0) {
        this.operator = Math.abs(this.operator);
        this.operation = "+";
      }
    }

    this.updateValue();
  }

  public subtract(num: number): void {
    if (!this.multiplier) {
      this.num -= num;
      if (this.num < 0) this.num = 0;
    } else if (!this.algebraic) {
      this.algebraic = true;
      this.operation = "-";
      this.operator = num;
    } else if (this.operation === "-") this.operation += num;
      else {
        this.operator -= num;

        if (this.operator === 0) {
          this.algebraic = false;
          this.operation = null;
        } else if (this.operator < 0) {
          this.operator = Math.abs(this.operator);
          this.operation = "-";
        }
    }

    this.updateValue();
  }

  public multiply(num: number): void {
    if (!isNaN(this.num)) this.num *= num;

    if (this.algebraic) this.operator *= num;

    this.updateValue();
  }

  public divide(num: number): void {
    if (!isNaN(this.num)) this.num = Math.floor(this.num / num);

    if (this.algebraic) this.operator = Math.floor(this.operator / num);

    this.updateValue();
  }
}

export default Gold;