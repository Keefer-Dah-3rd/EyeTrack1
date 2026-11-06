var RealEye = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e2) {
      throw mod = 0, e2;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to2, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to2, key) && key !== except)
          __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to2;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/ml-matrix/matrix.js
  var require_matrix = __commonJS({
    "node_modules/ml-matrix/matrix.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var toString = Object.prototype.toString;
      function isAnyArray(value) {
        const tag = toString.call(value);
        return tag.endsWith("Array]") && !tag.includes("Big");
      }
      function max(input, options = {}) {
        if (!isAnyArray(input)) {
          throw new TypeError("input must be an array");
        }
        if (input.length === 0) {
          throw new TypeError("input must not be empty");
        }
        const { fromIndex = 0, toIndex = input.length } = options;
        if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
          throw new Error("fromIndex must be a positive integer smaller than length");
        }
        if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
          throw new Error("toIndex must be an integer greater than fromIndex and at most equal to length");
        }
        let maxValue = input[fromIndex];
        for (let i2 = fromIndex + 1; i2 < toIndex; i2++) {
          if (input[i2] > maxValue)
            maxValue = input[i2];
        }
        return maxValue;
      }
      function min(input, options = {}) {
        if (!isAnyArray(input)) {
          throw new TypeError("input must be an array");
        }
        if (input.length === 0) {
          throw new TypeError("input must not be empty");
        }
        const { fromIndex = 0, toIndex = input.length } = options;
        if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
          throw new Error("fromIndex must be a positive integer smaller than length");
        }
        if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
          throw new Error("toIndex must be an integer greater than fromIndex and at most equal to length");
        }
        let minValue = input[fromIndex];
        for (let i2 = fromIndex + 1; i2 < toIndex; i2++) {
          if (input[i2] < minValue)
            minValue = input[i2];
        }
        return minValue;
      }
      function rescale(input, options = {}) {
        if (!isAnyArray(input)) {
          throw new TypeError("input must be an array");
        } else if (input.length === 0) {
          throw new TypeError("input must not be empty");
        }
        let output;
        if (options.output !== void 0) {
          if (!isAnyArray(options.output)) {
            throw new TypeError("output option must be an array if specified");
          }
          output = options.output;
        } else {
          output = new Array(input.length);
        }
        const currentMin = min(input);
        const currentMax = max(input);
        if (currentMin === currentMax) {
          throw new RangeError("minimum and maximum input values are equal. Cannot rescale a constant array");
        }
        const { min: minValue = options.autoMinMax ? currentMin : 0, max: maxValue = options.autoMinMax ? currentMax : 1 } = options;
        if (minValue >= maxValue) {
          throw new RangeError("min option must be smaller than max option");
        }
        const factor = (maxValue - minValue) / (currentMax - currentMin);
        for (let i2 = 0; i2 < input.length; i2++) {
          output[i2] = (input[i2] - currentMin) * factor + minValue;
        }
        return output;
      }
      var indent = " ".repeat(2);
      var indentData = " ".repeat(4);
      function inspectMatrix() {
        return inspectMatrixWithOptions(this);
      }
      function inspectMatrixWithOptions(matrix2, options = {}) {
        const {
          maxRows = 15,
          maxColumns = 10,
          maxNumSize = 8,
          padMinus = "auto"
        } = options;
        return `${matrix2.constructor.name} {
${indent}[
${indentData}${inspectData(matrix2, maxRows, maxColumns, maxNumSize, padMinus)}
${indent}]
${indent}rows: ${matrix2.rows}
${indent}columns: ${matrix2.columns}
}`;
      }
      function inspectData(matrix2, maxRows, maxColumns, maxNumSize, padMinus) {
        const { rows, columns } = matrix2;
        const maxI = Math.min(rows, maxRows);
        const maxJ = Math.min(columns, maxColumns);
        const result = [];
        if (padMinus === "auto") {
          padMinus = false;
          loop: for (let i2 = 0; i2 < maxI; i2++) {
            for (let j2 = 0; j2 < maxJ; j2++) {
              if (matrix2.get(i2, j2) < 0) {
                padMinus = true;
                break loop;
              }
            }
          }
        }
        for (let i2 = 0; i2 < maxI; i2++) {
          let line = [];
          for (let j2 = 0; j2 < maxJ; j2++) {
            line.push(formatNumber(matrix2.get(i2, j2), maxNumSize, padMinus));
          }
          result.push(`${line.join(" ")}`);
        }
        if (maxJ !== columns) {
          result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
        }
        if (maxI !== rows) {
          result.push(`... ${rows - maxRows} more rows`);
        }
        return result.join(`
${indentData}`);
      }
      function formatNumber(num, maxNumSize, padMinus) {
        return (num >= 0 && padMinus ? ` ${formatNumber2(num, maxNumSize - 1)}` : formatNumber2(num, maxNumSize)).padEnd(maxNumSize);
      }
      function formatNumber2(num, len) {
        let str = num.toString();
        if (str.length <= len) return str;
        let fix = num.toFixed(len);
        if (fix.length > len) {
          fix = num.toFixed(Math.max(0, len - (fix.length - len)));
        }
        if (fix.length <= len && !fix.startsWith("0.000") && !fix.startsWith("-0.000")) {
          return fix;
        }
        let exp = num.toExponential(len);
        if (exp.length > len) {
          exp = num.toExponential(Math.max(0, len - (exp.length - len)));
        }
        return exp.slice(0);
      }
      function installMathOperations(AbstractMatrix3, Matrix4) {
        AbstractMatrix3.prototype.add = function add(value) {
          if (typeof value === "number") return this.addS(value);
          return this.addM(value);
        };
        AbstractMatrix3.prototype.addS = function addS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) + value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.addM = function addM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) + matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.add = function add(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.add(value);
        };
        AbstractMatrix3.prototype.sub = function sub(value) {
          if (typeof value === "number") return this.subS(value);
          return this.subM(value);
        };
        AbstractMatrix3.prototype.subS = function subS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) - value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.subM = function subM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) - matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.sub = function sub(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.sub(value);
        };
        AbstractMatrix3.prototype.subtract = AbstractMatrix3.prototype.sub;
        AbstractMatrix3.prototype.subtractS = AbstractMatrix3.prototype.subS;
        AbstractMatrix3.prototype.subtractM = AbstractMatrix3.prototype.subM;
        AbstractMatrix3.subtract = AbstractMatrix3.sub;
        AbstractMatrix3.prototype.mul = function mul(value) {
          if (typeof value === "number") return this.mulS(value);
          return this.mulM(value);
        };
        AbstractMatrix3.prototype.mulS = function mulS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) * value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.mulM = function mulM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) * matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.mul = function mul(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.mul(value);
        };
        AbstractMatrix3.prototype.multiply = AbstractMatrix3.prototype.mul;
        AbstractMatrix3.prototype.multiplyS = AbstractMatrix3.prototype.mulS;
        AbstractMatrix3.prototype.multiplyM = AbstractMatrix3.prototype.mulM;
        AbstractMatrix3.multiply = AbstractMatrix3.mul;
        AbstractMatrix3.prototype.div = function div(value) {
          if (typeof value === "number") return this.divS(value);
          return this.divM(value);
        };
        AbstractMatrix3.prototype.divS = function divS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) / value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.divM = function divM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) / matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.div = function div(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.div(value);
        };
        AbstractMatrix3.prototype.divide = AbstractMatrix3.prototype.div;
        AbstractMatrix3.prototype.divideS = AbstractMatrix3.prototype.divS;
        AbstractMatrix3.prototype.divideM = AbstractMatrix3.prototype.divM;
        AbstractMatrix3.divide = AbstractMatrix3.div;
        AbstractMatrix3.prototype.mod = function mod(value) {
          if (typeof value === "number") return this.modS(value);
          return this.modM(value);
        };
        AbstractMatrix3.prototype.modS = function modS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) % value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.modM = function modM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) % matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.mod = function mod(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.mod(value);
        };
        AbstractMatrix3.prototype.modulus = AbstractMatrix3.prototype.mod;
        AbstractMatrix3.prototype.modulusS = AbstractMatrix3.prototype.modS;
        AbstractMatrix3.prototype.modulusM = AbstractMatrix3.prototype.modM;
        AbstractMatrix3.modulus = AbstractMatrix3.mod;
        AbstractMatrix3.prototype.and = function and(value) {
          if (typeof value === "number") return this.andS(value);
          return this.andM(value);
        };
        AbstractMatrix3.prototype.andS = function andS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) & value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.andM = function andM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) & matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.and = function and(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.and(value);
        };
        AbstractMatrix3.prototype.or = function or2(value) {
          if (typeof value === "number") return this.orS(value);
          return this.orM(value);
        };
        AbstractMatrix3.prototype.orS = function orS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) | value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.orM = function orM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) | matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.or = function or2(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.or(value);
        };
        AbstractMatrix3.prototype.xor = function xor(value) {
          if (typeof value === "number") return this.xorS(value);
          return this.xorM(value);
        };
        AbstractMatrix3.prototype.xorS = function xorS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) ^ value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.xorM = function xorM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) ^ matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.xor = function xor(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.xor(value);
        };
        AbstractMatrix3.prototype.leftShift = function leftShift(value) {
          if (typeof value === "number") return this.leftShiftS(value);
          return this.leftShiftM(value);
        };
        AbstractMatrix3.prototype.leftShiftS = function leftShiftS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) << value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.leftShiftM = function leftShiftM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) << matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.leftShift = function leftShift(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.leftShift(value);
        };
        AbstractMatrix3.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
          if (typeof value === "number") return this.signPropagatingRightShiftS(value);
          return this.signPropagatingRightShiftM(value);
        };
        AbstractMatrix3.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) >> value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) >> matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.signPropagatingRightShift = function signPropagatingRightShift(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.signPropagatingRightShift(value);
        };
        AbstractMatrix3.prototype.rightShift = function rightShift(value) {
          if (typeof value === "number") return this.rightShiftS(value);
          return this.rightShiftM(value);
        };
        AbstractMatrix3.prototype.rightShiftS = function rightShiftS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) >>> value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.rightShiftM = function rightShiftM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) >>> matrix2.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.rightShift = function rightShift(matrix2, value) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.rightShift(value);
        };
        AbstractMatrix3.prototype.zeroFillRightShift = AbstractMatrix3.prototype.rightShift;
        AbstractMatrix3.prototype.zeroFillRightShiftS = AbstractMatrix3.prototype.rightShiftS;
        AbstractMatrix3.prototype.zeroFillRightShiftM = AbstractMatrix3.prototype.rightShiftM;
        AbstractMatrix3.zeroFillRightShift = AbstractMatrix3.rightShift;
        AbstractMatrix3.prototype.not = function not() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, ~this.get(i2, j2));
            }
          }
          return this;
        };
        AbstractMatrix3.not = function not(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.not();
        };
        AbstractMatrix3.prototype.abs = function abs() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.abs(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.abs = function abs(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.abs();
        };
        AbstractMatrix3.prototype.acos = function acos() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.acos(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.acos = function acos(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.acos();
        };
        AbstractMatrix3.prototype.acosh = function acosh() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.acosh(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.acosh = function acosh(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.acosh();
        };
        AbstractMatrix3.prototype.asin = function asin() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.asin(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.asin = function asin(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.asin();
        };
        AbstractMatrix3.prototype.asinh = function asinh() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.asinh(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.asinh = function asinh(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.asinh();
        };
        AbstractMatrix3.prototype.atan = function atan() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.atan(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.atan = function atan(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.atan();
        };
        AbstractMatrix3.prototype.atanh = function atanh() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.atanh(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.atanh = function atanh(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.atanh();
        };
        AbstractMatrix3.prototype.cbrt = function cbrt() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.cbrt(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.cbrt = function cbrt(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.cbrt();
        };
        AbstractMatrix3.prototype.ceil = function ceil() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.ceil(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.ceil = function ceil(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.ceil();
        };
        AbstractMatrix3.prototype.clz32 = function clz32() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.clz32(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.clz32 = function clz32(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.clz32();
        };
        AbstractMatrix3.prototype.cos = function cos() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.cos(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.cos = function cos(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.cos();
        };
        AbstractMatrix3.prototype.cosh = function cosh() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.cosh(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.cosh = function cosh(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.cosh();
        };
        AbstractMatrix3.prototype.exp = function exp() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.exp(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.exp = function exp(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.exp();
        };
        AbstractMatrix3.prototype.expm1 = function expm1() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.expm1(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.expm1 = function expm1(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.expm1();
        };
        AbstractMatrix3.prototype.floor = function floor() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.floor(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.floor = function floor(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.floor();
        };
        AbstractMatrix3.prototype.fround = function fround() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.fround(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.fround = function fround(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.fround();
        };
        AbstractMatrix3.prototype.log = function log() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.log(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.log = function log(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.log();
        };
        AbstractMatrix3.prototype.log1p = function log1p() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.log1p(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.log1p = function log1p(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.log1p();
        };
        AbstractMatrix3.prototype.log10 = function log10() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.log10(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.log10 = function log10(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.log10();
        };
        AbstractMatrix3.prototype.log2 = function log2() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.log2(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.log2 = function log2(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.log2();
        };
        AbstractMatrix3.prototype.round = function round() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.round(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.round = function round(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.round();
        };
        AbstractMatrix3.prototype.sign = function sign() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.sign(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.sign = function sign(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.sign();
        };
        AbstractMatrix3.prototype.sin = function sin() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.sin(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.sin = function sin(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.sin();
        };
        AbstractMatrix3.prototype.sinh = function sinh() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.sinh(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.sinh = function sinh(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.sinh();
        };
        AbstractMatrix3.prototype.sqrt = function sqrt() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.sqrt(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.sqrt = function sqrt(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.sqrt();
        };
        AbstractMatrix3.prototype.tan = function tan() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.tan(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.tan = function tan(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.tan();
        };
        AbstractMatrix3.prototype.tanh = function tanh() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.tanh(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.tanh = function tanh(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.tanh();
        };
        AbstractMatrix3.prototype.trunc = function trunc() {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, Math.trunc(this.get(i2, j2)));
            }
          }
          return this;
        };
        AbstractMatrix3.trunc = function trunc(matrix2) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.trunc();
        };
        AbstractMatrix3.pow = function pow(matrix2, arg0) {
          const newMatrix = new Matrix4(matrix2);
          return newMatrix.pow(arg0);
        };
        AbstractMatrix3.prototype.pow = function pow(value) {
          if (typeof value === "number") return this.powS(value);
          return this.powM(value);
        };
        AbstractMatrix3.prototype.powS = function powS(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) ** value);
            }
          }
          return this;
        };
        AbstractMatrix3.prototype.powM = function powM(matrix2) {
          matrix2 = Matrix4.checkMatrix(matrix2);
          if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
            throw new RangeError("Matrices dimensions must be equal");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) ** matrix2.get(i2, j2));
            }
          }
          return this;
        };
      }
      function checkRowIndex(matrix2, index, outer) {
        let max2 = outer ? matrix2.rows : matrix2.rows - 1;
        if (index < 0 || index > max2) {
          throw new RangeError("Row index out of range");
        }
      }
      function checkColumnIndex(matrix2, index, outer) {
        let max2 = outer ? matrix2.columns : matrix2.columns - 1;
        if (index < 0 || index > max2) {
          throw new RangeError("Column index out of range");
        }
      }
      function checkRowVector(matrix2, vector) {
        if (vector.to1DArray) {
          vector = vector.to1DArray();
        }
        if (vector.length !== matrix2.columns) {
          throw new RangeError(
            "vector size must be the same as the number of columns"
          );
        }
        return vector;
      }
      function checkColumnVector(matrix2, vector) {
        if (vector.to1DArray) {
          vector = vector.to1DArray();
        }
        if (vector.length !== matrix2.rows) {
          throw new RangeError("vector size must be the same as the number of rows");
        }
        return vector;
      }
      function checkRowIndices(matrix2, rowIndices) {
        if (!isAnyArray(rowIndices)) {
          throw new TypeError("row indices must be an array");
        }
        for (let i2 = 0; i2 < rowIndices.length; i2++) {
          if (rowIndices[i2] < 0 || rowIndices[i2] >= matrix2.rows) {
            throw new RangeError("row indices are out of range");
          }
        }
      }
      function checkColumnIndices(matrix2, columnIndices) {
        if (!isAnyArray(columnIndices)) {
          throw new TypeError("column indices must be an array");
        }
        for (let i2 = 0; i2 < columnIndices.length; i2++) {
          if (columnIndices[i2] < 0 || columnIndices[i2] >= matrix2.columns) {
            throw new RangeError("column indices are out of range");
          }
        }
      }
      function checkRange(matrix2, startRow, endRow, startColumn, endColumn) {
        if (arguments.length !== 5) {
          throw new RangeError("expected 4 arguments");
        }
        checkNumber("startRow", startRow);
        checkNumber("endRow", endRow);
        checkNumber("startColumn", startColumn);
        checkNumber("endColumn", endColumn);
        if (startRow > endRow || startColumn > endColumn || startRow < 0 || startRow >= matrix2.rows || endRow < 0 || endRow >= matrix2.rows || startColumn < 0 || startColumn >= matrix2.columns || endColumn < 0 || endColumn >= matrix2.columns) {
          throw new RangeError("Submatrix indices are out of range");
        }
      }
      function newArray(length, value = 0) {
        let array = [];
        for (let i2 = 0; i2 < length; i2++) {
          array.push(value);
        }
        return array;
      }
      function checkNumber(name, value) {
        if (typeof value !== "number") {
          throw new TypeError(`${name} must be a number`);
        }
      }
      function checkNonEmpty(matrix2) {
        if (matrix2.isEmpty()) {
          throw new Error("Empty matrix has no elements to index");
        }
      }
      function sumByRow(matrix2) {
        let sum = newArray(matrix2.rows);
        for (let i2 = 0; i2 < matrix2.rows; ++i2) {
          for (let j2 = 0; j2 < matrix2.columns; ++j2) {
            sum[i2] += matrix2.get(i2, j2);
          }
        }
        return sum;
      }
      function sumByColumn(matrix2) {
        let sum = newArray(matrix2.columns);
        for (let i2 = 0; i2 < matrix2.rows; ++i2) {
          for (let j2 = 0; j2 < matrix2.columns; ++j2) {
            sum[j2] += matrix2.get(i2, j2);
          }
        }
        return sum;
      }
      function sumAll(matrix2) {
        let v2 = 0;
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            v2 += matrix2.get(i2, j2);
          }
        }
        return v2;
      }
      function productByRow(matrix2) {
        let sum = newArray(matrix2.rows, 1);
        for (let i2 = 0; i2 < matrix2.rows; ++i2) {
          for (let j2 = 0; j2 < matrix2.columns; ++j2) {
            sum[i2] *= matrix2.get(i2, j2);
          }
        }
        return sum;
      }
      function productByColumn(matrix2) {
        let sum = newArray(matrix2.columns, 1);
        for (let i2 = 0; i2 < matrix2.rows; ++i2) {
          for (let j2 = 0; j2 < matrix2.columns; ++j2) {
            sum[j2] *= matrix2.get(i2, j2);
          }
        }
        return sum;
      }
      function productAll(matrix2) {
        let v2 = 1;
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            v2 *= matrix2.get(i2, j2);
          }
        }
        return v2;
      }
      function varianceByRow(matrix2, unbiased, mean) {
        const rows = matrix2.rows;
        const cols = matrix2.columns;
        const variance = [];
        for (let i2 = 0; i2 < rows; i2++) {
          let sum1 = 0;
          let sum2 = 0;
          let x2 = 0;
          for (let j2 = 0; j2 < cols; j2++) {
            x2 = matrix2.get(i2, j2) - mean[i2];
            sum1 += x2;
            sum2 += x2 * x2;
          }
          if (unbiased) {
            variance.push((sum2 - sum1 * sum1 / cols) / (cols - 1));
          } else {
            variance.push((sum2 - sum1 * sum1 / cols) / cols);
          }
        }
        return variance;
      }
      function varianceByColumn(matrix2, unbiased, mean) {
        const rows = matrix2.rows;
        const cols = matrix2.columns;
        const variance = [];
        for (let j2 = 0; j2 < cols; j2++) {
          let sum1 = 0;
          let sum2 = 0;
          let x2 = 0;
          for (let i2 = 0; i2 < rows; i2++) {
            x2 = matrix2.get(i2, j2) - mean[j2];
            sum1 += x2;
            sum2 += x2 * x2;
          }
          if (unbiased) {
            variance.push((sum2 - sum1 * sum1 / rows) / (rows - 1));
          } else {
            variance.push((sum2 - sum1 * sum1 / rows) / rows);
          }
        }
        return variance;
      }
      function varianceAll(matrix2, unbiased, mean) {
        const rows = matrix2.rows;
        const cols = matrix2.columns;
        const size = rows * cols;
        let sum1 = 0;
        let sum2 = 0;
        let x2 = 0;
        for (let i2 = 0; i2 < rows; i2++) {
          for (let j2 = 0; j2 < cols; j2++) {
            x2 = matrix2.get(i2, j2) - mean;
            sum1 += x2;
            sum2 += x2 * x2;
          }
        }
        if (unbiased) {
          return (sum2 - sum1 * sum1 / size) / (size - 1);
        } else {
          return (sum2 - sum1 * sum1 / size) / size;
        }
      }
      function centerByRow(matrix2, mean) {
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            matrix2.set(i2, j2, matrix2.get(i2, j2) - mean[i2]);
          }
        }
      }
      function centerByColumn(matrix2, mean) {
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            matrix2.set(i2, j2, matrix2.get(i2, j2) - mean[j2]);
          }
        }
      }
      function centerAll(matrix2, mean) {
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            matrix2.set(i2, j2, matrix2.get(i2, j2) - mean);
          }
        }
      }
      function getScaleByRow(matrix2) {
        const scale = [];
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          let sum = 0;
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            sum += matrix2.get(i2, j2) ** 2 / (matrix2.columns - 1);
          }
          scale.push(Math.sqrt(sum));
        }
        return scale;
      }
      function scaleByRow(matrix2, scale) {
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            matrix2.set(i2, j2, matrix2.get(i2, j2) / scale[i2]);
          }
        }
      }
      function getScaleByColumn(matrix2) {
        const scale = [];
        for (let j2 = 0; j2 < matrix2.columns; j2++) {
          let sum = 0;
          for (let i2 = 0; i2 < matrix2.rows; i2++) {
            sum += matrix2.get(i2, j2) ** 2 / (matrix2.rows - 1);
          }
          scale.push(Math.sqrt(sum));
        }
        return scale;
      }
      function scaleByColumn(matrix2, scale) {
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            matrix2.set(i2, j2, matrix2.get(i2, j2) / scale[j2]);
          }
        }
      }
      function getScaleAll(matrix2) {
        const divider = matrix2.size - 1;
        let sum = 0;
        for (let j2 = 0; j2 < matrix2.columns; j2++) {
          for (let i2 = 0; i2 < matrix2.rows; i2++) {
            sum += matrix2.get(i2, j2) ** 2 / divider;
          }
        }
        return Math.sqrt(sum);
      }
      function scaleAll(matrix2, scale) {
        for (let i2 = 0; i2 < matrix2.rows; i2++) {
          for (let j2 = 0; j2 < matrix2.columns; j2++) {
            matrix2.set(i2, j2, matrix2.get(i2, j2) / scale);
          }
        }
      }
      var AbstractMatrix2 = class _AbstractMatrix {
        static from1DArray(newRows, newColumns, newData) {
          let length = newRows * newColumns;
          if (length !== newData.length) {
            throw new RangeError("data length does not match given dimensions");
          }
          let newMatrix = new Matrix3(newRows, newColumns);
          for (let row = 0; row < newRows; row++) {
            for (let column = 0; column < newColumns; column++) {
              newMatrix.set(row, column, newData[row * newColumns + column]);
            }
          }
          return newMatrix;
        }
        static rowVector(newData) {
          let vector = new Matrix3(1, newData.length);
          for (let i2 = 0; i2 < newData.length; i2++) {
            vector.set(0, i2, newData[i2]);
          }
          return vector;
        }
        static columnVector(newData) {
          let vector = new Matrix3(newData.length, 1);
          for (let i2 = 0; i2 < newData.length; i2++) {
            vector.set(i2, 0, newData[i2]);
          }
          return vector;
        }
        static zeros(rows, columns) {
          return new Matrix3(rows, columns);
        }
        static ones(rows, columns) {
          return new Matrix3(rows, columns).fill(1);
        }
        static rand(rows, columns, options = {}) {
          if (typeof options !== "object") {
            throw new TypeError("options must be an object");
          }
          const { random = Math.random } = options;
          let matrix2 = new Matrix3(rows, columns);
          for (let i2 = 0; i2 < rows; i2++) {
            for (let j2 = 0; j2 < columns; j2++) {
              matrix2.set(i2, j2, random());
            }
          }
          return matrix2;
        }
        static randInt(rows, columns, options = {}) {
          if (typeof options !== "object") {
            throw new TypeError("options must be an object");
          }
          const { min: min2 = 0, max: max2 = 1e3, random = Math.random } = options;
          if (!Number.isInteger(min2)) throw new TypeError("min must be an integer");
          if (!Number.isInteger(max2)) throw new TypeError("max must be an integer");
          if (min2 >= max2) throw new RangeError("min must be smaller than max");
          let interval = max2 - min2;
          let matrix2 = new Matrix3(rows, columns);
          for (let i2 = 0; i2 < rows; i2++) {
            for (let j2 = 0; j2 < columns; j2++) {
              let value = min2 + Math.round(random() * interval);
              matrix2.set(i2, j2, value);
            }
          }
          return matrix2;
        }
        static eye(rows, columns, value) {
          if (columns === void 0) columns = rows;
          if (value === void 0) value = 1;
          let min2 = Math.min(rows, columns);
          let matrix2 = this.zeros(rows, columns);
          for (let i2 = 0; i2 < min2; i2++) {
            matrix2.set(i2, i2, value);
          }
          return matrix2;
        }
        static diag(data, rows, columns) {
          let l2 = data.length;
          if (rows === void 0) rows = l2;
          if (columns === void 0) columns = rows;
          let min2 = Math.min(l2, rows, columns);
          let matrix2 = this.zeros(rows, columns);
          for (let i2 = 0; i2 < min2; i2++) {
            matrix2.set(i2, i2, data[i2]);
          }
          return matrix2;
        }
        static min(matrix1, matrix2) {
          matrix1 = this.checkMatrix(matrix1);
          matrix2 = this.checkMatrix(matrix2);
          let rows = matrix1.rows;
          let columns = matrix1.columns;
          let result = new Matrix3(rows, columns);
          for (let i2 = 0; i2 < rows; i2++) {
            for (let j2 = 0; j2 < columns; j2++) {
              result.set(i2, j2, Math.min(matrix1.get(i2, j2), matrix2.get(i2, j2)));
            }
          }
          return result;
        }
        static max(matrix1, matrix2) {
          matrix1 = this.checkMatrix(matrix1);
          matrix2 = this.checkMatrix(matrix2);
          let rows = matrix1.rows;
          let columns = matrix1.columns;
          let result = new this(rows, columns);
          for (let i2 = 0; i2 < rows; i2++) {
            for (let j2 = 0; j2 < columns; j2++) {
              result.set(i2, j2, Math.max(matrix1.get(i2, j2), matrix2.get(i2, j2)));
            }
          }
          return result;
        }
        static checkMatrix(value) {
          return _AbstractMatrix.isMatrix(value) ? value : new Matrix3(value);
        }
        static isMatrix(value) {
          return value != null && value.klass === "Matrix";
        }
        get size() {
          return this.rows * this.columns;
        }
        apply(callback) {
          if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
          }
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              callback.call(this, i2, j2);
            }
          }
          return this;
        }
        applyAlongAxis(callback, by) {
          if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
          }
          const result = [];
          switch (by) {
            case "row": {
              for (let i2 = 0; i2 < this.rows; i2++) {
                result.push(callback.call(this, this.getRow(i2), i2));
              }
              break;
            }
            case "column": {
              for (let i2 = 0; i2 < this.columns; i2++) {
                result.push(callback.call(this, this.getColumn(i2), i2));
              }
              break;
            }
            default:
              throw new Error(`invalid option: ${by}`);
          }
          return result;
        }
        to1DArray() {
          let array = [];
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              array.push(this.get(i2, j2));
            }
          }
          return array;
        }
        to2DArray() {
          let copy = [];
          for (let i2 = 0; i2 < this.rows; i2++) {
            copy.push([]);
            for (let j2 = 0; j2 < this.columns; j2++) {
              copy[i2].push(this.get(i2, j2));
            }
          }
          return copy;
        }
        toJSON() {
          return this.to2DArray();
        }
        isRowVector() {
          return this.rows === 1;
        }
        isColumnVector() {
          return this.columns === 1;
        }
        isVector() {
          return this.rows === 1 || this.columns === 1;
        }
        isSquare() {
          return this.rows === this.columns;
        }
        isEmpty() {
          return this.rows === 0 || this.columns === 0;
        }
        isSymmetric() {
          if (this.isSquare()) {
            for (let i2 = 0; i2 < this.rows; i2++) {
              for (let j2 = 0; j2 <= i2; j2++) {
                if (this.get(i2, j2) !== this.get(j2, i2)) {
                  return false;
                }
              }
            }
            return true;
          }
          return false;
        }
        isDistance() {
          if (!this.isSymmetric()) return false;
          for (let i2 = 0; i2 < this.rows; i2++) {
            if (this.get(i2, i2) !== 0) return false;
          }
          return true;
        }
        isEchelonForm() {
          let i2 = 0;
          let j2 = 0;
          let previousColumn = -1;
          let isEchelonForm = true;
          let checked = false;
          while (i2 < this.rows && isEchelonForm) {
            j2 = 0;
            checked = false;
            while (j2 < this.columns && checked === false) {
              if (this.get(i2, j2) === 0) {
                j2++;
              } else if (this.get(i2, j2) === 1 && j2 > previousColumn) {
                checked = true;
                previousColumn = j2;
              } else {
                isEchelonForm = false;
                checked = true;
              }
            }
            i2++;
          }
          return isEchelonForm;
        }
        isReducedEchelonForm() {
          let i2 = 0;
          let j2 = 0;
          let previousColumn = -1;
          let isReducedEchelonForm = true;
          let checked = false;
          while (i2 < this.rows && isReducedEchelonForm) {
            j2 = 0;
            checked = false;
            while (j2 < this.columns && checked === false) {
              if (this.get(i2, j2) === 0) {
                j2++;
              } else if (this.get(i2, j2) === 1 && j2 > previousColumn) {
                checked = true;
                previousColumn = j2;
              } else {
                isReducedEchelonForm = false;
                checked = true;
              }
            }
            for (let k2 = j2 + 1; k2 < this.rows; k2++) {
              if (this.get(i2, k2) !== 0) {
                isReducedEchelonForm = false;
              }
            }
            i2++;
          }
          return isReducedEchelonForm;
        }
        echelonForm() {
          let result = this.clone();
          let h2 = 0;
          let k2 = 0;
          while (h2 < result.rows && k2 < result.columns) {
            let iMax = h2;
            for (let i2 = h2; i2 < result.rows; i2++) {
              if (result.get(i2, k2) > result.get(iMax, k2)) {
                iMax = i2;
              }
            }
            if (result.get(iMax, k2) === 0) {
              k2++;
            } else {
              result.swapRows(h2, iMax);
              let tmp = result.get(h2, k2);
              for (let j2 = k2; j2 < result.columns; j2++) {
                result.set(h2, j2, result.get(h2, j2) / tmp);
              }
              for (let i2 = h2 + 1; i2 < result.rows; i2++) {
                let factor = result.get(i2, k2) / result.get(h2, k2);
                result.set(i2, k2, 0);
                for (let j2 = k2 + 1; j2 < result.columns; j2++) {
                  result.set(i2, j2, result.get(i2, j2) - result.get(h2, j2) * factor);
                }
              }
              h2++;
              k2++;
            }
          }
          return result;
        }
        reducedEchelonForm() {
          let result = this.echelonForm();
          let m2 = result.columns;
          let n2 = result.rows;
          let h2 = n2 - 1;
          while (h2 >= 0) {
            if (result.maxRow(h2) === 0) {
              h2--;
            } else {
              let p2 = 0;
              let pivot = false;
              while (p2 < n2 && pivot === false) {
                if (result.get(h2, p2) === 1) {
                  pivot = true;
                } else {
                  p2++;
                }
              }
              for (let i2 = 0; i2 < h2; i2++) {
                let factor = result.get(i2, p2);
                for (let j2 = p2; j2 < m2; j2++) {
                  let tmp = result.get(i2, j2) - factor * result.get(h2, j2);
                  result.set(i2, j2, tmp);
                }
              }
              h2--;
            }
          }
          return result;
        }
        set() {
          throw new Error("set method is unimplemented");
        }
        get() {
          throw new Error("get method is unimplemented");
        }
        repeat(options = {}) {
          if (typeof options !== "object") {
            throw new TypeError("options must be an object");
          }
          const { rows = 1, columns = 1 } = options;
          if (!Number.isInteger(rows) || rows <= 0) {
            throw new TypeError("rows must be a positive integer");
          }
          if (!Number.isInteger(columns) || columns <= 0) {
            throw new TypeError("columns must be a positive integer");
          }
          let matrix2 = new Matrix3(this.rows * rows, this.columns * columns);
          for (let i2 = 0; i2 < rows; i2++) {
            for (let j2 = 0; j2 < columns; j2++) {
              matrix2.setSubMatrix(this, this.rows * i2, this.columns * j2);
            }
          }
          return matrix2;
        }
        fill(value) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, value);
            }
          }
          return this;
        }
        neg() {
          return this.mulS(-1);
        }
        getRow(index) {
          checkRowIndex(this, index);
          let row = [];
          for (let i2 = 0; i2 < this.columns; i2++) {
            row.push(this.get(index, i2));
          }
          return row;
        }
        getRowVector(index) {
          return Matrix3.rowVector(this.getRow(index));
        }
        setRow(index, array) {
          checkRowIndex(this, index);
          array = checkRowVector(this, array);
          for (let i2 = 0; i2 < this.columns; i2++) {
            this.set(index, i2, array[i2]);
          }
          return this;
        }
        swapRows(row1, row2) {
          checkRowIndex(this, row1);
          checkRowIndex(this, row2);
          for (let i2 = 0; i2 < this.columns; i2++) {
            let temp = this.get(row1, i2);
            this.set(row1, i2, this.get(row2, i2));
            this.set(row2, i2, temp);
          }
          return this;
        }
        getColumn(index) {
          checkColumnIndex(this, index);
          let column = [];
          for (let i2 = 0; i2 < this.rows; i2++) {
            column.push(this.get(i2, index));
          }
          return column;
        }
        getColumnVector(index) {
          return Matrix3.columnVector(this.getColumn(index));
        }
        setColumn(index, array) {
          checkColumnIndex(this, index);
          array = checkColumnVector(this, array);
          for (let i2 = 0; i2 < this.rows; i2++) {
            this.set(i2, index, array[i2]);
          }
          return this;
        }
        swapColumns(column1, column2) {
          checkColumnIndex(this, column1);
          checkColumnIndex(this, column2);
          for (let i2 = 0; i2 < this.rows; i2++) {
            let temp = this.get(i2, column1);
            this.set(i2, column1, this.get(i2, column2));
            this.set(i2, column2, temp);
          }
          return this;
        }
        addRowVector(vector) {
          vector = checkRowVector(this, vector);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) + vector[j2]);
            }
          }
          return this;
        }
        subRowVector(vector) {
          vector = checkRowVector(this, vector);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) - vector[j2]);
            }
          }
          return this;
        }
        mulRowVector(vector) {
          vector = checkRowVector(this, vector);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) * vector[j2]);
            }
          }
          return this;
        }
        divRowVector(vector) {
          vector = checkRowVector(this, vector);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) / vector[j2]);
            }
          }
          return this;
        }
        addColumnVector(vector) {
          vector = checkColumnVector(this, vector);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) + vector[i2]);
            }
          }
          return this;
        }
        subColumnVector(vector) {
          vector = checkColumnVector(this, vector);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) - vector[i2]);
            }
          }
          return this;
        }
        mulColumnVector(vector) {
          vector = checkColumnVector(this, vector);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) * vector[i2]);
            }
          }
          return this;
        }
        divColumnVector(vector) {
          vector = checkColumnVector(this, vector);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              this.set(i2, j2, this.get(i2, j2) / vector[i2]);
            }
          }
          return this;
        }
        mulRow(index, value) {
          checkRowIndex(this, index);
          for (let i2 = 0; i2 < this.columns; i2++) {
            this.set(index, i2, this.get(index, i2) * value);
          }
          return this;
        }
        mulColumn(index, value) {
          checkColumnIndex(this, index);
          for (let i2 = 0; i2 < this.rows; i2++) {
            this.set(i2, index, this.get(i2, index) * value);
          }
          return this;
        }
        max(by) {
          if (this.isEmpty()) {
            return NaN;
          }
          switch (by) {
            case "row": {
              const max2 = new Array(this.rows).fill(Number.NEGATIVE_INFINITY);
              for (let row = 0; row < this.rows; row++) {
                for (let column = 0; column < this.columns; column++) {
                  if (this.get(row, column) > max2[row]) {
                    max2[row] = this.get(row, column);
                  }
                }
              }
              return max2;
            }
            case "column": {
              const max2 = new Array(this.columns).fill(Number.NEGATIVE_INFINITY);
              for (let row = 0; row < this.rows; row++) {
                for (let column = 0; column < this.columns; column++) {
                  if (this.get(row, column) > max2[column]) {
                    max2[column] = this.get(row, column);
                  }
                }
              }
              return max2;
            }
            case void 0: {
              let max2 = this.get(0, 0);
              for (let row = 0; row < this.rows; row++) {
                for (let column = 0; column < this.columns; column++) {
                  if (this.get(row, column) > max2) {
                    max2 = this.get(row, column);
                  }
                }
              }
              return max2;
            }
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        maxIndex() {
          checkNonEmpty(this);
          let v2 = this.get(0, 0);
          let idx = [0, 0];
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              if (this.get(i2, j2) > v2) {
                v2 = this.get(i2, j2);
                idx[0] = i2;
                idx[1] = j2;
              }
            }
          }
          return idx;
        }
        min(by) {
          if (this.isEmpty()) {
            return NaN;
          }
          switch (by) {
            case "row": {
              const min2 = new Array(this.rows).fill(Number.POSITIVE_INFINITY);
              for (let row = 0; row < this.rows; row++) {
                for (let column = 0; column < this.columns; column++) {
                  if (this.get(row, column) < min2[row]) {
                    min2[row] = this.get(row, column);
                  }
                }
              }
              return min2;
            }
            case "column": {
              const min2 = new Array(this.columns).fill(Number.POSITIVE_INFINITY);
              for (let row = 0; row < this.rows; row++) {
                for (let column = 0; column < this.columns; column++) {
                  if (this.get(row, column) < min2[column]) {
                    min2[column] = this.get(row, column);
                  }
                }
              }
              return min2;
            }
            case void 0: {
              let min2 = this.get(0, 0);
              for (let row = 0; row < this.rows; row++) {
                for (let column = 0; column < this.columns; column++) {
                  if (this.get(row, column) < min2) {
                    min2 = this.get(row, column);
                  }
                }
              }
              return min2;
            }
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        minIndex() {
          checkNonEmpty(this);
          let v2 = this.get(0, 0);
          let idx = [0, 0];
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              if (this.get(i2, j2) < v2) {
                v2 = this.get(i2, j2);
                idx[0] = i2;
                idx[1] = j2;
              }
            }
          }
          return idx;
        }
        maxRow(row) {
          checkRowIndex(this, row);
          if (this.isEmpty()) {
            return NaN;
          }
          let v2 = this.get(row, 0);
          for (let i2 = 1; i2 < this.columns; i2++) {
            if (this.get(row, i2) > v2) {
              v2 = this.get(row, i2);
            }
          }
          return v2;
        }
        maxRowIndex(row) {
          checkRowIndex(this, row);
          checkNonEmpty(this);
          let v2 = this.get(row, 0);
          let idx = [row, 0];
          for (let i2 = 1; i2 < this.columns; i2++) {
            if (this.get(row, i2) > v2) {
              v2 = this.get(row, i2);
              idx[1] = i2;
            }
          }
          return idx;
        }
        minRow(row) {
          checkRowIndex(this, row);
          if (this.isEmpty()) {
            return NaN;
          }
          let v2 = this.get(row, 0);
          for (let i2 = 1; i2 < this.columns; i2++) {
            if (this.get(row, i2) < v2) {
              v2 = this.get(row, i2);
            }
          }
          return v2;
        }
        minRowIndex(row) {
          checkRowIndex(this, row);
          checkNonEmpty(this);
          let v2 = this.get(row, 0);
          let idx = [row, 0];
          for (let i2 = 1; i2 < this.columns; i2++) {
            if (this.get(row, i2) < v2) {
              v2 = this.get(row, i2);
              idx[1] = i2;
            }
          }
          return idx;
        }
        maxColumn(column) {
          checkColumnIndex(this, column);
          if (this.isEmpty()) {
            return NaN;
          }
          let v2 = this.get(0, column);
          for (let i2 = 1; i2 < this.rows; i2++) {
            if (this.get(i2, column) > v2) {
              v2 = this.get(i2, column);
            }
          }
          return v2;
        }
        maxColumnIndex(column) {
          checkColumnIndex(this, column);
          checkNonEmpty(this);
          let v2 = this.get(0, column);
          let idx = [0, column];
          for (let i2 = 1; i2 < this.rows; i2++) {
            if (this.get(i2, column) > v2) {
              v2 = this.get(i2, column);
              idx[0] = i2;
            }
          }
          return idx;
        }
        minColumn(column) {
          checkColumnIndex(this, column);
          if (this.isEmpty()) {
            return NaN;
          }
          let v2 = this.get(0, column);
          for (let i2 = 1; i2 < this.rows; i2++) {
            if (this.get(i2, column) < v2) {
              v2 = this.get(i2, column);
            }
          }
          return v2;
        }
        minColumnIndex(column) {
          checkColumnIndex(this, column);
          checkNonEmpty(this);
          let v2 = this.get(0, column);
          let idx = [0, column];
          for (let i2 = 1; i2 < this.rows; i2++) {
            if (this.get(i2, column) < v2) {
              v2 = this.get(i2, column);
              idx[0] = i2;
            }
          }
          return idx;
        }
        diag() {
          let min2 = Math.min(this.rows, this.columns);
          let diag = [];
          for (let i2 = 0; i2 < min2; i2++) {
            diag.push(this.get(i2, i2));
          }
          return diag;
        }
        norm(type = "frobenius") {
          switch (type) {
            case "max":
              return Matrix3.abs(this).max();
            case "frobenius":
              return Math.sqrt(this.dot(this));
            default:
              throw new RangeError(`unknown norm type: ${type}`);
          }
        }
        cumulativeSum() {
          let sum = 0;
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              sum += this.get(i2, j2);
              this.set(i2, j2, sum);
            }
          }
          return this;
        }
        dot(vector2) {
          if (_AbstractMatrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
          let vector1 = this.to1DArray();
          if (vector1.length !== vector2.length) {
            throw new RangeError("vectors do not have the same size");
          }
          let dot = 0;
          for (let i2 = 0; i2 < vector1.length; i2++) {
            dot += vector1[i2] * vector2[i2];
          }
          return dot;
        }
        mmul(other) {
          other = Matrix3.checkMatrix(other);
          let m2 = this.rows;
          let n2 = this.columns;
          let p2 = other.columns;
          let result = new Matrix3(m2, p2);
          let Bcolj = new Float64Array(n2);
          for (let j2 = 0; j2 < p2; j2++) {
            for (let k2 = 0; k2 < n2; k2++) {
              Bcolj[k2] = other.get(k2, j2);
            }
            for (let i2 = 0; i2 < m2; i2++) {
              let s2 = 0;
              for (let k2 = 0; k2 < n2; k2++) {
                s2 += this.get(i2, k2) * Bcolj[k2];
              }
              result.set(i2, j2, s2);
            }
          }
          return result;
        }
        gram() {
          const rows = this.rows;
          const n2 = this.columns;
          const gramData = new Float64Array(n2 * n2);
          for (let r2 = 0; r2 < rows; r2++) {
            for (let i2 = 0; i2 < n2; i2++) {
              const value = this.get(r2, i2);
              if (value === 0) continue;
              const offset = i2 * n2;
              for (let j2 = i2; j2 < n2; j2++) {
                gramData[offset + j2] += value * this.get(r2, j2);
              }
            }
          }
          const result = new Matrix3(n2, n2);
          for (let i2 = 0; i2 < n2; i2++) {
            const offset = i2 * n2;
            for (let j2 = i2; j2 < n2; j2++) {
              const value = gramData[offset + j2];
              result.set(i2, j2, value);
              result.set(j2, i2, value);
            }
          }
          return result;
        }
        transposeMultiply(other) {
          other = Matrix3.checkMatrix(other);
          if (this.rows !== other.rows) {
            throw new RangeError(
              "the number of rows of the two matrices must be equal"
            );
          }
          const n2 = this.columns;
          const p2 = other.columns;
          const result = new Matrix3(n2, p2);
          const otherRow = new Float64Array(p2);
          for (let r2 = 0; r2 < this.rows; r2++) {
            for (let j2 = 0; j2 < p2; j2++) {
              otherRow[j2] = other.get(r2, j2);
            }
            for (let i2 = 0; i2 < n2; i2++) {
              const value = this.get(r2, i2);
              if (value === 0) continue;
              const resultRow = result.data[i2];
              for (let j2 = 0; j2 < p2; j2++) {
                resultRow[j2] += value * otherRow[j2];
              }
            }
          }
          return result;
        }
        mmulByTranspose(scale) {
          let m2 = this.rows;
          let n2 = this.columns;
          if (scale !== void 0 && scale.length !== n2) {
            throw new RangeError("scale must have one value per column");
          }
          let result = new Matrix3(m2, m2);
          let rowj = new Float64Array(n2);
          for (let j2 = 0; j2 < m2; j2++) {
            if (scale === void 0) {
              for (let k2 = 0; k2 < n2; k2++) {
                rowj[k2] = this.get(j2, k2);
              }
            } else {
              for (let k2 = 0; k2 < n2; k2++) {
                rowj[k2] = scale[k2] * this.get(j2, k2);
              }
            }
            for (let i2 = j2; i2 < m2; i2++) {
              let s2 = 0;
              for (let k2 = 0; k2 < n2; k2++) {
                s2 += this.get(i2, k2) * rowj[k2];
              }
              result.set(i2, j2, s2);
              result.set(j2, i2, s2);
            }
          }
          return result;
        }
        mpow(scalar) {
          if (!this.isSquare()) {
            throw new RangeError("Matrix must be square");
          }
          if (!Number.isInteger(scalar) || scalar < 0) {
            throw new RangeError("Exponent must be a non-negative integer");
          }
          let result = Matrix3.eye(this.rows);
          let bb = this;
          for (let e2 = scalar; e2 >= 1; e2 /= 2) {
            if ((e2 & 1) !== 0) {
              result = result.mmul(bb);
            }
            bb = bb.mmul(bb);
          }
          return result;
        }
        strassen2x2(other) {
          other = Matrix3.checkMatrix(other);
          let result = new Matrix3(2, 2);
          const a11 = this.get(0, 0);
          const b11 = other.get(0, 0);
          const a12 = this.get(0, 1);
          const b12 = other.get(0, 1);
          const a21 = this.get(1, 0);
          const b21 = other.get(1, 0);
          const a22 = this.get(1, 1);
          const b22 = other.get(1, 1);
          const m1 = (a11 + a22) * (b11 + b22);
          const m2 = (a21 + a22) * b11;
          const m3 = a11 * (b12 - b22);
          const m4 = a22 * (b21 - b11);
          const m5 = (a11 + a12) * b22;
          const m6 = (a21 - a11) * (b11 + b12);
          const m7 = (a12 - a22) * (b21 + b22);
          const c00 = m1 + m4 - m5 + m7;
          const c01 = m3 + m5;
          const c10 = m2 + m4;
          const c11 = m1 - m2 + m3 + m6;
          result.set(0, 0, c00);
          result.set(0, 1, c01);
          result.set(1, 0, c10);
          result.set(1, 1, c11);
          return result;
        }
        strassen3x3(other) {
          other = Matrix3.checkMatrix(other);
          let result = new Matrix3(3, 3);
          const a00 = this.get(0, 0);
          const a01 = this.get(0, 1);
          const a02 = this.get(0, 2);
          const a10 = this.get(1, 0);
          const a11 = this.get(1, 1);
          const a12 = this.get(1, 2);
          const a20 = this.get(2, 0);
          const a21 = this.get(2, 1);
          const a22 = this.get(2, 2);
          const b00 = other.get(0, 0);
          const b01 = other.get(0, 1);
          const b02 = other.get(0, 2);
          const b10 = other.get(1, 0);
          const b11 = other.get(1, 1);
          const b12 = other.get(1, 2);
          const b20 = other.get(2, 0);
          const b21 = other.get(2, 1);
          const b22 = other.get(2, 2);
          const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
          const m2 = (a00 - a10) * (-b01 + b11);
          const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
          const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
          const m5 = (a10 + a11) * (-b00 + b01);
          const m6 = a00 * b00;
          const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
          const m8 = (-a00 + a20) * (b02 - b12);
          const m9 = (a20 + a21) * (-b00 + b02);
          const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
          const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
          const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
          const m13 = (a02 - a22) * (b11 - b21);
          const m14 = a02 * b20;
          const m15 = (a21 + a22) * (-b20 + b21);
          const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
          const m17 = (a02 - a12) * (b12 - b22);
          const m18 = (a11 + a12) * (-b20 + b22);
          const m19 = a01 * b10;
          const m20 = a12 * b21;
          const m21 = a10 * b02;
          const m22 = a20 * b01;
          const m23 = a22 * b22;
          const c00 = m6 + m14 + m19;
          const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
          const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
          const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
          const c11 = m2 + m4 + m5 + m6 + m20;
          const c12 = m14 + m16 + m17 + m18 + m21;
          const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
          const c21 = m12 + m13 + m14 + m15 + m22;
          const c22 = m6 + m7 + m8 + m9 + m23;
          result.set(0, 0, c00);
          result.set(0, 1, c01);
          result.set(0, 2, c02);
          result.set(1, 0, c10);
          result.set(1, 1, c11);
          result.set(1, 2, c12);
          result.set(2, 0, c20);
          result.set(2, 1, c21);
          result.set(2, 2, c22);
          return result;
        }
        mmulStrassen(y2) {
          y2 = Matrix3.checkMatrix(y2);
          let x2 = this.clone();
          let r1 = x2.rows;
          let c1 = x2.columns;
          let r2 = y2.rows;
          let c2 = y2.columns;
          if (c1 !== r2) {
            console.warn(
              `Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`
            );
          }
          function embed(mat, rows, cols) {
            let r4 = mat.rows;
            let c4 = mat.columns;
            if (r4 === rows && c4 === cols) {
              return mat;
            } else {
              let resultat = _AbstractMatrix.zeros(rows, cols);
              resultat = resultat.setSubMatrix(mat, 0, 0);
              return resultat;
            }
          }
          let r3 = Math.max(r1, r2);
          let c3 = Math.max(c1, c2);
          x2 = embed(x2, r3, c3);
          y2 = embed(y2, r3, c3);
          function blockMult(a2, b2, rows, cols) {
            if (rows <= 512 || cols <= 512) {
              return a2.mmul(b2);
            }
            if (rows % 2 === 1 && cols % 2 === 1) {
              a2 = embed(a2, rows + 1, cols + 1);
              b2 = embed(b2, rows + 1, cols + 1);
            } else if (rows % 2 === 1) {
              a2 = embed(a2, rows + 1, cols);
              b2 = embed(b2, rows + 1, cols);
            } else if (cols % 2 === 1) {
              a2 = embed(a2, rows, cols + 1);
              b2 = embed(b2, rows, cols + 1);
            }
            let halfRows = parseInt(a2.rows / 2, 10);
            let halfCols = parseInt(a2.columns / 2, 10);
            let a11 = a2.subMatrix(0, halfRows - 1, 0, halfCols - 1);
            let b11 = b2.subMatrix(0, halfRows - 1, 0, halfCols - 1);
            let a12 = a2.subMatrix(0, halfRows - 1, halfCols, a2.columns - 1);
            let b12 = b2.subMatrix(0, halfRows - 1, halfCols, b2.columns - 1);
            let a21 = a2.subMatrix(halfRows, a2.rows - 1, 0, halfCols - 1);
            let b21 = b2.subMatrix(halfRows, b2.rows - 1, 0, halfCols - 1);
            let a22 = a2.subMatrix(halfRows, a2.rows - 1, halfCols, a2.columns - 1);
            let b22 = b2.subMatrix(halfRows, b2.rows - 1, halfCols, b2.columns - 1);
            let m1 = blockMult(
              _AbstractMatrix.add(a11, a22),
              _AbstractMatrix.add(b11, b22),
              halfRows,
              halfCols
            );
            let m2 = blockMult(_AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
            let m3 = blockMult(a11, _AbstractMatrix.sub(b12, b22), halfRows, halfCols);
            let m4 = blockMult(a22, _AbstractMatrix.sub(b21, b11), halfRows, halfCols);
            let m5 = blockMult(_AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
            let m6 = blockMult(
              _AbstractMatrix.sub(a21, a11),
              _AbstractMatrix.add(b11, b12),
              halfRows,
              halfCols
            );
            let m7 = blockMult(
              _AbstractMatrix.sub(a12, a22),
              _AbstractMatrix.add(b21, b22),
              halfRows,
              halfCols
            );
            let c11 = _AbstractMatrix.add(m1, m4);
            c11.sub(m5);
            c11.add(m7);
            let c12 = _AbstractMatrix.add(m3, m5);
            let c21 = _AbstractMatrix.add(m2, m4);
            let c22 = _AbstractMatrix.sub(m1, m2);
            c22.add(m3);
            c22.add(m6);
            let result = _AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
            result = result.setSubMatrix(c11, 0, 0);
            result = result.setSubMatrix(c12, c11.rows, 0);
            result = result.setSubMatrix(c21, 0, c11.columns);
            result = result.setSubMatrix(c22, c11.rows, c11.columns);
            return result.subMatrix(0, rows - 1, 0, cols - 1);
          }
          return blockMult(x2, y2, r3, c3);
        }
        scaleRows(options = {}) {
          if (typeof options !== "object") {
            throw new TypeError("options must be an object");
          }
          const { min: min2 = 0, max: max2 = 1 } = options;
          if (!Number.isFinite(min2)) throw new TypeError("min must be a number");
          if (!Number.isFinite(max2)) throw new TypeError("max must be a number");
          if (min2 >= max2) throw new RangeError("min must be smaller than max");
          let newMatrix = new Matrix3(this.rows, this.columns);
          for (let i2 = 0; i2 < this.rows; i2++) {
            const row = this.getRow(i2);
            if (row.length > 0) {
              rescale(row, { min: min2, max: max2, output: row });
            }
            newMatrix.setRow(i2, row);
          }
          return newMatrix;
        }
        scaleColumns(options = {}) {
          if (typeof options !== "object") {
            throw new TypeError("options must be an object");
          }
          const { min: min2 = 0, max: max2 = 1 } = options;
          if (!Number.isFinite(min2)) throw new TypeError("min must be a number");
          if (!Number.isFinite(max2)) throw new TypeError("max must be a number");
          if (min2 >= max2) throw new RangeError("min must be smaller than max");
          let newMatrix = new Matrix3(this.rows, this.columns);
          for (let i2 = 0; i2 < this.columns; i2++) {
            const column = this.getColumn(i2);
            if (column.length) {
              rescale(column, {
                min: min2,
                max: max2,
                output: column
              });
            }
            newMatrix.setColumn(i2, column);
          }
          return newMatrix;
        }
        flipRows() {
          const middle = Math.ceil(this.columns / 2);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < middle; j2++) {
              let first = this.get(i2, j2);
              let last = this.get(i2, this.columns - 1 - j2);
              this.set(i2, j2, last);
              this.set(i2, this.columns - 1 - j2, first);
            }
          }
          return this;
        }
        flipColumns() {
          const middle = Math.ceil(this.rows / 2);
          for (let j2 = 0; j2 < this.columns; j2++) {
            for (let i2 = 0; i2 < middle; i2++) {
              let first = this.get(i2, j2);
              let last = this.get(this.rows - 1 - i2, j2);
              this.set(i2, j2, last);
              this.set(this.rows - 1 - i2, j2, first);
            }
          }
          return this;
        }
        kroneckerProduct(other) {
          other = Matrix3.checkMatrix(other);
          let m2 = this.rows;
          let n2 = this.columns;
          let p2 = other.rows;
          let q2 = other.columns;
          let result = new Matrix3(m2 * p2, n2 * q2);
          for (let i2 = 0; i2 < m2; i2++) {
            for (let j2 = 0; j2 < n2; j2++) {
              for (let k2 = 0; k2 < p2; k2++) {
                for (let l2 = 0; l2 < q2; l2++) {
                  result.set(p2 * i2 + k2, q2 * j2 + l2, this.get(i2, j2) * other.get(k2, l2));
                }
              }
            }
          }
          return result;
        }
        kroneckerSum(other) {
          other = Matrix3.checkMatrix(other);
          if (!this.isSquare() || !other.isSquare()) {
            throw new Error("Kronecker Sum needs two Square Matrices");
          }
          let m2 = this.rows;
          let n2 = other.rows;
          let AxI = this.kroneckerProduct(Matrix3.eye(n2, n2));
          let IxB = Matrix3.eye(m2, m2).kroneckerProduct(other);
          return AxI.add(IxB);
        }
        transpose() {
          let result = new Matrix3(this.columns, this.rows);
          for (let i2 = 0; i2 < this.rows; i2++) {
            for (let j2 = 0; j2 < this.columns; j2++) {
              result.set(j2, i2, this.get(i2, j2));
            }
          }
          return result;
        }
        sortRows(compareFunction = compareNumbers) {
          for (let i2 = 0; i2 < this.rows; i2++) {
            this.setRow(i2, this.getRow(i2).sort(compareFunction));
          }
          return this;
        }
        sortColumns(compareFunction = compareNumbers) {
          for (let i2 = 0; i2 < this.columns; i2++) {
            this.setColumn(i2, this.getColumn(i2).sort(compareFunction));
          }
          return this;
        }
        subMatrix(startRow, endRow, startColumn, endColumn) {
          checkRange(this, startRow, endRow, startColumn, endColumn);
          let newMatrix = new Matrix3(
            endRow - startRow + 1,
            endColumn - startColumn + 1
          );
          for (let i2 = startRow; i2 <= endRow; i2++) {
            for (let j2 = startColumn; j2 <= endColumn; j2++) {
              newMatrix.set(i2 - startRow, j2 - startColumn, this.get(i2, j2));
            }
          }
          return newMatrix;
        }
        subMatrixRow(indices, startColumn, endColumn) {
          if (startColumn === void 0) startColumn = 0;
          if (endColumn === void 0) endColumn = this.columns - 1;
          if (startColumn > endColumn || startColumn < 0 || startColumn >= this.columns || endColumn < 0 || endColumn >= this.columns) {
            throw new RangeError("Argument out of range");
          }
          let newMatrix = new Matrix3(indices.length, endColumn - startColumn + 1);
          for (let i2 = 0; i2 < indices.length; i2++) {
            for (let j2 = startColumn; j2 <= endColumn; j2++) {
              if (indices[i2] < 0 || indices[i2] >= this.rows) {
                throw new RangeError(`Row index out of range: ${indices[i2]}`);
              }
              newMatrix.set(i2, j2 - startColumn, this.get(indices[i2], j2));
            }
          }
          return newMatrix;
        }
        subMatrixColumn(indices, startRow, endRow) {
          if (startRow === void 0) startRow = 0;
          if (endRow === void 0) endRow = this.rows - 1;
          if (startRow > endRow || startRow < 0 || startRow >= this.rows || endRow < 0 || endRow >= this.rows) {
            throw new RangeError("Argument out of range");
          }
          let newMatrix = new Matrix3(endRow - startRow + 1, indices.length);
          for (let i2 = 0; i2 < indices.length; i2++) {
            for (let j2 = startRow; j2 <= endRow; j2++) {
              if (indices[i2] < 0 || indices[i2] >= this.columns) {
                throw new RangeError(`Column index out of range: ${indices[i2]}`);
              }
              newMatrix.set(j2 - startRow, i2, this.get(j2, indices[i2]));
            }
          }
          return newMatrix;
        }
        setSubMatrix(matrix2, startRow, startColumn) {
          matrix2 = Matrix3.checkMatrix(matrix2);
          if (matrix2.isEmpty()) {
            return this;
          }
          let endRow = startRow + matrix2.rows - 1;
          let endColumn = startColumn + matrix2.columns - 1;
          checkRange(this, startRow, endRow, startColumn, endColumn);
          for (let i2 = 0; i2 < matrix2.rows; i2++) {
            for (let j2 = 0; j2 < matrix2.columns; j2++) {
              this.set(startRow + i2, startColumn + j2, matrix2.get(i2, j2));
            }
          }
          return this;
        }
        concat(other, by = "row") {
          other = Matrix3.checkMatrix(other);
          switch (by) {
            case "row": {
              if (this.columns !== other.columns) {
                throw new RangeError(
                  "both matrices must have the same number of columns"
                );
              }
              const result = new Matrix3(this.rows + other.rows, this.columns);
              result.setSubMatrix(this, 0, 0);
              result.setSubMatrix(other, this.rows, 0);
              return result;
            }
            case "column": {
              if (this.rows !== other.rows) {
                throw new RangeError(
                  "both matrices must have the same number of rows"
                );
              }
              const result = new Matrix3(this.rows, this.columns + other.columns);
              result.setSubMatrix(this, 0, 0);
              result.setSubMatrix(other, 0, this.columns);
              return result;
            }
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        selection(rowIndices, columnIndices) {
          checkRowIndices(this, rowIndices);
          checkColumnIndices(this, columnIndices);
          let newMatrix = new Matrix3(rowIndices.length, columnIndices.length);
          for (let i2 = 0; i2 < rowIndices.length; i2++) {
            let rowIndex = rowIndices[i2];
            for (let j2 = 0; j2 < columnIndices.length; j2++) {
              let columnIndex = columnIndices[j2];
              newMatrix.set(i2, j2, this.get(rowIndex, columnIndex));
            }
          }
          return newMatrix;
        }
        trace() {
          let min2 = Math.min(this.rows, this.columns);
          let trace = 0;
          for (let i2 = 0; i2 < min2; i2++) {
            trace += this.get(i2, i2);
          }
          return trace;
        }
        clone() {
          return this.constructor.copy(this, new Matrix3(this.rows, this.columns));
        }
        /**
         * @template {AbstractMatrix} M
         * @param {AbstractMatrix} from
         * @param {M} to
         * @return {M}
         */
        static copy(from, to2) {
          for (const [row, column, value] of from.entries()) {
            to2.set(row, column, value);
          }
          return to2;
        }
        sum(by) {
          switch (by) {
            case "row":
              return sumByRow(this);
            case "column":
              return sumByColumn(this);
            case void 0:
              return sumAll(this);
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        product(by) {
          switch (by) {
            case "row":
              return productByRow(this);
            case "column":
              return productByColumn(this);
            case void 0:
              return productAll(this);
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        mean(by) {
          const sum = this.sum(by);
          switch (by) {
            case "row": {
              for (let i2 = 0; i2 < this.rows; i2++) {
                sum[i2] /= this.columns;
              }
              return sum;
            }
            case "column": {
              for (let i2 = 0; i2 < this.columns; i2++) {
                sum[i2] /= this.rows;
              }
              return sum;
            }
            case void 0:
              return sum / this.size;
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        variance(by, options = {}) {
          if (typeof by === "object") {
            options = by;
            by = void 0;
          }
          if (typeof options !== "object") {
            throw new TypeError("options must be an object");
          }
          const { unbiased = true, mean = this.mean(by) } = options;
          if (typeof unbiased !== "boolean") {
            throw new TypeError("unbiased must be a boolean");
          }
          switch (by) {
            case "row": {
              if (!isAnyArray(mean)) {
                throw new TypeError("mean must be an array");
              }
              return varianceByRow(this, unbiased, mean);
            }
            case "column": {
              if (!isAnyArray(mean)) {
                throw new TypeError("mean must be an array");
              }
              return varianceByColumn(this, unbiased, mean);
            }
            case void 0: {
              if (typeof mean !== "number") {
                throw new TypeError("mean must be a number");
              }
              return varianceAll(this, unbiased, mean);
            }
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        standardDeviation(by, options) {
          if (typeof by === "object") {
            options = by;
            by = void 0;
          }
          const variance = this.variance(by, options);
          if (by === void 0) {
            return Math.sqrt(variance);
          } else {
            for (let i2 = 0; i2 < variance.length; i2++) {
              variance[i2] = Math.sqrt(variance[i2]);
            }
            return variance;
          }
        }
        center(by, options = {}) {
          if (typeof by === "object") {
            options = by;
            by = void 0;
          }
          if (typeof options !== "object") {
            throw new TypeError("options must be an object");
          }
          const { center = this.mean(by) } = options;
          switch (by) {
            case "row": {
              if (!isAnyArray(center)) {
                throw new TypeError("center must be an array");
              }
              centerByRow(this, center);
              return this;
            }
            case "column": {
              if (!isAnyArray(center)) {
                throw new TypeError("center must be an array");
              }
              centerByColumn(this, center);
              return this;
            }
            case void 0: {
              if (typeof center !== "number") {
                throw new TypeError("center must be a number");
              }
              centerAll(this, center);
              return this;
            }
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        scale(by, options = {}) {
          if (typeof by === "object") {
            options = by;
            by = void 0;
          }
          if (typeof options !== "object") {
            throw new TypeError("options must be an object");
          }
          let scale = options.scale;
          switch (by) {
            case "row": {
              if (scale === void 0) {
                scale = getScaleByRow(this);
              } else if (!isAnyArray(scale)) {
                throw new TypeError("scale must be an array");
              }
              scaleByRow(this, scale);
              return this;
            }
            case "column": {
              if (scale === void 0) {
                scale = getScaleByColumn(this);
              } else if (!isAnyArray(scale)) {
                throw new TypeError("scale must be an array");
              }
              scaleByColumn(this, scale);
              return this;
            }
            case void 0: {
              if (scale === void 0) {
                scale = getScaleAll(this);
              } else if (typeof scale !== "number") {
                throw new TypeError("scale must be a number");
              }
              scaleAll(this, scale);
              return this;
            }
            default:
              throw new Error(`invalid option: ${by}`);
          }
        }
        toString(options) {
          return inspectMatrixWithOptions(this, options);
        }
        [Symbol.iterator]() {
          return this.entries();
        }
        /**
         * iterator from left to right, from top to bottom
         * yield [row, column, value]
         * @returns {Generator<[number, number, number], void, void>}
         */
        *entries() {
          for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
              yield [row, col, this.get(row, col)];
            }
          }
        }
        /**
         * iterator from left to right, from top to bottom
         * yield value
         * @returns {Generator<number, void, void>}
         */
        *values() {
          for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
              yield this.get(row, col);
            }
          }
        }
      };
      AbstractMatrix2.prototype.klass = "Matrix";
      if (typeof Symbol !== "undefined") {
        AbstractMatrix2.prototype[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = inspectMatrix;
      }
      function compareNumbers(a2, b2) {
        return a2 - b2;
      }
      function isArrayOfNumbers(array) {
        return array.every((element) => {
          return typeof element === "number";
        });
      }
      AbstractMatrix2.random = AbstractMatrix2.rand;
      AbstractMatrix2.randomInt = AbstractMatrix2.randInt;
      AbstractMatrix2.diagonal = AbstractMatrix2.diag;
      AbstractMatrix2.prototype.diagonal = AbstractMatrix2.prototype.diag;
      AbstractMatrix2.identity = AbstractMatrix2.eye;
      AbstractMatrix2.prototype.negate = AbstractMatrix2.prototype.neg;
      AbstractMatrix2.prototype.tensorProduct = AbstractMatrix2.prototype.kroneckerProduct;
      var Matrix3 = class _Matrix extends AbstractMatrix2 {
        /**
         * @type {Float64Array[]}
         */
        data;
        /**
         * Init an empty matrix
         * @param {number} nRows
         * @param {number} nColumns
         */
        #initData(nRows, nColumns) {
          this.data = [];
          if (Number.isInteger(nColumns) && nColumns >= 0) {
            for (let i2 = 0; i2 < nRows; i2++) {
              this.data.push(new Float64Array(nColumns));
            }
          } else {
            throw new TypeError("nColumns must be a positive integer");
          }
          this.rows = nRows;
          this.columns = nColumns;
        }
        constructor(nRows, nColumns) {
          super();
          if (_Matrix.isMatrix(nRows)) {
            this.#initData(nRows.rows, nRows.columns);
            _Matrix.copy(nRows, this);
          } else if (Number.isInteger(nRows) && nRows >= 0) {
            this.#initData(nRows, nColumns);
          } else if (isAnyArray(nRows)) {
            const arrayData = nRows;
            nRows = arrayData.length;
            nColumns = nRows ? arrayData[0].length : 0;
            if (typeof nColumns !== "number") {
              throw new TypeError(
                "Data must be a 2D array with at least one element"
              );
            }
            this.data = [];
            for (let i2 = 0; i2 < nRows; i2++) {
              if (arrayData[i2].length !== nColumns) {
                throw new RangeError("Inconsistent array dimensions");
              }
              if (!isArrayOfNumbers(arrayData[i2])) {
                throw new TypeError("Input data contains non-numeric values");
              }
              this.data.push(Float64Array.from(arrayData[i2]));
            }
            this.rows = nRows;
            this.columns = nColumns;
          } else {
            throw new TypeError(
              "First argument must be a positive number or an array"
            );
          }
        }
        set(rowIndex, columnIndex, value) {
          this.data[rowIndex][columnIndex] = value;
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.data[rowIndex][columnIndex];
        }
        removeRow(index) {
          checkRowIndex(this, index);
          this.data.splice(index, 1);
          this.rows -= 1;
          return this;
        }
        addRow(index, array) {
          if (array === void 0) {
            array = index;
            index = this.rows;
          }
          checkRowIndex(this, index, true);
          array = Float64Array.from(checkRowVector(this, array));
          this.data.splice(index, 0, array);
          this.rows += 1;
          return this;
        }
        removeColumn(index) {
          checkColumnIndex(this, index);
          for (let i2 = 0; i2 < this.rows; i2++) {
            const newRow = new Float64Array(this.columns - 1);
            for (let j2 = 0; j2 < index; j2++) {
              newRow[j2] = this.data[i2][j2];
            }
            for (let j2 = index + 1; j2 < this.columns; j2++) {
              newRow[j2 - 1] = this.data[i2][j2];
            }
            this.data[i2] = newRow;
          }
          this.columns -= 1;
          return this;
        }
        addColumn(index, array) {
          if (typeof array === "undefined") {
            array = index;
            index = this.columns;
          }
          checkColumnIndex(this, index, true);
          array = checkColumnVector(this, array);
          for (let i2 = 0; i2 < this.rows; i2++) {
            const newRow = new Float64Array(this.columns + 1);
            let j2 = 0;
            for (; j2 < index; j2++) {
              newRow[j2] = this.data[i2][j2];
            }
            newRow[j2++] = array[i2];
            for (; j2 < this.columns + 1; j2++) {
              newRow[j2] = this.data[i2][j2 - 1];
            }
            this.data[i2] = newRow;
          }
          this.columns += 1;
          return this;
        }
      };
      installMathOperations(AbstractMatrix2, Matrix3);
      var SymmetricMatrix2 = class _SymmetricMatrix extends AbstractMatrix2 {
        /** @type {Matrix} */
        #matrix;
        get size() {
          return this.#matrix.size;
        }
        get rows() {
          return this.#matrix.rows;
        }
        get columns() {
          return this.#matrix.columns;
        }
        get diagonalSize() {
          return this.rows;
        }
        /**
         * not the same as matrix.isSymmetric()
         * Here is to check if it's instanceof SymmetricMatrix without bundling issues
         *
         * @param value
         * @returns {boolean}
         */
        static isSymmetricMatrix(value) {
          return Matrix3.isMatrix(value) && value.klassType === "SymmetricMatrix";
        }
        /**
         * @param diagonalSize
         * @return {SymmetricMatrix}
         */
        static zeros(diagonalSize) {
          return new this(diagonalSize);
        }
        /**
         * @param diagonalSize
         * @return {SymmetricMatrix}
         */
        static ones(diagonalSize) {
          return new this(diagonalSize).fill(1);
        }
        /**
         * @param {number | AbstractMatrix | ArrayLike<ArrayLike<number>>} diagonalSize
         * @return {this}
         */
        constructor(diagonalSize) {
          super();
          if (Matrix3.isMatrix(diagonalSize)) {
            if (!diagonalSize.isSymmetric()) {
              throw new TypeError("not symmetric data");
            }
            this.#matrix = Matrix3.copy(
              diagonalSize,
              new Matrix3(diagonalSize.rows, diagonalSize.rows)
            );
          } else if (Number.isInteger(diagonalSize) && diagonalSize >= 0) {
            this.#matrix = new Matrix3(diagonalSize, diagonalSize);
          } else {
            this.#matrix = new Matrix3(diagonalSize);
            if (!this.isSymmetric()) {
              throw new TypeError("not symmetric data");
            }
          }
        }
        clone() {
          const matrix2 = new _SymmetricMatrix(this.diagonalSize);
          for (const [row, col, value] of this.upperRightEntries()) {
            matrix2.set(row, col, value);
          }
          return matrix2;
        }
        toMatrix() {
          return new Matrix3(this);
        }
        get(rowIndex, columnIndex) {
          return this.#matrix.get(rowIndex, columnIndex);
        }
        set(rowIndex, columnIndex, value) {
          this.#matrix.set(rowIndex, columnIndex, value);
          this.#matrix.set(columnIndex, rowIndex, value);
          return this;
        }
        removeCross(index) {
          this.#matrix.removeRow(index);
          this.#matrix.removeColumn(index);
          return this;
        }
        addCross(index, array) {
          if (array === void 0) {
            array = index;
            index = this.diagonalSize;
          }
          const row = array.slice();
          row.splice(index, 1);
          this.#matrix.addRow(index, row);
          this.#matrix.addColumn(index, array);
          return this;
        }
        /**
         * @param {Mask[]} mask
         */
        applyMask(mask) {
          if (mask.length !== this.diagonalSize) {
            throw new RangeError("Mask size do not match with matrix size");
          }
          const sidesToRemove = [];
          for (const [index, passthroughs] of mask.entries()) {
            if (passthroughs) continue;
            sidesToRemove.push(index);
          }
          sidesToRemove.reverse();
          for (const sideIndex of sidesToRemove) {
            this.removeCross(sideIndex);
          }
          return this;
        }
        /**
         * Compact format upper-right corner of matrix
         * iterate from left to right, from top to bottom.
         *
         * ```
         *   A B C D
         * A 1 2 3 4
         * B 2 5 6 7
         * C 3 6 8 9
         * D 4 7 9 10
         * ```
         *
         * will return compact 1D array `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
         *
         * length is S(i=0, n=sideSize) => 10 for a 4 sideSized matrix
         *
         * @returns {number[]}
         */
        toCompact() {
          const { diagonalSize } = this;
          const compact = new Array(diagonalSize * (diagonalSize + 1) / 2);
          for (let col = 0, row = 0, index = 0; index < compact.length; index++) {
            compact[index] = this.get(row, col);
            if (++col >= diagonalSize) col = ++row;
          }
          return compact;
        }
        /**
         * @param {number[]} compact
         * @return {SymmetricMatrix}
         */
        static fromCompact(compact) {
          const compactSize = compact.length;
          const diagonalSize = (Math.sqrt(8 * compactSize + 1) - 1) / 2;
          if (!Number.isInteger(diagonalSize)) {
            throw new TypeError(
              `This array is not a compact representation of a Symmetric Matrix, ${JSON.stringify(
                compact
              )}`
            );
          }
          const matrix2 = new _SymmetricMatrix(diagonalSize);
          for (let col = 0, row = 0, index = 0; index < compactSize; index++) {
            matrix2.set(col, row, compact[index]);
            if (++col >= diagonalSize) col = ++row;
          }
          return matrix2;
        }
        /**
         * half iterator upper-right-corner from left to right, from top to bottom
         * yield [row, column, value]
         *
         * @returns {Generator<[number, number, number], void, void>}
         */
        *upperRightEntries() {
          for (let row = 0, col = 0; row < this.diagonalSize; void 0) {
            const value = this.get(row, col);
            yield [row, col, value];
            if (++col >= this.diagonalSize) col = ++row;
          }
        }
        /**
         * half iterator upper-right-corner from left to right, from top to bottom
         * yield value
         *
         * @returns {Generator<[number, number, number], void, void>}
         */
        *upperRightValues() {
          for (let row = 0, col = 0; row < this.diagonalSize; void 0) {
            const value = this.get(row, col);
            yield value;
            if (++col >= this.diagonalSize) col = ++row;
          }
        }
      };
      SymmetricMatrix2.prototype.klassType = "SymmetricMatrix";
      var DistanceMatrix2 = class _DistanceMatrix extends SymmetricMatrix2 {
        /**
         * not the same as matrix.isSymmetric()
         * Here is to check if it's instanceof SymmetricMatrix without bundling issues
         *
         * @param value
         * @returns {boolean}
         */
        static isDistanceMatrix(value) {
          return SymmetricMatrix2.isSymmetricMatrix(value) && value.klassSubType === "DistanceMatrix";
        }
        constructor(sideSize) {
          super(sideSize);
          if (!this.isDistance()) {
            throw new TypeError("Provided arguments do no produce a distance matrix");
          }
        }
        set(rowIndex, columnIndex, value) {
          if (rowIndex === columnIndex) value = 0;
          return super.set(rowIndex, columnIndex, value);
        }
        addCross(index, array) {
          if (array === void 0) {
            array = index;
            index = this.diagonalSize;
          }
          array = array.slice();
          array[index] = 0;
          return super.addCross(index, array);
        }
        toSymmetricMatrix() {
          return new SymmetricMatrix2(this);
        }
        clone() {
          const matrix2 = new _DistanceMatrix(this.diagonalSize);
          for (const [row, col, value] of this.upperRightEntries()) {
            if (row === col) continue;
            matrix2.set(row, col, value);
          }
          return matrix2;
        }
        /**
         * Compact format upper-right corner of matrix
         * no diagonal (only zeros)
         * iterable from left to right, from top to bottom.
         *
         * ```
         *   A B C D
         * A 0 1 2 3
         * B 1 0 4 5
         * C 2 4 0 6
         * D 3 5 6 0
         * ```
         *
         * will return compact 1D array `[1, 2, 3, 4, 5, 6]`
         *
         * length is S(i=0, n=sideSize-1) => 6 for a 4 side sized matrix
         *
         * @returns {number[]}
         */
        toCompact() {
          const { diagonalSize } = this;
          const compactLength = (diagonalSize - 1) * diagonalSize / 2;
          const compact = new Array(compactLength);
          for (let col = 1, row = 0, index = 0; index < compact.length; index++) {
            compact[index] = this.get(row, col);
            if (++col >= diagonalSize) col = ++row + 1;
          }
          return compact;
        }
        /**
         * @param {number[]} compact
         */
        static fromCompact(compact) {
          const compactSize = compact.length;
          if (compactSize === 0) {
            return new this(0);
          }
          const diagonalSize = (Math.sqrt(8 * compactSize + 1) + 1) / 2;
          if (!Number.isInteger(diagonalSize)) {
            throw new TypeError(
              `This array is not a compact representation of a DistanceMatrix, ${JSON.stringify(
                compact
              )}`
            );
          }
          const matrix2 = new this(diagonalSize);
          for (let col = 1, row = 0, index = 0; index < compactSize; index++) {
            matrix2.set(col, row, compact[index]);
            if (++col >= diagonalSize) col = ++row + 1;
          }
          return matrix2;
        }
      };
      DistanceMatrix2.prototype.klassSubType = "DistanceMatrix";
      var BaseView = class extends AbstractMatrix2 {
        constructor(matrix2, rows, columns) {
          super();
          this.matrix = matrix2;
          this.rows = rows;
          this.columns = columns;
        }
      };
      var MatrixColumnView2 = class extends BaseView {
        constructor(matrix2, column) {
          checkColumnIndex(matrix2, column);
          super(matrix2, matrix2.rows, 1);
          this.column = column;
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(rowIndex, this.column, value);
          return this;
        }
        get(rowIndex) {
          return this.matrix.get(rowIndex, this.column);
        }
      };
      var MatrixColumnSelectionView2 = class extends BaseView {
        constructor(matrix2, columnIndices) {
          checkColumnIndices(matrix2, columnIndices);
          super(matrix2, matrix2.rows, columnIndices.length);
          this.columnIndices = columnIndices;
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
        }
      };
      var MatrixFlipColumnView2 = class extends BaseView {
        constructor(matrix2) {
          super(matrix2, matrix2.rows, matrix2.columns);
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
        }
      };
      var MatrixFlipRowView2 = class extends BaseView {
        constructor(matrix2) {
          super(matrix2, matrix2.rows, matrix2.columns);
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
        }
      };
      var MatrixRowView2 = class extends BaseView {
        constructor(matrix2, row) {
          checkRowIndex(matrix2, row);
          super(matrix2, 1, matrix2.columns);
          this.row = row;
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(this.row, columnIndex, value);
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.matrix.get(this.row, columnIndex);
        }
      };
      var MatrixRowSelectionView2 = class extends BaseView {
        constructor(matrix2, rowIndices) {
          checkRowIndices(matrix2, rowIndices);
          super(matrix2, rowIndices.length, matrix2.columns);
          this.rowIndices = rowIndices;
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
        }
      };
      var MatrixSelectionView2 = class extends BaseView {
        constructor(matrix2, rowIndices, columnIndices) {
          checkRowIndices(matrix2, rowIndices);
          checkColumnIndices(matrix2, columnIndices);
          super(matrix2, rowIndices.length, columnIndices.length);
          this.rowIndices = rowIndices;
          this.columnIndices = columnIndices;
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(
            this.rowIndices[rowIndex],
            this.columnIndices[columnIndex],
            value
          );
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.matrix.get(
            this.rowIndices[rowIndex],
            this.columnIndices[columnIndex]
          );
        }
      };
      var MatrixSubView2 = class extends BaseView {
        constructor(matrix2, startRow, endRow, startColumn, endColumn) {
          checkRange(matrix2, startRow, endRow, startColumn, endColumn);
          super(matrix2, endRow - startRow + 1, endColumn - startColumn + 1);
          this.startRow = startRow;
          this.startColumn = startColumn;
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(
            this.startRow + rowIndex,
            this.startColumn + columnIndex,
            value
          );
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.matrix.get(
            this.startRow + rowIndex,
            this.startColumn + columnIndex
          );
        }
      };
      var MatrixTransposeView2 = class extends BaseView {
        constructor(matrix2) {
          super(matrix2, matrix2.columns, matrix2.rows);
        }
        set(rowIndex, columnIndex, value) {
          this.matrix.set(columnIndex, rowIndex, value);
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.matrix.get(columnIndex, rowIndex);
        }
      };
      var WrapperMatrix1D2 = class extends AbstractMatrix2 {
        constructor(data, options = {}) {
          const { rows = 1 } = options;
          if (data.length % rows !== 0) {
            throw new Error("the data length is not divisible by the number of rows");
          }
          super();
          this.rows = rows;
          this.columns = data.length / rows;
          this.data = data;
        }
        set(rowIndex, columnIndex, value) {
          let index = this._calculateIndex(rowIndex, columnIndex);
          this.data[index] = value;
          return this;
        }
        get(rowIndex, columnIndex) {
          let index = this._calculateIndex(rowIndex, columnIndex);
          return this.data[index];
        }
        _calculateIndex(row, column) {
          return row * this.columns + column;
        }
      };
      var WrapperMatrix2D2 = class extends AbstractMatrix2 {
        constructor(data) {
          super();
          this.data = data;
          this.rows = data.length;
          this.columns = data[0].length;
        }
        set(rowIndex, columnIndex, value) {
          this.data[rowIndex][columnIndex] = value;
          return this;
        }
        get(rowIndex, columnIndex) {
          return this.data[rowIndex][columnIndex];
        }
      };
      function wrap2(array, options) {
        if (isAnyArray(array)) {
          if (array[0] && isAnyArray(array[0])) {
            return new WrapperMatrix2D2(array);
          } else {
            return new WrapperMatrix1D2(array, options);
          }
        } else {
          throw new Error("the argument is not an array");
        }
      }
      var LuDecomposition2 = class {
        constructor(matrix2) {
          matrix2 = WrapperMatrix2D2.checkMatrix(matrix2);
          let lu = matrix2.clone();
          let rows = lu.rows;
          let columns = lu.columns;
          let pivotVector = new Float64Array(rows);
          let pivotSign = 1;
          let i2, j2, k2, p2, s2, t2, v2;
          let LUcolj, kmax;
          for (i2 = 0; i2 < rows; i2++) {
            pivotVector[i2] = i2;
          }
          LUcolj = new Float64Array(rows);
          for (j2 = 0; j2 < columns; j2++) {
            for (i2 = 0; i2 < rows; i2++) {
              LUcolj[i2] = lu.get(i2, j2);
            }
            for (i2 = 0; i2 < rows; i2++) {
              kmax = Math.min(i2, j2);
              s2 = 0;
              for (k2 = 0; k2 < kmax; k2++) {
                s2 += lu.get(i2, k2) * LUcolj[k2];
              }
              LUcolj[i2] -= s2;
              lu.set(i2, j2, LUcolj[i2]);
            }
            p2 = j2;
            for (i2 = j2 + 1; i2 < rows; i2++) {
              if (Math.abs(LUcolj[i2]) > Math.abs(LUcolj[p2])) {
                p2 = i2;
              }
            }
            if (p2 !== j2) {
              for (k2 = 0; k2 < columns; k2++) {
                t2 = lu.get(p2, k2);
                lu.set(p2, k2, lu.get(j2, k2));
                lu.set(j2, k2, t2);
              }
              v2 = pivotVector[p2];
              pivotVector[p2] = pivotVector[j2];
              pivotVector[j2] = v2;
              pivotSign = -pivotSign;
            }
            if (j2 < rows && lu.get(j2, j2) !== 0) {
              for (i2 = j2 + 1; i2 < rows; i2++) {
                lu.set(i2, j2, lu.get(i2, j2) / lu.get(j2, j2));
              }
            }
          }
          this.LU = lu;
          this.pivotVector = pivotVector;
          this.pivotSign = pivotSign;
        }
        isSingular() {
          let data = this.LU;
          let col = data.columns;
          for (let j2 = 0; j2 < col; j2++) {
            if (data.get(j2, j2) === 0) {
              return true;
            }
          }
          return false;
        }
        solve(value) {
          value = Matrix3.checkMatrix(value);
          let lu = this.LU;
          let rows = lu.rows;
          if (rows !== value.rows) {
            throw new Error("Invalid matrix dimensions");
          }
          if (this.isSingular()) {
            throw new Error("LU matrix is singular");
          }
          let count = value.columns;
          let X2 = value.subMatrixRow(this.pivotVector, 0, count - 1);
          let columns = lu.columns;
          let i2, j2, k2;
          for (k2 = 0; k2 < columns; k2++) {
            for (i2 = k2 + 1; i2 < columns; i2++) {
              for (j2 = 0; j2 < count; j2++) {
                X2.set(i2, j2, X2.get(i2, j2) - X2.get(k2, j2) * lu.get(i2, k2));
              }
            }
          }
          for (k2 = columns - 1; k2 >= 0; k2--) {
            for (j2 = 0; j2 < count; j2++) {
              X2.set(k2, j2, X2.get(k2, j2) / lu.get(k2, k2));
            }
            for (i2 = 0; i2 < k2; i2++) {
              for (j2 = 0; j2 < count; j2++) {
                X2.set(i2, j2, X2.get(i2, j2) - X2.get(k2, j2) * lu.get(i2, k2));
              }
            }
          }
          return X2;
        }
        get determinant() {
          let data = this.LU;
          if (!data.isSquare()) {
            throw new Error("Matrix must be square");
          }
          let determinant3 = this.pivotSign;
          let col = data.columns;
          for (let j2 = 0; j2 < col; j2++) {
            determinant3 *= data.get(j2, j2);
          }
          return determinant3;
        }
        get lowerTriangularMatrix() {
          let data = this.LU;
          let rows = data.rows;
          let columns = data.columns;
          let X2 = new Matrix3(rows, columns);
          for (let i2 = 0; i2 < rows; i2++) {
            for (let j2 = 0; j2 < columns; j2++) {
              if (i2 > j2) {
                X2.set(i2, j2, data.get(i2, j2));
              } else if (i2 === j2) {
                X2.set(i2, j2, 1);
              } else {
                X2.set(i2, j2, 0);
              }
            }
          }
          return X2;
        }
        get upperTriangularMatrix() {
          let data = this.LU;
          let rows = data.rows;
          let columns = data.columns;
          let X2 = new Matrix3(rows, columns);
          for (let i2 = 0; i2 < rows; i2++) {
            for (let j2 = 0; j2 < columns; j2++) {
              if (i2 <= j2) {
                X2.set(i2, j2, data.get(i2, j2));
              } else {
                X2.set(i2, j2, 0);
              }
            }
          }
          return X2;
        }
        get pivotPermutationVector() {
          return Array.from(this.pivotVector);
        }
      };
      function transposeSquareInPlace(matrix2) {
        const data = matrix2.data;
        const n2 = matrix2.rows;
        for (let i2 = 0; i2 < n2; i2++) {
          const rowI = data[i2];
          for (let j2 = i2 + 1; j2 < n2; j2++) {
            const tmp = rowI[j2];
            rowI[j2] = data[j2][i2];
            data[j2][i2] = tmp;
          }
        }
        return matrix2;
      }
      function hypotenuse(a2, b2) {
        let r2 = 0;
        if (Math.abs(a2) > Math.abs(b2)) {
          r2 = b2 / a2;
          return Math.abs(a2) * Math.sqrt(1 + r2 * r2);
        }
        if (b2 !== 0) {
          r2 = a2 / b2;
          return Math.abs(b2) * Math.sqrt(1 + r2 * r2);
        }
        return 0;
      }
      var QrDecomposition2 = class {
        constructor(value) {
          value = WrapperMatrix2D2.checkMatrix(value);
          let qr2 = value.clone();
          let m2 = value.rows;
          let n2 = value.columns;
          let rdiag = new Float64Array(n2);
          let i2, j2, k2, s2;
          for (k2 = 0; k2 < n2; k2++) {
            let nrm = 0;
            for (i2 = k2; i2 < m2; i2++) {
              nrm = hypotenuse(nrm, qr2.get(i2, k2));
            }
            if (nrm !== 0) {
              if (qr2.get(k2, k2) < 0) {
                nrm = -nrm;
              }
              for (i2 = k2; i2 < m2; i2++) {
                qr2.set(i2, k2, qr2.get(i2, k2) / nrm);
              }
              qr2.set(k2, k2, qr2.get(k2, k2) + 1);
              for (j2 = k2 + 1; j2 < n2; j2++) {
                s2 = 0;
                for (i2 = k2; i2 < m2; i2++) {
                  s2 += qr2.get(i2, k2) * qr2.get(i2, j2);
                }
                s2 = -s2 / qr2.get(k2, k2);
                for (i2 = k2; i2 < m2; i2++) {
                  qr2.set(i2, j2, qr2.get(i2, j2) + s2 * qr2.get(i2, k2));
                }
              }
            }
            rdiag[k2] = -nrm;
          }
          this.QR = qr2;
          this.Rdiag = rdiag;
        }
        solve(value) {
          value = Matrix3.checkMatrix(value);
          let qr2 = this.QR;
          let m2 = qr2.rows;
          if (value.rows !== m2) {
            throw new Error("Matrix row dimensions must agree");
          }
          if (!this.isFullRank()) {
            throw new Error("Matrix is rank deficient");
          }
          let count = value.columns;
          let X2 = value.clone();
          let n2 = qr2.columns;
          let i2, j2, k2, s2;
          for (k2 = 0; k2 < n2; k2++) {
            for (j2 = 0; j2 < count; j2++) {
              s2 = 0;
              for (i2 = k2; i2 < m2; i2++) {
                s2 += qr2.get(i2, k2) * X2.get(i2, j2);
              }
              s2 = -s2 / qr2.get(k2, k2);
              for (i2 = k2; i2 < m2; i2++) {
                X2.set(i2, j2, X2.get(i2, j2) + s2 * qr2.get(i2, k2));
              }
            }
          }
          for (k2 = n2 - 1; k2 >= 0; k2--) {
            for (j2 = 0; j2 < count; j2++) {
              X2.set(k2, j2, X2.get(k2, j2) / this.Rdiag[k2]);
            }
            for (i2 = 0; i2 < k2; i2++) {
              for (j2 = 0; j2 < count; j2++) {
                X2.set(i2, j2, X2.get(i2, j2) - X2.get(k2, j2) * qr2.get(i2, k2));
              }
            }
          }
          return X2.subMatrix(0, n2 - 1, 0, count - 1);
        }
        isFullRank() {
          let columns = this.QR.columns;
          for (let i2 = 0; i2 < columns; i2++) {
            if (this.Rdiag[i2] === 0) {
              return false;
            }
          }
          return true;
        }
        get upperTriangularMatrix() {
          let qr2 = this.QR;
          let n2 = qr2.columns;
          let X2 = new Matrix3(n2, n2);
          let i2, j2;
          for (i2 = 0; i2 < n2; i2++) {
            for (j2 = 0; j2 < n2; j2++) {
              if (i2 < j2) {
                X2.set(i2, j2, qr2.get(i2, j2));
              } else if (i2 === j2) {
                X2.set(i2, j2, this.Rdiag[i2]);
              } else {
                X2.set(i2, j2, 0);
              }
            }
          }
          return X2;
        }
        get orthogonalMatrix() {
          let qr2 = this.QR;
          let rows = qr2.rows;
          let columns = qr2.columns;
          let X2 = new Matrix3(rows, columns);
          let i2, j2, k2, s2;
          for (k2 = columns - 1; k2 >= 0; k2--) {
            for (i2 = 0; i2 < rows; i2++) {
              X2.set(i2, k2, 0);
            }
            X2.set(k2, k2, 1);
            for (j2 = k2; j2 < columns; j2++) {
              if (qr2.get(k2, k2) !== 0) {
                s2 = 0;
                for (i2 = k2; i2 < rows; i2++) {
                  s2 += qr2.get(i2, k2) * X2.get(i2, j2);
                }
                s2 = -s2 / qr2.get(k2, k2);
                for (i2 = k2; i2 < rows; i2++) {
                  X2.set(i2, j2, X2.get(i2, j2) + s2 * qr2.get(i2, k2));
                }
              }
            }
          }
          return X2;
        }
      };
      var SingularValueDecomposition2 = class {
        constructor(value, options = {}) {
          value = WrapperMatrix2D2.checkMatrix(value);
          if (value.isEmpty()) {
            throw new Error("Matrix must be non-empty");
          }
          let m2 = value.rows;
          let n2 = value.columns;
          const {
            computeLeftSingularVectors = true,
            computeRightSingularVectors = true,
            autoTranspose = false
          } = options;
          let wantu = Boolean(computeLeftSingularVectors);
          let wantv = Boolean(computeRightSingularVectors);
          let swapped = false;
          let at2;
          if (m2 < n2) {
            if (!autoTranspose) {
              console.warn(
                "Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose"
              );
              at2 = value.transpose();
            } else {
              at2 = value.clone();
              m2 = value.columns;
              n2 = value.rows;
              swapped = true;
              let aux = wantu;
              wantu = wantv;
              wantv = aux;
            }
          } else {
            at2 = value.transpose();
          }
          let nu = Math.min(m2, n2);
          let ni2 = Math.min(m2 + 1, n2);
          let s2 = new Float64Array(ni2);
          let U2 = new Matrix3(nu, m2);
          let V2 = new Matrix3(n2, n2);
          let e2 = new Float64Array(n2);
          let work = new Float64Array(m2);
          let si2 = new Float64Array(ni2);
          for (let i2 = 0; i2 < ni2; i2++) si2[i2] = i2;
          let nct = Math.min(m2 - 1, n2);
          let nrt = Math.max(0, Math.min(n2 - 2, m2));
          let mrc = Math.max(nct, nrt);
          for (let k2 = 0; k2 < mrc; k2++) {
            if (k2 < nct) {
              s2[k2] = 0;
              for (let i2 = k2; i2 < m2; i2++) {
                s2[k2] = hypotenuse(s2[k2], at2.get(k2, i2));
              }
              if (s2[k2] !== 0) {
                if (at2.get(k2, k2) < 0) {
                  s2[k2] = -s2[k2];
                }
                for (let i2 = k2; i2 < m2; i2++) {
                  at2.set(k2, i2, at2.get(k2, i2) / s2[k2]);
                }
                at2.set(k2, k2, at2.get(k2, k2) + 1);
              }
              s2[k2] = -s2[k2];
            }
            for (let j2 = k2 + 1; j2 < n2; j2++) {
              if (k2 < nct && s2[k2] !== 0) {
                let t2 = 0;
                for (let i2 = k2; i2 < m2; i2++) {
                  t2 += at2.get(k2, i2) * at2.get(j2, i2);
                }
                t2 = -t2 / at2.get(k2, k2);
                for (let i2 = k2; i2 < m2; i2++) {
                  at2.set(j2, i2, at2.get(j2, i2) + t2 * at2.get(k2, i2));
                }
              }
              e2[j2] = at2.get(j2, k2);
            }
            if (wantu && k2 < nct) {
              for (let i2 = k2; i2 < m2; i2++) {
                U2.set(k2, i2, at2.get(k2, i2));
              }
            }
            if (k2 < nrt) {
              e2[k2] = 0;
              for (let i2 = k2 + 1; i2 < n2; i2++) {
                e2[k2] = hypotenuse(e2[k2], e2[i2]);
              }
              if (e2[k2] !== 0) {
                if (e2[k2 + 1] < 0) {
                  e2[k2] = 0 - e2[k2];
                }
                for (let i2 = k2 + 1; i2 < n2; i2++) {
                  e2[i2] /= e2[k2];
                }
                e2[k2 + 1] += 1;
              }
              e2[k2] = -e2[k2];
              if (k2 + 1 < m2 && e2[k2] !== 0) {
                for (let i2 = k2 + 1; i2 < m2; i2++) {
                  work[i2] = 0;
                }
                for (let i2 = k2 + 1; i2 < m2; i2++) {
                  for (let j2 = k2 + 1; j2 < n2; j2++) {
                    work[i2] += e2[j2] * at2.get(j2, i2);
                  }
                }
                for (let j2 = k2 + 1; j2 < n2; j2++) {
                  let t2 = -e2[j2] / e2[k2 + 1];
                  for (let i2 = k2 + 1; i2 < m2; i2++) {
                    at2.set(j2, i2, at2.get(j2, i2) + t2 * work[i2]);
                  }
                }
              }
              if (wantv) {
                for (let i2 = k2 + 1; i2 < n2; i2++) {
                  V2.set(k2, i2, e2[i2]);
                }
              }
            }
          }
          let p2 = Math.min(n2, m2 + 1);
          if (nct < n2) {
            s2[nct] = at2.get(nct, nct);
          }
          if (m2 < p2) {
            s2[p2 - 1] = 0;
          }
          if (nrt + 1 < p2) {
            e2[nrt] = at2.get(p2 - 1, nrt);
          }
          e2[p2 - 1] = 0;
          if (wantu) {
            for (let j2 = nct; j2 < nu; j2++) {
              for (let i2 = 0; i2 < m2; i2++) {
                U2.set(j2, i2, 0);
              }
              U2.set(j2, j2, 1);
            }
            for (let k2 = nct - 1; k2 >= 0; k2--) {
              if (s2[k2] !== 0) {
                for (let j2 = k2 + 1; j2 < nu; j2++) {
                  let t2 = 0;
                  for (let i2 = k2; i2 < m2; i2++) {
                    t2 += U2.get(k2, i2) * U2.get(j2, i2);
                  }
                  t2 = -t2 / U2.get(k2, k2);
                  for (let i2 = k2; i2 < m2; i2++) {
                    U2.set(j2, i2, U2.get(j2, i2) + t2 * U2.get(k2, i2));
                  }
                }
                for (let i2 = k2; i2 < m2; i2++) {
                  U2.set(k2, i2, -U2.get(k2, i2));
                }
                U2.set(k2, k2, 1 + U2.get(k2, k2));
                for (let i2 = 0; i2 < k2 - 1; i2++) {
                  U2.set(k2, i2, 0);
                }
              } else {
                for (let i2 = 0; i2 < m2; i2++) {
                  U2.set(k2, i2, 0);
                }
                U2.set(k2, k2, 1);
              }
            }
          }
          if (wantv) {
            for (let k2 = n2 - 1; k2 >= 0; k2--) {
              if (k2 < nrt && e2[k2] !== 0) {
                for (let j2 = k2 + 1; j2 < n2; j2++) {
                  let t2 = 0;
                  for (let i2 = k2 + 1; i2 < n2; i2++) {
                    t2 += V2.get(k2, i2) * V2.get(j2, i2);
                  }
                  t2 = -t2 / V2.get(k2, k2 + 1);
                  for (let i2 = k2 + 1; i2 < n2; i2++) {
                    V2.set(j2, i2, V2.get(j2, i2) + t2 * V2.get(k2, i2));
                  }
                }
              }
              for (let i2 = 0; i2 < n2; i2++) {
                V2.set(k2, i2, 0);
              }
              V2.set(k2, k2, 1);
            }
          }
          let pp = p2 - 1;
          let eps = Number.EPSILON;
          while (p2 > 0) {
            let k2, kase;
            for (k2 = p2 - 2; k2 >= -1; k2--) {
              if (k2 === -1) {
                break;
              }
              const alpha = Number.MIN_VALUE + eps * Math.abs(s2[k2] + Math.abs(s2[k2 + 1]));
              if (Math.abs(e2[k2]) <= alpha || Number.isNaN(e2[k2])) {
                e2[k2] = 0;
                break;
              }
            }
            if (k2 === p2 - 2) {
              kase = 4;
            } else {
              let ks2;
              for (ks2 = p2 - 1; ks2 >= k2; ks2--) {
                if (ks2 === k2) {
                  break;
                }
                let t2 = (ks2 !== p2 ? Math.abs(e2[ks2]) : 0) + (ks2 !== k2 + 1 ? Math.abs(e2[ks2 - 1]) : 0);
                if (Math.abs(s2[ks2]) <= eps * t2) {
                  s2[ks2] = 0;
                  break;
                }
              }
              if (ks2 === k2) {
                kase = 3;
              } else if (ks2 === p2 - 1) {
                kase = 1;
              } else {
                kase = 2;
                k2 = ks2;
              }
            }
            k2++;
            switch (kase) {
              case 1: {
                let f2 = e2[p2 - 2];
                e2[p2 - 2] = 0;
                for (let j2 = p2 - 2; j2 >= k2; j2--) {
                  let t2 = hypotenuse(s2[j2], f2);
                  let cs2 = s2[j2] / t2;
                  let sn2 = f2 / t2;
                  s2[j2] = t2;
                  if (j2 !== k2) {
                    f2 = -sn2 * e2[j2 - 1];
                    e2[j2 - 1] = cs2 * e2[j2 - 1];
                  }
                  if (wantv) {
                    for (let i2 = 0; i2 < n2; i2++) {
                      t2 = cs2 * V2.get(j2, i2) + sn2 * V2.get(p2 - 1, i2);
                      V2.set(p2 - 1, i2, -sn2 * V2.get(j2, i2) + cs2 * V2.get(p2 - 1, i2));
                      V2.set(j2, i2, t2);
                    }
                  }
                }
                break;
              }
              case 2: {
                let f2 = e2[k2 - 1];
                e2[k2 - 1] = 0;
                for (let j2 = k2; j2 < p2; j2++) {
                  let t2 = hypotenuse(s2[j2], f2);
                  let cs2 = s2[j2] / t2;
                  let sn2 = f2 / t2;
                  s2[j2] = t2;
                  f2 = -sn2 * e2[j2];
                  e2[j2] = cs2 * e2[j2];
                  if (wantu) {
                    for (let i2 = 0; i2 < m2; i2++) {
                      t2 = cs2 * U2.get(j2, i2) + sn2 * U2.get(k2 - 1, i2);
                      U2.set(k2 - 1, i2, -sn2 * U2.get(j2, i2) + cs2 * U2.get(k2 - 1, i2));
                      U2.set(j2, i2, t2);
                    }
                  }
                }
                break;
              }
              case 3: {
                const scale = Math.max(
                  Math.abs(s2[p2 - 1]),
                  Math.abs(s2[p2 - 2]),
                  Math.abs(e2[p2 - 2]),
                  Math.abs(s2[k2]),
                  Math.abs(e2[k2])
                );
                const sp = s2[p2 - 1] / scale;
                const spm1 = s2[p2 - 2] / scale;
                const epm1 = e2[p2 - 2] / scale;
                const sk = s2[k2] / scale;
                const ek = e2[k2] / scale;
                const b2 = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
                const c2 = sp * epm1 * (sp * epm1);
                let shift = 0;
                if (b2 !== 0 || c2 !== 0) {
                  if (b2 < 0) {
                    shift = 0 - Math.sqrt(b2 * b2 + c2);
                  } else {
                    shift = Math.sqrt(b2 * b2 + c2);
                  }
                  shift = c2 / (b2 + shift);
                }
                let f2 = (sk + sp) * (sk - sp) + shift;
                let g2 = sk * ek;
                for (let j2 = k2; j2 < p2 - 1; j2++) {
                  let t2 = hypotenuse(f2, g2);
                  if (t2 === 0) t2 = Number.MIN_VALUE;
                  let cs2 = f2 / t2;
                  let sn2 = g2 / t2;
                  if (j2 !== k2) {
                    e2[j2 - 1] = t2;
                  }
                  f2 = cs2 * s2[j2] + sn2 * e2[j2];
                  e2[j2] = cs2 * e2[j2] - sn2 * s2[j2];
                  g2 = sn2 * s2[j2 + 1];
                  s2[j2 + 1] = cs2 * s2[j2 + 1];
                  if (wantv) {
                    for (let i2 = 0; i2 < n2; i2++) {
                      t2 = cs2 * V2.get(j2, i2) + sn2 * V2.get(j2 + 1, i2);
                      V2.set(j2 + 1, i2, -sn2 * V2.get(j2, i2) + cs2 * V2.get(j2 + 1, i2));
                      V2.set(j2, i2, t2);
                    }
                  }
                  t2 = hypotenuse(f2, g2);
                  if (t2 === 0) t2 = Number.MIN_VALUE;
                  cs2 = f2 / t2;
                  sn2 = g2 / t2;
                  s2[j2] = t2;
                  f2 = cs2 * e2[j2] + sn2 * s2[j2 + 1];
                  s2[j2 + 1] = -sn2 * e2[j2] + cs2 * s2[j2 + 1];
                  g2 = sn2 * e2[j2 + 1];
                  e2[j2 + 1] = cs2 * e2[j2 + 1];
                  if (wantu && j2 < m2 - 1) {
                    for (let i2 = 0; i2 < m2; i2++) {
                      t2 = cs2 * U2.get(j2, i2) + sn2 * U2.get(j2 + 1, i2);
                      U2.set(j2 + 1, i2, -sn2 * U2.get(j2, i2) + cs2 * U2.get(j2 + 1, i2));
                      U2.set(j2, i2, t2);
                    }
                  }
                }
                e2[p2 - 2] = f2;
                break;
              }
              case 4: {
                if (s2[k2] <= 0) {
                  s2[k2] = s2[k2] < 0 ? -s2[k2] : 0;
                  if (wantv) {
                    for (let i2 = 0; i2 <= pp; i2++) {
                      V2.set(k2, i2, -V2.get(k2, i2));
                    }
                  }
                }
                while (k2 < pp) {
                  if (s2[k2] >= s2[k2 + 1]) {
                    break;
                  }
                  let t2 = s2[k2];
                  s2[k2] = s2[k2 + 1];
                  s2[k2 + 1] = t2;
                  if (wantv && k2 < n2 - 1) {
                    for (let i2 = 0; i2 < n2; i2++) {
                      t2 = V2.get(k2 + 1, i2);
                      V2.set(k2 + 1, i2, V2.get(k2, i2));
                      V2.set(k2, i2, t2);
                    }
                  }
                  if (wantu && k2 < m2 - 1) {
                    for (let i2 = 0; i2 < m2; i2++) {
                      t2 = U2.get(k2 + 1, i2);
                      U2.set(k2 + 1, i2, U2.get(k2, i2));
                      U2.set(k2, i2, t2);
                    }
                  }
                  k2++;
                }
                p2--;
                break;
              }
            }
          }
          U2 = U2.isSquare() ? transposeSquareInPlace(U2) : U2.transpose();
          V2 = transposeSquareInPlace(V2);
          if (swapped) {
            let tmp = V2;
            V2 = U2;
            U2 = tmp;
          }
          this.m = m2;
          this.n = n2;
          this.s = s2;
          this.U = U2;
          this.V = V2;
        }
        solve(value) {
          let Y2 = value;
          let e2 = this.threshold;
          let scols = this.s.length;
          let Ls2 = Matrix3.zeros(scols, scols);
          for (let i2 = 0; i2 < scols; i2++) {
            if (Math.abs(this.s[i2]) <= e2) {
              Ls2.set(i2, i2, 0);
            } else {
              Ls2.set(i2, i2, 1 / this.s[i2]);
            }
          }
          let U2 = this.U;
          let V2 = this.rightSingularVectors;
          let VL = V2.mmul(Ls2);
          let vrows = V2.rows;
          let urows = U2.rows;
          let VLU = Matrix3.zeros(vrows, urows);
          for (let i2 = 0; i2 < vrows; i2++) {
            for (let j2 = 0; j2 < urows; j2++) {
              let sum = 0;
              for (let k2 = 0; k2 < scols; k2++) {
                sum += VL.get(i2, k2) * U2.get(j2, k2);
              }
              VLU.set(i2, j2, sum);
            }
          }
          return VLU.mmul(Y2);
        }
        solveForDiagonal(value) {
          return this.solve(Matrix3.diag(value));
        }
        inverse() {
          let V2 = this.V;
          let e2 = this.threshold;
          let vrows = V2.rows;
          let vcols = V2.columns;
          let X2 = new Matrix3(vrows, this.s.length);
          for (let i2 = 0; i2 < vrows; i2++) {
            for (let j2 = 0; j2 < vcols; j2++) {
              if (Math.abs(this.s[j2]) > e2) {
                X2.set(i2, j2, V2.get(i2, j2) / this.s[j2]);
              }
            }
          }
          let U2 = this.U;
          let urows = U2.rows;
          let ucols = U2.columns;
          let Y2 = new Matrix3(vrows, urows);
          for (let i2 = 0; i2 < vrows; i2++) {
            for (let j2 = 0; j2 < urows; j2++) {
              let sum = 0;
              for (let k2 = 0; k2 < ucols; k2++) {
                sum += X2.get(i2, k2) * U2.get(j2, k2);
              }
              Y2.set(i2, j2, sum);
            }
          }
          return Y2;
        }
        get condition() {
          return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
        }
        get norm2() {
          return this.s[0];
        }
        get rank() {
          let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
          let r2 = 0;
          let s2 = this.s;
          for (let i2 = 0, ii2 = s2.length; i2 < ii2; i2++) {
            if (s2[i2] > tol) {
              r2++;
            }
          }
          return r2;
        }
        get diagonal() {
          return Array.from(this.s);
        }
        get threshold() {
          return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
        }
        get leftSingularVectors() {
          return this.U;
        }
        get rightSingularVectors() {
          return this.V;
        }
        get diagonalMatrix() {
          return Matrix3.diag(this.s);
        }
      };
      function inverse2(matrix2, useSVD = false) {
        matrix2 = WrapperMatrix2D2.checkMatrix(matrix2);
        if (useSVD) {
          return new SingularValueDecomposition2(matrix2).inverse();
        } else {
          return solve3(matrix2, Matrix3.eye(matrix2.rows));
        }
      }
      function solve3(leftHandSide, rightHandSide, useSVD = false) {
        leftHandSide = WrapperMatrix2D2.checkMatrix(leftHandSide);
        rightHandSide = WrapperMatrix2D2.checkMatrix(rightHandSide);
        if (useSVD) {
          return new SingularValueDecomposition2(leftHandSide).solve(rightHandSide);
        } else {
          return leftHandSide.isSquare() ? new LuDecomposition2(leftHandSide).solve(rightHandSide) : new QrDecomposition2(leftHandSide).solve(rightHandSide);
        }
      }
      function determinant2(matrix2) {
        matrix2 = Matrix3.checkMatrix(matrix2);
        if (matrix2.isSquare()) {
          if (matrix2.columns === 0) {
            return 1;
          }
          let a2, b2, c2, d2;
          if (matrix2.columns === 2) {
            a2 = matrix2.get(0, 0);
            b2 = matrix2.get(0, 1);
            c2 = matrix2.get(1, 0);
            d2 = matrix2.get(1, 1);
            return a2 * d2 - b2 * c2;
          } else if (matrix2.columns === 3) {
            let subMatrix0, subMatrix1, subMatrix2;
            subMatrix0 = new MatrixSelectionView2(matrix2, [1, 2], [1, 2]);
            subMatrix1 = new MatrixSelectionView2(matrix2, [1, 2], [0, 2]);
            subMatrix2 = new MatrixSelectionView2(matrix2, [1, 2], [0, 1]);
            a2 = matrix2.get(0, 0);
            b2 = matrix2.get(0, 1);
            c2 = matrix2.get(0, 2);
            return a2 * determinant2(subMatrix0) - b2 * determinant2(subMatrix1) + c2 * determinant2(subMatrix2);
          } else {
            return new LuDecomposition2(matrix2).determinant;
          }
        } else {
          throw Error("determinant can only be calculated for a square matrix");
        }
      }
      function xrange(n2, exception) {
        let range = [];
        for (let i2 = 0; i2 < n2; i2++) {
          if (i2 !== exception) {
            range.push(i2);
          }
        }
        return range;
      }
      function dependenciesOneRow(error, matrix2, index, thresholdValue = 1e-9, thresholdError = 1e-9) {
        if (error > thresholdError) {
          return new Array(matrix2.rows + 1).fill(0);
        } else {
          let returnArray = matrix2.addRow(index, [0]);
          for (let i2 = 0; i2 < returnArray.rows; i2++) {
            if (Math.abs(returnArray.get(i2, 0)) < thresholdValue) {
              returnArray.set(i2, 0, 0);
            }
          }
          return returnArray.to1DArray();
        }
      }
      function linearDependencies2(matrix2, options = {}) {
        const { thresholdValue = 1e-9, thresholdError = 1e-9 } = options;
        matrix2 = Matrix3.checkMatrix(matrix2);
        let n2 = matrix2.rows;
        let results = new Matrix3(n2, n2);
        for (let i2 = 0; i2 < n2; i2++) {
          let b2 = Matrix3.columnVector(matrix2.getRow(i2));
          let Abis = matrix2.subMatrixRow(xrange(n2, i2)).transpose();
          let svd = new SingularValueDecomposition2(Abis);
          let x2 = svd.solve(b2);
          let scale = Matrix3.abs(b2).max() || 1;
          let error = Matrix3.sub(b2, Abis.mmul(x2)).abs().max() / scale;
          results.setRow(
            i2,
            dependenciesOneRow(error, x2, i2, thresholdValue, thresholdError)
          );
        }
        return results;
      }
      function pseudoInverse2(matrix2, threshold = Number.EPSILON) {
        matrix2 = Matrix3.checkMatrix(matrix2);
        if (matrix2.isEmpty()) {
          return matrix2.transpose();
        }
        let svdSolution = new SingularValueDecomposition2(matrix2, { autoTranspose: true });
        let U2 = svdSolution.leftSingularVectors;
        let V2 = svdSolution.rightSingularVectors;
        let s2 = svdSolution.diagonal;
        const cutoff = threshold * Math.max(matrix2.rows, matrix2.columns) * s2[0];
        for (let i2 = 0; i2 < s2.length; i2++) {
          if (Math.abs(s2[i2]) > cutoff) {
            s2[i2] = 1 / s2[i2];
          } else {
            s2[i2] = 0;
          }
        }
        return V2.mmul(Matrix3.diag(s2).mmul(U2.transpose()));
      }
      function covariance2(xMatrix, yMatrix = xMatrix, options = {}) {
        xMatrix = new Matrix3(xMatrix);
        let yIsSame = false;
        if (typeof yMatrix === "object" && !Matrix3.isMatrix(yMatrix) && !isAnyArray(yMatrix)) {
          options = yMatrix;
          yMatrix = xMatrix;
          yIsSame = true;
        } else {
          yMatrix = new Matrix3(yMatrix);
        }
        if (xMatrix.rows !== yMatrix.rows) {
          throw new TypeError("Both matrices must have the same number of rows");
        }
        const { center = true } = options;
        if (center) {
          xMatrix = xMatrix.center("column");
          if (!yIsSame) {
            yMatrix = yMatrix.center("column");
          }
        }
        const cov = xMatrix.transposeMultiply(yMatrix);
        for (let i2 = 0; i2 < cov.rows; i2++) {
          for (let j2 = 0; j2 < cov.columns; j2++) {
            cov.set(i2, j2, cov.get(i2, j2) * (1 / (xMatrix.rows - 1)));
          }
        }
        return cov;
      }
      function correlation2(xMatrix, yMatrix = xMatrix, options = {}) {
        xMatrix = new Matrix3(xMatrix);
        let yIsSame = false;
        if (typeof yMatrix === "object" && !Matrix3.isMatrix(yMatrix) && !isAnyArray(yMatrix)) {
          options = yMatrix;
          yMatrix = xMatrix;
          yIsSame = true;
        } else {
          yMatrix = new Matrix3(yMatrix);
        }
        if (xMatrix.rows !== yMatrix.rows) {
          throw new TypeError("Both matrices must have the same number of rows");
        }
        const { center = true, scale = true } = options;
        if (center) {
          xMatrix.center("column");
          if (!yIsSame) {
            yMatrix.center("column");
          }
        }
        if (scale) {
          xMatrix.scale("column");
          if (!yIsSame) {
            yMatrix.scale("column");
          }
        }
        const sdx = xMatrix.standardDeviation("column", { unbiased: true });
        const sdy = yIsSame ? sdx : yMatrix.standardDeviation("column", { unbiased: true });
        const corr = xMatrix.transposeMultiply(yMatrix);
        for (let i2 = 0; i2 < corr.rows; i2++) {
          for (let j2 = 0; j2 < corr.columns; j2++) {
            corr.set(
              i2,
              j2,
              corr.get(i2, j2) * (1 / (sdx[i2] * sdy[j2])) * (1 / (xMatrix.rows - 1))
            );
          }
        }
        return corr;
      }
      var EigenvalueDecomposition2 = class {
        constructor(matrix2, options = {}) {
          const { assumeSymmetric = false } = options;
          matrix2 = WrapperMatrix2D2.checkMatrix(matrix2);
          if (!matrix2.isSquare()) {
            throw new Error("Matrix is not a square matrix");
          }
          if (matrix2.isEmpty()) {
            throw new Error("Matrix must be non-empty");
          }
          let n2 = matrix2.columns;
          let V2 = new Matrix3(n2, n2);
          let d2 = new Float64Array(n2);
          let e2 = new Float64Array(n2);
          let value = matrix2;
          let i2, j2;
          let isSymmetric = false;
          if (assumeSymmetric) {
            isSymmetric = true;
          } else {
            isSymmetric = matrix2.isSymmetric();
          }
          if (isSymmetric) {
            for (i2 = 0; i2 < n2; i2++) {
              for (j2 = 0; j2 < n2; j2++) {
                V2.set(j2, i2, value.get(i2, j2));
              }
            }
            tred2(n2, e2, d2, V2);
            tql2(n2, e2, d2, V2);
            transposeSquareInPlace(V2);
          } else {
            let H2 = new Matrix3(n2, n2);
            let ort = new Float64Array(n2);
            for (j2 = 0; j2 < n2; j2++) {
              for (i2 = 0; i2 < n2; i2++) {
                H2.set(i2, j2, value.get(i2, j2));
              }
            }
            orthes(n2, H2, ort, V2);
            hqr2(n2, e2, d2, V2, H2);
          }
          this.n = n2;
          this.e = e2;
          this.d = d2;
          this.V = V2;
        }
        get realEigenvalues() {
          return Array.from(this.d);
        }
        get imaginaryEigenvalues() {
          return Array.from(this.e);
        }
        get eigenvectorMatrix() {
          return this.V;
        }
        get diagonalMatrix() {
          let n2 = this.n;
          let e2 = this.e;
          let d2 = this.d;
          let X2 = new Matrix3(n2, n2);
          let i2, j2;
          for (i2 = 0; i2 < n2; i2++) {
            for (j2 = 0; j2 < n2; j2++) {
              X2.set(i2, j2, 0);
            }
            X2.set(i2, i2, d2[i2]);
            if (e2[i2] > 0) {
              X2.set(i2, i2 + 1, e2[i2]);
            } else if (e2[i2] < 0) {
              X2.set(i2, i2 - 1, e2[i2]);
            }
          }
          return X2;
        }
      };
      function tred2(n2, e2, d2, V2) {
        let f2, g2, h2, i2, j2, k2, hh, scale;
        for (j2 = 0; j2 < n2; j2++) {
          d2[j2] = V2.get(j2, n2 - 1);
        }
        for (i2 = n2 - 1; i2 > 0; i2--) {
          scale = 0;
          h2 = 0;
          for (k2 = 0; k2 < i2; k2++) {
            scale = scale + Math.abs(d2[k2]);
          }
          if (scale === 0) {
            e2[i2] = d2[i2 - 1];
            for (j2 = 0; j2 < i2; j2++) {
              d2[j2] = V2.get(j2, i2 - 1);
              V2.set(j2, i2, 0);
              V2.set(i2, j2, 0);
            }
          } else {
            for (k2 = 0; k2 < i2; k2++) {
              d2[k2] /= scale;
              h2 += d2[k2] * d2[k2];
            }
            f2 = d2[i2 - 1];
            g2 = Math.sqrt(h2);
            if (f2 > 0) {
              g2 = -g2;
            }
            e2[i2] = scale * g2;
            h2 = h2 - f2 * g2;
            d2[i2 - 1] = f2 - g2;
            for (j2 = 0; j2 < i2; j2++) {
              e2[j2] = 0;
            }
            for (j2 = 0; j2 < i2; j2++) {
              f2 = d2[j2];
              V2.set(i2, j2, f2);
              g2 = e2[j2] + V2.get(j2, j2) * f2;
              for (k2 = j2 + 1; k2 <= i2 - 1; k2++) {
                g2 += V2.get(j2, k2) * d2[k2];
                e2[k2] += V2.get(j2, k2) * f2;
              }
              e2[j2] = g2;
            }
            f2 = 0;
            for (j2 = 0; j2 < i2; j2++) {
              e2[j2] /= h2;
              f2 += e2[j2] * d2[j2];
            }
            hh = f2 / (h2 + h2);
            for (j2 = 0; j2 < i2; j2++) {
              e2[j2] -= hh * d2[j2];
            }
            for (j2 = 0; j2 < i2; j2++) {
              f2 = d2[j2];
              g2 = e2[j2];
              for (k2 = j2; k2 <= i2 - 1; k2++) {
                V2.set(j2, k2, V2.get(j2, k2) - (f2 * e2[k2] + g2 * d2[k2]));
              }
              d2[j2] = V2.get(j2, i2 - 1);
              V2.set(j2, i2, 0);
            }
          }
          d2[i2] = h2;
        }
        for (i2 = 0; i2 < n2 - 1; i2++) {
          V2.set(i2, n2 - 1, V2.get(i2, i2));
          V2.set(i2, i2, 1);
          h2 = d2[i2 + 1];
          if (h2 !== 0) {
            for (k2 = 0; k2 <= i2; k2++) {
              d2[k2] = V2.get(i2 + 1, k2) / h2;
            }
            for (j2 = 0; j2 <= i2; j2++) {
              g2 = 0;
              for (k2 = 0; k2 <= i2; k2++) {
                g2 += V2.get(i2 + 1, k2) * V2.get(j2, k2);
              }
              for (k2 = 0; k2 <= i2; k2++) {
                V2.set(j2, k2, V2.get(j2, k2) - g2 * d2[k2]);
              }
            }
          }
          for (k2 = 0; k2 <= i2; k2++) {
            V2.set(i2 + 1, k2, 0);
          }
        }
        for (j2 = 0; j2 < n2; j2++) {
          d2[j2] = V2.get(j2, n2 - 1);
          V2.set(j2, n2 - 1, 0);
        }
        V2.set(n2 - 1, n2 - 1, 1);
        e2[0] = 0;
      }
      function tql2(n2, e2, d2, V2) {
        let g2, h2, i2, j2, k2, l2, m2, p2, r2, dl1, c2, c22, c3, el1, s2, s22;
        for (i2 = 1; i2 < n2; i2++) {
          e2[i2 - 1] = e2[i2];
        }
        e2[n2 - 1] = 0;
        let f2 = 0;
        let tst1 = 0;
        let eps = Number.EPSILON;
        for (l2 = 0; l2 < n2; l2++) {
          tst1 = Math.max(tst1, Math.abs(d2[l2]) + Math.abs(e2[l2]));
          m2 = l2;
          while (m2 < n2) {
            if (Math.abs(e2[m2]) <= eps * tst1) {
              break;
            }
            m2++;
          }
          if (m2 > l2) {
            do {
              g2 = d2[l2];
              p2 = (d2[l2 + 1] - g2) / (2 * e2[l2]);
              r2 = hypotenuse(p2, 1);
              if (p2 < 0) {
                r2 = -r2;
              }
              d2[l2] = e2[l2] / (p2 + r2);
              d2[l2 + 1] = e2[l2] * (p2 + r2);
              dl1 = d2[l2 + 1];
              h2 = g2 - d2[l2];
              for (i2 = l2 + 2; i2 < n2; i2++) {
                d2[i2] -= h2;
              }
              f2 = f2 + h2;
              p2 = d2[m2];
              c2 = 1;
              c22 = c2;
              c3 = c2;
              el1 = e2[l2 + 1];
              s2 = 0;
              s22 = 0;
              for (i2 = m2 - 1; i2 >= l2; i2--) {
                c3 = c22;
                c22 = c2;
                s22 = s2;
                g2 = c2 * e2[i2];
                h2 = c2 * p2;
                r2 = hypotenuse(p2, e2[i2]);
                e2[i2 + 1] = s2 * r2;
                s2 = e2[i2] / r2;
                c2 = p2 / r2;
                p2 = c2 * d2[i2] - s2 * g2;
                d2[i2 + 1] = h2 + s2 * (c2 * g2 + s2 * d2[i2]);
                for (k2 = 0; k2 < n2; k2++) {
                  h2 = V2.get(i2 + 1, k2);
                  V2.set(i2 + 1, k2, s2 * V2.get(i2, k2) + c2 * h2);
                  V2.set(i2, k2, c2 * V2.get(i2, k2) - s2 * h2);
                }
              }
              p2 = -s2 * s22 * c3 * el1 * e2[l2] / dl1;
              e2[l2] = s2 * p2;
              d2[l2] = c2 * p2;
            } while (Math.abs(e2[l2]) > eps * tst1);
          }
          d2[l2] = d2[l2] + f2;
          e2[l2] = 0;
        }
        for (i2 = 0; i2 < n2 - 1; i2++) {
          k2 = i2;
          p2 = d2[i2];
          for (j2 = i2 + 1; j2 < n2; j2++) {
            if (d2[j2] < p2) {
              k2 = j2;
              p2 = d2[j2];
            }
          }
          if (k2 !== i2) {
            d2[k2] = d2[i2];
            d2[i2] = p2;
            for (j2 = 0; j2 < n2; j2++) {
              p2 = V2.get(i2, j2);
              V2.set(i2, j2, V2.get(k2, j2));
              V2.set(k2, j2, p2);
            }
          }
        }
      }
      function orthes(n2, H2, ort, V2) {
        let low = 0;
        let high = n2 - 1;
        let f2, g2, h2, i2, j2, m2;
        let scale;
        for (m2 = low + 1; m2 <= high - 1; m2++) {
          scale = 0;
          for (i2 = m2; i2 <= high; i2++) {
            scale = scale + Math.abs(H2.get(i2, m2 - 1));
          }
          if (scale !== 0) {
            h2 = 0;
            for (i2 = high; i2 >= m2; i2--) {
              ort[i2] = H2.get(i2, m2 - 1) / scale;
              h2 += ort[i2] * ort[i2];
            }
            g2 = Math.sqrt(h2);
            if (ort[m2] > 0) {
              g2 = -g2;
            }
            h2 = h2 - ort[m2] * g2;
            ort[m2] = ort[m2] - g2;
            for (j2 = m2; j2 < n2; j2++) {
              f2 = 0;
              for (i2 = high; i2 >= m2; i2--) {
                f2 += ort[i2] * H2.get(i2, j2);
              }
              f2 = f2 / h2;
              for (i2 = m2; i2 <= high; i2++) {
                H2.set(i2, j2, H2.get(i2, j2) - f2 * ort[i2]);
              }
            }
            for (i2 = 0; i2 <= high; i2++) {
              f2 = 0;
              for (j2 = high; j2 >= m2; j2--) {
                f2 += ort[j2] * H2.get(i2, j2);
              }
              f2 = f2 / h2;
              for (j2 = m2; j2 <= high; j2++) {
                H2.set(i2, j2, H2.get(i2, j2) - f2 * ort[j2]);
              }
            }
            ort[m2] = scale * ort[m2];
            H2.set(m2, m2 - 1, scale * g2);
          }
        }
        for (i2 = 0; i2 < n2; i2++) {
          for (j2 = 0; j2 < n2; j2++) {
            V2.set(i2, j2, i2 === j2 ? 1 : 0);
          }
        }
        for (m2 = high - 1; m2 >= low + 1; m2--) {
          if (H2.get(m2, m2 - 1) !== 0) {
            for (i2 = m2 + 1; i2 <= high; i2++) {
              ort[i2] = H2.get(i2, m2 - 1);
            }
            for (j2 = m2; j2 <= high; j2++) {
              g2 = 0;
              for (i2 = m2; i2 <= high; i2++) {
                g2 += ort[i2] * V2.get(i2, j2);
              }
              g2 = g2 / ort[m2] / H2.get(m2, m2 - 1);
              for (i2 = m2; i2 <= high; i2++) {
                V2.set(i2, j2, V2.get(i2, j2) + g2 * ort[i2]);
              }
            }
          }
        }
      }
      function hqr2(nn2, e2, d2, V2, H2) {
        let n2 = nn2 - 1;
        let low = 0;
        let high = nn2 - 1;
        let eps = Number.EPSILON;
        let exshift = 0;
        let norm = 0;
        let p2 = 0;
        let q2 = 0;
        let r2 = 0;
        let s2 = 0;
        let z2 = 0;
        let iter = 0;
        let i2, j2, k2, l2, m2, t2, w2, x2, y2;
        let ra2, sa2, vr2, vi2;
        let notlast, cdivres;
        for (i2 = 0; i2 < nn2; i2++) {
          if (i2 < low || i2 > high) {
            d2[i2] = H2.get(i2, i2);
            e2[i2] = 0;
          }
          for (j2 = Math.max(i2 - 1, 0); j2 < nn2; j2++) {
            norm = norm + Math.abs(H2.get(i2, j2));
          }
        }
        while (n2 >= low) {
          l2 = n2;
          while (l2 > low) {
            s2 = Math.abs(H2.get(l2 - 1, l2 - 1)) + Math.abs(H2.get(l2, l2));
            if (s2 === 0) {
              s2 = norm;
            }
            if (Math.abs(H2.get(l2, l2 - 1)) < eps * s2) {
              break;
            }
            l2--;
          }
          if (l2 === n2) {
            H2.set(n2, n2, H2.get(n2, n2) + exshift);
            d2[n2] = H2.get(n2, n2);
            e2[n2] = 0;
            n2--;
            iter = 0;
          } else if (l2 === n2 - 1) {
            w2 = H2.get(n2, n2 - 1) * H2.get(n2 - 1, n2);
            p2 = (H2.get(n2 - 1, n2 - 1) - H2.get(n2, n2)) / 2;
            q2 = p2 * p2 + w2;
            z2 = Math.sqrt(Math.abs(q2));
            H2.set(n2, n2, H2.get(n2, n2) + exshift);
            H2.set(n2 - 1, n2 - 1, H2.get(n2 - 1, n2 - 1) + exshift);
            x2 = H2.get(n2, n2);
            if (q2 >= 0) {
              z2 = p2 >= 0 ? p2 + z2 : p2 - z2;
              d2[n2 - 1] = x2 + z2;
              d2[n2] = d2[n2 - 1];
              if (z2 !== 0) {
                d2[n2] = x2 - w2 / z2;
              }
              e2[n2 - 1] = 0;
              e2[n2] = 0;
              x2 = H2.get(n2, n2 - 1);
              s2 = Math.abs(x2) + Math.abs(z2);
              p2 = x2 / s2;
              q2 = z2 / s2;
              r2 = Math.sqrt(p2 * p2 + q2 * q2);
              p2 = p2 / r2;
              q2 = q2 / r2;
              for (j2 = n2 - 1; j2 < nn2; j2++) {
                z2 = H2.get(n2 - 1, j2);
                H2.set(n2 - 1, j2, q2 * z2 + p2 * H2.get(n2, j2));
                H2.set(n2, j2, q2 * H2.get(n2, j2) - p2 * z2);
              }
              for (i2 = 0; i2 <= n2; i2++) {
                z2 = H2.get(i2, n2 - 1);
                H2.set(i2, n2 - 1, q2 * z2 + p2 * H2.get(i2, n2));
                H2.set(i2, n2, q2 * H2.get(i2, n2) - p2 * z2);
              }
              for (i2 = low; i2 <= high; i2++) {
                z2 = V2.get(i2, n2 - 1);
                V2.set(i2, n2 - 1, q2 * z2 + p2 * V2.get(i2, n2));
                V2.set(i2, n2, q2 * V2.get(i2, n2) - p2 * z2);
              }
            } else {
              d2[n2 - 1] = x2 + p2;
              d2[n2] = x2 + p2;
              e2[n2 - 1] = z2;
              e2[n2] = -z2;
            }
            n2 = n2 - 2;
            iter = 0;
          } else {
            x2 = H2.get(n2, n2);
            y2 = 0;
            w2 = 0;
            if (l2 < n2) {
              y2 = H2.get(n2 - 1, n2 - 1);
              w2 = H2.get(n2, n2 - 1) * H2.get(n2 - 1, n2);
            }
            if (iter === 10) {
              exshift += x2;
              for (i2 = low; i2 <= n2; i2++) {
                H2.set(i2, i2, H2.get(i2, i2) - x2);
              }
              s2 = Math.abs(H2.get(n2, n2 - 1)) + Math.abs(H2.get(n2 - 1, n2 - 2));
              x2 = y2 = 0.75 * s2;
              w2 = -0.4375 * s2 * s2;
            }
            if (iter === 30) {
              s2 = (y2 - x2) / 2;
              s2 = s2 * s2 + w2;
              if (s2 > 0) {
                s2 = Math.sqrt(s2);
                if (y2 < x2) {
                  s2 = -s2;
                }
                s2 = x2 - w2 / ((y2 - x2) / 2 + s2);
                for (i2 = low; i2 <= n2; i2++) {
                  H2.set(i2, i2, H2.get(i2, i2) - s2);
                }
                exshift += s2;
                x2 = y2 = w2 = 0.964;
              }
            }
            iter = iter + 1;
            m2 = n2 - 2;
            while (m2 >= l2) {
              z2 = H2.get(m2, m2);
              r2 = x2 - z2;
              s2 = y2 - z2;
              p2 = (r2 * s2 - w2) / H2.get(m2 + 1, m2) + H2.get(m2, m2 + 1);
              q2 = H2.get(m2 + 1, m2 + 1) - z2 - r2 - s2;
              r2 = H2.get(m2 + 2, m2 + 1);
              s2 = Math.abs(p2) + Math.abs(q2) + Math.abs(r2);
              p2 = p2 / s2;
              q2 = q2 / s2;
              r2 = r2 / s2;
              if (m2 === l2) {
                break;
              }
              if (Math.abs(H2.get(m2, m2 - 1)) * (Math.abs(q2) + Math.abs(r2)) < eps * (Math.abs(p2) * (Math.abs(H2.get(m2 - 1, m2 - 1)) + Math.abs(z2) + Math.abs(H2.get(m2 + 1, m2 + 1))))) {
                break;
              }
              m2--;
            }
            for (i2 = m2 + 2; i2 <= n2; i2++) {
              H2.set(i2, i2 - 2, 0);
              if (i2 > m2 + 2) {
                H2.set(i2, i2 - 3, 0);
              }
            }
            for (k2 = m2; k2 <= n2 - 1; k2++) {
              notlast = k2 !== n2 - 1;
              if (k2 !== m2) {
                p2 = H2.get(k2, k2 - 1);
                q2 = H2.get(k2 + 1, k2 - 1);
                r2 = notlast ? H2.get(k2 + 2, k2 - 1) : 0;
                x2 = Math.abs(p2) + Math.abs(q2) + Math.abs(r2);
                if (x2 !== 0) {
                  p2 = p2 / x2;
                  q2 = q2 / x2;
                  r2 = r2 / x2;
                }
              }
              if (x2 === 0) {
                break;
              }
              s2 = Math.sqrt(p2 * p2 + q2 * q2 + r2 * r2);
              if (p2 < 0) {
                s2 = -s2;
              }
              if (s2 !== 0) {
                if (k2 !== m2) {
                  H2.set(k2, k2 - 1, -s2 * x2);
                } else if (l2 !== m2) {
                  H2.set(k2, k2 - 1, -H2.get(k2, k2 - 1));
                }
                p2 = p2 + s2;
                x2 = p2 / s2;
                y2 = q2 / s2;
                z2 = r2 / s2;
                q2 = q2 / p2;
                r2 = r2 / p2;
                for (j2 = k2; j2 < nn2; j2++) {
                  p2 = H2.get(k2, j2) + q2 * H2.get(k2 + 1, j2);
                  if (notlast) {
                    p2 = p2 + r2 * H2.get(k2 + 2, j2);
                    H2.set(k2 + 2, j2, H2.get(k2 + 2, j2) - p2 * z2);
                  }
                  H2.set(k2, j2, H2.get(k2, j2) - p2 * x2);
                  H2.set(k2 + 1, j2, H2.get(k2 + 1, j2) - p2 * y2);
                }
                for (i2 = 0; i2 <= Math.min(n2, k2 + 3); i2++) {
                  p2 = x2 * H2.get(i2, k2) + y2 * H2.get(i2, k2 + 1);
                  if (notlast) {
                    p2 = p2 + z2 * H2.get(i2, k2 + 2);
                    H2.set(i2, k2 + 2, H2.get(i2, k2 + 2) - p2 * r2);
                  }
                  H2.set(i2, k2, H2.get(i2, k2) - p2);
                  H2.set(i2, k2 + 1, H2.get(i2, k2 + 1) - p2 * q2);
                }
                for (i2 = low; i2 <= high; i2++) {
                  p2 = x2 * V2.get(i2, k2) + y2 * V2.get(i2, k2 + 1);
                  if (notlast) {
                    p2 = p2 + z2 * V2.get(i2, k2 + 2);
                    V2.set(i2, k2 + 2, V2.get(i2, k2 + 2) - p2 * r2);
                  }
                  V2.set(i2, k2, V2.get(i2, k2) - p2);
                  V2.set(i2, k2 + 1, V2.get(i2, k2 + 1) - p2 * q2);
                }
              }
            }
          }
        }
        if (norm === 0) {
          return;
        }
        for (n2 = nn2 - 1; n2 >= 0; n2--) {
          p2 = d2[n2];
          q2 = e2[n2];
          if (q2 === 0) {
            l2 = n2;
            H2.set(n2, n2, 1);
            for (i2 = n2 - 1; i2 >= 0; i2--) {
              w2 = H2.get(i2, i2) - p2;
              r2 = 0;
              for (j2 = l2; j2 <= n2; j2++) {
                r2 = r2 + H2.get(i2, j2) * H2.get(j2, n2);
              }
              if (e2[i2] < 0) {
                z2 = w2;
                s2 = r2;
              } else {
                l2 = i2;
                if (e2[i2] === 0) {
                  H2.set(i2, n2, w2 !== 0 ? -r2 / w2 : -r2 / (eps * norm));
                } else {
                  x2 = H2.get(i2, i2 + 1);
                  y2 = H2.get(i2 + 1, i2);
                  q2 = (d2[i2] - p2) * (d2[i2] - p2) + e2[i2] * e2[i2];
                  t2 = (x2 * s2 - z2 * r2) / q2;
                  H2.set(i2, n2, t2);
                  H2.set(
                    i2 + 1,
                    n2,
                    Math.abs(x2) > Math.abs(z2) ? (-r2 - w2 * t2) / x2 : (-s2 - y2 * t2) / z2
                  );
                }
                t2 = Math.abs(H2.get(i2, n2));
                if (eps * t2 * t2 > 1) {
                  for (j2 = i2; j2 <= n2; j2++) {
                    H2.set(j2, n2, H2.get(j2, n2) / t2);
                  }
                }
              }
            }
          } else if (q2 < 0) {
            l2 = n2 - 1;
            if (Math.abs(H2.get(n2, n2 - 1)) > Math.abs(H2.get(n2 - 1, n2))) {
              H2.set(n2 - 1, n2 - 1, q2 / H2.get(n2, n2 - 1));
              H2.set(n2 - 1, n2, -(H2.get(n2, n2) - p2) / H2.get(n2, n2 - 1));
            } else {
              cdivres = cdiv(0, -H2.get(n2 - 1, n2), H2.get(n2 - 1, n2 - 1) - p2, q2);
              H2.set(n2 - 1, n2 - 1, cdivres[0]);
              H2.set(n2 - 1, n2, cdivres[1]);
            }
            H2.set(n2, n2 - 1, 0);
            H2.set(n2, n2, 1);
            for (i2 = n2 - 2; i2 >= 0; i2--) {
              ra2 = 0;
              sa2 = 0;
              for (j2 = l2; j2 <= n2; j2++) {
                ra2 = ra2 + H2.get(i2, j2) * H2.get(j2, n2 - 1);
                sa2 = sa2 + H2.get(i2, j2) * H2.get(j2, n2);
              }
              w2 = H2.get(i2, i2) - p2;
              if (e2[i2] < 0) {
                z2 = w2;
                r2 = ra2;
                s2 = sa2;
              } else {
                l2 = i2;
                if (e2[i2] === 0) {
                  cdivres = cdiv(-ra2, -sa2, w2, q2);
                  H2.set(i2, n2 - 1, cdivres[0]);
                  H2.set(i2, n2, cdivres[1]);
                } else {
                  x2 = H2.get(i2, i2 + 1);
                  y2 = H2.get(i2 + 1, i2);
                  vr2 = (d2[i2] - p2) * (d2[i2] - p2) + e2[i2] * e2[i2] - q2 * q2;
                  vi2 = (d2[i2] - p2) * 2 * q2;
                  if (vr2 === 0 && vi2 === 0) {
                    vr2 = eps * norm * (Math.abs(w2) + Math.abs(q2) + Math.abs(x2) + Math.abs(y2) + Math.abs(z2));
                  }
                  cdivres = cdiv(
                    x2 * r2 - z2 * ra2 + q2 * sa2,
                    x2 * s2 - z2 * sa2 - q2 * ra2,
                    vr2,
                    vi2
                  );
                  H2.set(i2, n2 - 1, cdivres[0]);
                  H2.set(i2, n2, cdivres[1]);
                  if (Math.abs(x2) > Math.abs(z2) + Math.abs(q2)) {
                    H2.set(
                      i2 + 1,
                      n2 - 1,
                      (-ra2 - w2 * H2.get(i2, n2 - 1) + q2 * H2.get(i2, n2)) / x2
                    );
                    H2.set(
                      i2 + 1,
                      n2,
                      (-sa2 - w2 * H2.get(i2, n2) - q2 * H2.get(i2, n2 - 1)) / x2
                    );
                  } else {
                    cdivres = cdiv(
                      -r2 - y2 * H2.get(i2, n2 - 1),
                      -s2 - y2 * H2.get(i2, n2),
                      z2,
                      q2
                    );
                    H2.set(i2 + 1, n2 - 1, cdivres[0]);
                    H2.set(i2 + 1, n2, cdivres[1]);
                  }
                }
                t2 = Math.max(Math.abs(H2.get(i2, n2 - 1)), Math.abs(H2.get(i2, n2)));
                if (eps * t2 * t2 > 1) {
                  for (j2 = i2; j2 <= n2; j2++) {
                    H2.set(j2, n2 - 1, H2.get(j2, n2 - 1) / t2);
                    H2.set(j2, n2, H2.get(j2, n2) / t2);
                  }
                }
              }
            }
          }
        }
        for (i2 = 0; i2 < nn2; i2++) {
          if (i2 < low || i2 > high) {
            for (j2 = i2; j2 < nn2; j2++) {
              V2.set(i2, j2, H2.get(i2, j2));
            }
          }
        }
        for (j2 = nn2 - 1; j2 >= low; j2--) {
          for (i2 = low; i2 <= high; i2++) {
            z2 = 0;
            for (k2 = low; k2 <= Math.min(j2, high); k2++) {
              z2 = z2 + V2.get(i2, k2) * H2.get(k2, j2);
            }
            V2.set(i2, j2, z2);
          }
        }
      }
      function cdiv(xr2, xi2, yr2, yi2) {
        let r2, d2;
        if (Math.abs(yr2) > Math.abs(yi2)) {
          r2 = yi2 / yr2;
          d2 = yr2 + r2 * yi2;
          return [(xr2 + r2 * xi2) / d2, (xi2 - r2 * xr2) / d2];
        } else {
          r2 = yr2 / yi2;
          d2 = yi2 + r2 * yr2;
          return [(r2 * xr2 + xi2) / d2, (r2 * xi2 - xr2) / d2];
        }
      }
      var CholeskyDecomposition3 = class {
        constructor(value) {
          value = WrapperMatrix2D2.checkMatrix(value);
          if (!value.isSymmetric()) {
            throw new Error("Matrix is not symmetric");
          }
          let a2 = value;
          let dimension = a2.rows;
          let l2 = new Matrix3(dimension, dimension);
          let positiveDefinite = true;
          let i2, j2, k2;
          for (j2 = 0; j2 < dimension; j2++) {
            let d2 = 0;
            for (k2 = 0; k2 < j2; k2++) {
              let s2 = 0;
              for (i2 = 0; i2 < k2; i2++) {
                s2 += l2.get(k2, i2) * l2.get(j2, i2);
              }
              s2 = (a2.get(j2, k2) - s2) / l2.get(k2, k2);
              l2.set(j2, k2, s2);
              d2 = d2 + s2 * s2;
            }
            d2 = a2.get(j2, j2) - d2;
            positiveDefinite &&= d2 > 0;
            l2.set(j2, j2, Math.sqrt(Math.max(d2, 0)));
            for (k2 = j2 + 1; k2 < dimension; k2++) {
              l2.set(j2, k2, 0);
            }
          }
          this.L = l2;
          this.positiveDefinite = positiveDefinite;
        }
        isPositiveDefinite() {
          return this.positiveDefinite;
        }
        solve(value) {
          value = WrapperMatrix2D2.checkMatrix(value);
          let l2 = this.L;
          let dimension = l2.rows;
          if (value.rows !== dimension) {
            throw new Error("Matrix dimensions do not match");
          }
          if (this.isPositiveDefinite() === false) {
            throw new Error("Matrix is not positive definite");
          }
          let count = value.columns;
          let B2 = value.clone();
          let i2, j2, k2;
          for (k2 = 0; k2 < dimension; k2++) {
            for (j2 = 0; j2 < count; j2++) {
              for (i2 = 0; i2 < k2; i2++) {
                B2.set(k2, j2, B2.get(k2, j2) - B2.get(i2, j2) * l2.get(k2, i2));
              }
              B2.set(k2, j2, B2.get(k2, j2) / l2.get(k2, k2));
            }
          }
          for (k2 = dimension - 1; k2 >= 0; k2--) {
            for (j2 = 0; j2 < count; j2++) {
              for (i2 = k2 + 1; i2 < dimension; i2++) {
                B2.set(k2, j2, B2.get(k2, j2) - B2.get(i2, j2) * l2.get(i2, k2));
              }
              B2.set(k2, j2, B2.get(k2, j2) / l2.get(k2, k2));
            }
          }
          return B2;
        }
        get lowerTriangularMatrix() {
          return this.L;
        }
      };
      var nipals = class {
        constructor(X2, options = {}) {
          X2 = WrapperMatrix2D2.checkMatrix(X2);
          let { Y: Y2 } = options;
          const {
            scaleScores = false,
            maxIterations = 1e3,
            terminationCriteria = 1e-10
          } = options;
          let u2;
          if (Y2) {
            if (isAnyArray(Y2) && typeof Y2[0] === "number") {
              Y2 = Matrix3.columnVector(Y2);
            } else {
              Y2 = WrapperMatrix2D2.checkMatrix(Y2);
            }
            if (Y2.rows !== X2.rows) {
              throw new Error("Y should have the same number of rows as X");
            }
            u2 = Y2.getColumnVector(0);
          } else {
            u2 = X2.getColumnVector(0);
          }
          let diff = 1;
          let t2, q2, w2, tOld;
          for (let counter = 0; counter < maxIterations && diff > terminationCriteria; counter++) {
            w2 = X2.transpose().mmul(u2).div(u2.transpose().mmul(u2).get(0, 0));
            w2 = w2.div(w2.norm());
            t2 = X2.mmul(w2).div(w2.transpose().mmul(w2).get(0, 0));
            if (counter > 0) {
              diff = t2.clone().sub(tOld).pow(2).sum();
            }
            tOld = t2.clone();
            if (Y2) {
              q2 = Y2.transpose().mmul(t2).div(t2.transpose().mmul(t2).get(0, 0));
              q2 = q2.div(q2.norm());
              u2 = Y2.mmul(q2).div(q2.transpose().mmul(q2).get(0, 0));
            } else {
              u2 = t2;
            }
          }
          if (Y2) {
            let p2 = X2.transpose().mmul(t2).div(t2.transpose().mmul(t2).get(0, 0));
            p2 = p2.div(p2.norm());
            let xResidual = X2.clone().sub(t2.clone().mmul(p2.transpose()));
            let residual = u2.transpose().mmul(t2).div(t2.transpose().mmul(t2).get(0, 0));
            let yResidual = Y2.clone().sub(
              t2.clone().mulS(residual.get(0, 0)).mmul(q2.transpose())
            );
            this.t = t2;
            this.p = p2.transpose();
            this.w = w2.transpose();
            this.q = q2;
            this.u = u2;
            this.s = t2.transpose().mmul(t2);
            this.xResidual = xResidual;
            this.yResidual = yResidual;
            this.betas = residual;
          } else {
            this.w = w2.transpose();
            this.s = t2.transpose().mmul(t2).sqrt();
            if (scaleScores) {
              this.t = t2.clone().div(this.s.get(0, 0));
            } else {
              this.t = t2;
            }
            this.xResidual = X2.sub(t2.mmul(w2.transpose()));
          }
        }
      };
      exports.AbstractMatrix = AbstractMatrix2;
      exports.CHO = CholeskyDecomposition3;
      exports.CholeskyDecomposition = CholeskyDecomposition3;
      exports.DistanceMatrix = DistanceMatrix2;
      exports.EVD = EigenvalueDecomposition2;
      exports.EigenvalueDecomposition = EigenvalueDecomposition2;
      exports.LU = LuDecomposition2;
      exports.LuDecomposition = LuDecomposition2;
      exports.Matrix = Matrix3;
      exports.MatrixColumnSelectionView = MatrixColumnSelectionView2;
      exports.MatrixColumnView = MatrixColumnView2;
      exports.MatrixFlipColumnView = MatrixFlipColumnView2;
      exports.MatrixFlipRowView = MatrixFlipRowView2;
      exports.MatrixRowSelectionView = MatrixRowSelectionView2;
      exports.MatrixRowView = MatrixRowView2;
      exports.MatrixSelectionView = MatrixSelectionView2;
      exports.MatrixSubView = MatrixSubView2;
      exports.MatrixTransposeView = MatrixTransposeView2;
      exports.NIPALS = nipals;
      exports.Nipals = nipals;
      exports.QR = QrDecomposition2;
      exports.QrDecomposition = QrDecomposition2;
      exports.SVD = SingularValueDecomposition2;
      exports.SingularValueDecomposition = SingularValueDecomposition2;
      exports.SymmetricMatrix = SymmetricMatrix2;
      exports.WrapperMatrix1D = WrapperMatrix1D2;
      exports.WrapperMatrix2D = WrapperMatrix2D2;
      exports.correlation = correlation2;
      exports.covariance = covariance2;
      exports.default = Matrix3;
      exports.determinant = determinant2;
      exports.inverse = inverse2;
      exports.linearDependencies = linearDependencies2;
      exports.pseudoInverse = pseudoInverse2;
      exports.solve = solve3;
      exports.wrap = wrap2;
    }
  });

  // tools/realeye-entry.js
  var realeye_entry_exports = {};
  __export(realeye_entry_exports, {
    RECOMMENDED_SAMPLES_PER_POINT: () => RECOMMENDED_SAMPLES_PER_POINT,
    TrackerState: () => TrackerState,
    WebcamETLight: () => WebcamETLight,
    extractAugmentedFeatures: () => extractAugmentedFeatures,
    extractCombinedFeatures: () => extractCombinedFeatures,
    getCalibrationPoints: () => getCalibrationPoints,
    getRecommendedPattern: () => getRecommendedPattern
  });

  // node_modules/@mediapipe/tasks-vision/vision_bundle.mjs
  var t = "undefined" != typeof self ? self : {};
  function e(e2, n2) {
    t: {
      for (var r2 = ["CLOSURE_FLAGS"], i2 = t, s2 = 0; s2 < r2.length; s2++) if (null == (i2 = i2[r2[s2]])) {
        r2 = null;
        break t;
      }
      r2 = i2;
    }
    return null != (e2 = r2 && r2[e2]) ? e2 : n2;
  }
  function n() {
    throw Error("Invalid UTF8");
  }
  function r(t2, e2) {
    return e2 = String.fromCharCode.apply(null, e2), null == t2 ? e2 : t2 + e2;
  }
  var i;
  var s;
  var o = "undefined" != typeof TextDecoder;
  var a;
  var c = "undefined" != typeof TextEncoder;
  function h(t2) {
    if (c) t2 = (a ||= new TextEncoder()).encode(t2);
    else {
      let n2 = 0;
      const r2 = new Uint8Array(3 * t2.length);
      for (let i2 = 0; i2 < t2.length; i2++) {
        var e2 = t2.charCodeAt(i2);
        if (e2 < 128) r2[n2++] = e2;
        else {
          if (e2 < 2048) r2[n2++] = e2 >> 6 | 192;
          else {
            if (e2 >= 55296 && e2 <= 57343) {
              if (e2 <= 56319 && i2 < t2.length) {
                const s2 = t2.charCodeAt(++i2);
                if (s2 >= 56320 && s2 <= 57343) {
                  e2 = 1024 * (e2 - 55296) + s2 - 56320 + 65536, r2[n2++] = e2 >> 18 | 240, r2[n2++] = e2 >> 12 & 63 | 128, r2[n2++] = e2 >> 6 & 63 | 128, r2[n2++] = 63 & e2 | 128;
                  continue;
                }
                i2--;
              }
              e2 = 65533;
            }
            r2[n2++] = e2 >> 12 | 224, r2[n2++] = e2 >> 6 & 63 | 128;
          }
          r2[n2++] = 63 & e2 | 128;
        }
      }
      t2 = n2 === r2.length ? r2 : r2.subarray(0, n2);
    }
    return t2;
  }
  function u(e2) {
    t.setTimeout((() => {
      throw e2;
    }), 0);
  }
  var l;
  var f = e(610401301, false);
  var d = e(748402147, true);
  function p() {
    var e2 = t.navigator;
    return e2 && (e2 = e2.userAgent) ? e2 : "";
  }
  var g = t.navigator;
  function m(t2) {
    return m[" "](t2), t2;
  }
  l = g && g.userAgentData || null, m[" "] = function() {
  };
  var y = {};
  var _ = null;
  function v(t2) {
    const e2 = t2.length;
    let n2 = 3 * e2 / 4;
    n2 % 3 ? n2 = Math.floor(n2) : -1 != "=.".indexOf(t2[e2 - 1]) && (n2 = -1 != "=.".indexOf(t2[e2 - 2]) ? n2 - 2 : n2 - 1);
    const r2 = new Uint8Array(n2);
    let i2 = 0;
    return (function(t3, e3) {
      function n3(e4) {
        for (; r3 < t3.length; ) {
          const e5 = t3.charAt(r3++), n4 = _[e5];
          if (null != n4) return n4;
          if (!/^[\s\xa0]*$/.test(e5)) throw Error("Unknown base64 encoding at char: " + e5);
        }
        return e4;
      }
      E();
      let r3 = 0;
      for (; ; ) {
        const t4 = n3(-1), r4 = n3(0), i3 = n3(64), s2 = n3(64);
        if (64 === s2 && -1 === t4) break;
        e3(t4 << 2 | r4 >> 4), 64 != i3 && (e3(r4 << 4 & 240 | i3 >> 2), 64 != s2 && e3(i3 << 6 & 192 | s2));
      }
    })(t2, (function(t3) {
      r2[i2++] = t3;
    })), i2 !== n2 ? r2.subarray(0, i2) : r2;
  }
  function E() {
    if (!_) {
      _ = {};
      var t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), e2 = ["+/=", "+/", "-_=", "-_.", "-_"];
      for (let n2 = 0; n2 < 5; n2++) {
        const r2 = t2.concat(e2[n2].split(""));
        y[n2] = r2;
        for (let t3 = 0; t3 < r2.length; t3++) {
          const e3 = r2[t3];
          void 0 === _[e3] && (_[e3] = t3);
        }
      }
    }
  }
  var w = "undefined" != typeof Uint8Array;
  var T = !(!(f && l && l.brands.length > 0) && (-1 != p().indexOf("Trident") || -1 != p().indexOf("MSIE"))) && "function" == typeof btoa;
  var A = /[-_.]/g;
  var b = { "-": "+", _: "/", ".": "=" };
  function k(t2) {
    return b[t2] || "";
  }
  function S(t2) {
    if (!T) return v(t2);
    t2 = A.test(t2) ? t2.replace(A, k) : t2, t2 = atob(t2);
    const e2 = new Uint8Array(t2.length);
    for (let n2 = 0; n2 < t2.length; n2++) e2[n2] = t2.charCodeAt(n2);
    return e2;
  }
  function x(t2) {
    return w && null != t2 && t2 instanceof Uint8Array;
  }
  var L = {};
  function R() {
    return M ||= new F(null, L);
  }
  function I(t2) {
    C(L);
    var e2 = t2.g;
    return null == (e2 = null == e2 || x(e2) ? e2 : "string" == typeof e2 ? S(e2) : null) ? e2 : t2.g = e2;
  }
  var F = class {
    h() {
      return new Uint8Array(I(this) || 0);
    }
    constructor(t2, e2) {
      if (C(e2), this.g = t2, null != t2 && 0 === t2.length) throw Error("ByteString should be constructed with non-empty values");
    }
  };
  var M;
  var P;
  function C(t2) {
    if (t2 !== L) throw Error("illegal external caller");
  }
  function O(t2, e2) {
    t2.__closure__error__context__984382 || (t2.__closure__error__context__984382 = {}), t2.__closure__error__context__984382.severity = e2;
  }
  function N(t2) {
    return O(t2 = Error(t2), "warning"), t2;
  }
  function U(t2, e2) {
    if (null != t2) {
      var n2 = P ??= {}, r2 = n2[t2] || 0;
      r2 >= e2 || (n2[t2] = r2 + 1, O(t2 = Error(), "incident"), u(t2));
    }
  }
  function D() {
    return "function" == typeof BigInt;
  }
  var B = "function" == typeof Symbol && "symbol" == typeof /* @__PURE__ */ Symbol();
  function G(t2, e2, n2 = false) {
    return "function" == typeof Symbol && "symbol" == typeof /* @__PURE__ */ Symbol() ? n2 && Symbol.for && t2 ? Symbol.for(t2) : null != t2 ? Symbol(t2) : /* @__PURE__ */ Symbol() : e2;
  }
  var j = G("jas", void 0, true);
  var V = G(void 0, "0di");
  var X = G(void 0, "1oa");
  var H = G(void 0, /* @__PURE__ */ Symbol());
  var W = G(void 0, "0ub");
  var z = G(void 0, "0ubs");
  var K = G(void 0, "0ubsb");
  var Y = G(void 0, "0actk");
  var q = G("m_m", "Pa", true);
  var $ = G();
  var J = { Ga: { value: 0, configurable: true, writable: true, enumerable: false } };
  var Z = Object.defineProperties;
  var Q = B ? j : "Ga";
  var tt;
  var et = [];
  function nt(t2, e2) {
    B || Q in t2 || Z(t2, J), t2[Q] |= e2;
  }
  function rt(t2, e2) {
    B || Q in t2 || Z(t2, J), t2[Q] = e2;
  }
  function it(t2) {
    return nt(t2, 34), t2;
  }
  function st(t2) {
    return nt(t2, 8192), t2;
  }
  rt(et, 7), tt = Object.freeze(et);
  var ot = {};
  function at(t2, e2) {
    return void 0 === e2 ? t2.h !== ct && !!(2 & (0 | t2.v[Q])) : !!(2 & e2) && t2.h !== ct;
  }
  var ct = {};
  function ht(t2, e2) {
    if (null != t2) {
      if ("string" == typeof t2) t2 = t2 ? new F(t2, L) : R();
      else if (t2.constructor !== F) if (x(t2)) t2 = t2.length ? new F(new Uint8Array(t2), L) : R();
      else {
        if (!e2) throw Error();
        t2 = void 0;
      }
    }
    return t2;
  }
  var ut = class {
    constructor(t2, e2, n2) {
      this.g = t2, this.h = e2, this.l = n2;
    }
    next() {
      const t2 = this.g.next();
      return t2.done || (t2.value = this.h.call(this.l, t2.value)), t2;
    }
    [Symbol.iterator]() {
      return this;
    }
  };
  var lt = Object.freeze({});
  function ft(t2, e2, n2) {
    const r2 = 128 & e2 ? 0 : -1, i2 = t2.length;
    var s2;
    (s2 = !!i2) && (s2 = null != (s2 = t2[i2 - 1]) && "object" == typeof s2 && s2.constructor === Object);
    const o2 = i2 + (s2 ? -1 : 0);
    for (e2 = 128 & e2 ? 1 : 0; e2 < o2; e2++) n2(e2 - r2, t2[e2]);
    if (s2) {
      t2 = t2[i2 - 1];
      for (const e3 in t2) !isNaN(e3) && n2(+e3, t2[e3]);
    }
  }
  var dt = {};
  function pt(t2) {
    return 128 & t2 ? dt : void 0;
  }
  function gt(t2) {
    return t2.Na = true, t2;
  }
  var mt = gt(((t2) => "number" == typeof t2));
  var yt = gt(((t2) => "string" == typeof t2));
  var _t = gt(((t2) => "boolean" == typeof t2));
  var vt = "function" == typeof t.BigInt && "bigint" == typeof t.BigInt(0);
  function Et(t2) {
    var e2 = t2;
    if (yt(e2)) {
      if (!/^\s*(?:-?[1-9]\d*|0)?\s*$/.test(e2)) throw Error(String(e2));
    } else if (mt(e2) && !Number.isSafeInteger(e2)) throw Error(String(e2));
    return vt ? BigInt(t2) : t2 = _t(t2) ? t2 ? "1" : "0" : yt(t2) ? t2.trim() || "0" : String(t2);
  }
  var wt = gt(((t2) => vt ? t2 >= At && t2 <= kt : "-" === t2[0] ? St(t2, Tt) : St(t2, bt)));
  var Tt = Number.MIN_SAFE_INTEGER.toString();
  var At = vt ? BigInt(Number.MIN_SAFE_INTEGER) : void 0;
  var bt = Number.MAX_SAFE_INTEGER.toString();
  var kt = vt ? BigInt(Number.MAX_SAFE_INTEGER) : void 0;
  function St(t2, e2) {
    if (t2.length > e2.length) return false;
    if (t2.length < e2.length || t2 === e2) return true;
    for (let n2 = 0; n2 < t2.length; n2++) {
      const r2 = t2[n2], i2 = e2[n2];
      if (r2 > i2) return false;
      if (r2 < i2) return true;
    }
  }
  var xt = "function" == typeof Uint8Array.prototype.slice;
  var Lt;
  var Rt = 0;
  var It = 0;
  function Ft(t2) {
    const e2 = t2 >>> 0;
    Rt = e2, It = (t2 - e2) / 4294967296 >>> 0;
  }
  function Mt(t2) {
    if (t2 < 0) {
      Ft(-t2);
      const [e2, n2] = jt(Rt, It);
      Rt = e2 >>> 0, It = n2 >>> 0;
    } else Ft(t2);
  }
  function Pt(t2) {
    const e2 = Lt ||= new DataView(new ArrayBuffer(8));
    e2.setFloat32(0, +t2, true), It = 0, Rt = e2.getUint32(0, true);
  }
  function Ct(t2, e2) {
    const n2 = 4294967296 * e2 + (t2 >>> 0);
    return Number.isSafeInteger(n2) ? n2 : Ut(t2, e2);
  }
  function Ot(t2, e2) {
    return Et(D() ? BigInt.asUintN(64, (BigInt(e2 >>> 0) << BigInt(32)) + BigInt(t2 >>> 0)) : Ut(t2, e2));
  }
  function Nt(t2, e2) {
    return D() ? Et(BigInt.asIntN(64, (BigInt.asUintN(32, BigInt(e2)) << BigInt(32)) + BigInt.asUintN(32, BigInt(t2)))) : Et(Bt(t2, e2));
  }
  function Ut(t2, e2) {
    if (t2 >>>= 0, (e2 >>>= 0) <= 2097151) var n2 = "" + (4294967296 * e2 + t2);
    else D() ? n2 = "" + (BigInt(e2) << BigInt(32) | BigInt(t2)) : (t2 = (16777215 & t2) + 6777216 * (n2 = 16777215 & (t2 >>> 24 | e2 << 8)) + 6710656 * (e2 = e2 >> 16 & 65535), n2 += 8147497 * e2, e2 *= 2, t2 >= 1e7 && (n2 += t2 / 1e7 >>> 0, t2 %= 1e7), n2 >= 1e7 && (e2 += n2 / 1e7 >>> 0, n2 %= 1e7), n2 = e2 + Dt(n2) + Dt(t2));
    return n2;
  }
  function Dt(t2) {
    return t2 = String(t2), "0000000".slice(t2.length) + t2;
  }
  function Bt(t2, e2) {
    if (2147483648 & e2) if (D()) t2 = "" + (BigInt(0 | e2) << BigInt(32) | BigInt(t2 >>> 0));
    else {
      const [n2, r2] = jt(t2, e2);
      t2 = "-" + Ut(n2, r2);
    }
    else t2 = Ut(t2, e2);
    return t2;
  }
  function Gt(t2) {
    if (t2.length < 16) Mt(Number(t2));
    else if (D()) t2 = BigInt(t2), Rt = Number(t2 & BigInt(4294967295)) >>> 0, It = Number(t2 >> BigInt(32) & BigInt(4294967295));
    else {
      const e2 = +("-" === t2[0]);
      It = Rt = 0;
      const n2 = t2.length;
      for (let r2 = e2, i2 = (n2 - e2) % 6 + e2; i2 <= n2; r2 = i2, i2 += 6) {
        const e3 = Number(t2.slice(r2, i2));
        It *= 1e6, Rt = 1e6 * Rt + e3, Rt >= 4294967296 && (It += Math.trunc(Rt / 4294967296), It >>>= 0, Rt >>>= 0);
      }
      if (e2) {
        const [t3, e3] = jt(Rt, It);
        Rt = t3, It = e3;
      }
    }
  }
  function jt(t2, e2) {
    return e2 = ~e2, t2 ? t2 = 1 + ~t2 : e2 += 1, [t2, e2];
  }
  function Vt(t2) {
    return Array.prototype.slice.call(t2);
  }
  var Xt = "function" == typeof BigInt ? BigInt.asIntN : void 0;
  var Ht = "function" == typeof BigInt ? BigInt.asUintN : void 0;
  var Wt = Number.isSafeInteger;
  var zt = Number.isFinite;
  var Kt = Math.trunc;
  var Yt = Et(0);
  function qt(t2) {
    if (null != t2 && "number" != typeof t2) throw Error(`Value of float/double field must be a number, found ${typeof t2}: ${t2}`);
    return t2;
  }
  function $t(t2) {
    return null == t2 || "number" == typeof t2 ? t2 : "NaN" === t2 || "Infinity" === t2 || "-Infinity" === t2 ? Number(t2) : void 0;
  }
  function Jt(t2) {
    if (null != t2 && "boolean" != typeof t2) {
      var e2 = typeof t2;
      throw Error(`Expected boolean but got ${"object" != e2 ? e2 : t2 ? Array.isArray(t2) ? "array" : e2 : "null"}: ${t2}`);
    }
    return t2;
  }
  function Zt(t2) {
    return null == t2 || "boolean" == typeof t2 ? t2 : "number" == typeof t2 ? !!t2 : void 0;
  }
  var Qt = /^-?([1-9][0-9]*|0)(\.[0-9]+)?$/;
  function te(t2) {
    switch (typeof t2) {
      case "bigint":
        return true;
      case "number":
        return zt(t2);
      case "string":
        return Qt.test(t2);
      default:
        return false;
    }
  }
  function ee(t2) {
    if (null == t2) return t2;
    if ("string" == typeof t2 && t2) t2 = +t2;
    else if ("number" != typeof t2) return;
    return zt(t2) ? 0 | t2 : void 0;
  }
  function ne(t2) {
    if (null == t2) return t2;
    if ("string" == typeof t2 && t2) t2 = +t2;
    else if ("number" != typeof t2) return;
    return zt(t2) ? t2 >>> 0 : void 0;
  }
  function re(t2) {
    const e2 = t2.length;
    return ("-" === t2[0] ? e2 < 20 || 20 === e2 && t2 <= "-9223372036854775808" : e2 < 19 || 19 === e2 && t2 <= "9223372036854775807") ? t2 : (Gt(t2), Bt(Rt, It));
  }
  function ie(t2) {
    if (t2 = Kt(t2), !Wt(t2)) {
      Mt(t2);
      var e2 = Rt, n2 = It;
      (t2 = 2147483648 & n2) && (n2 = ~n2 >>> 0, 0 == (e2 = 1 + ~e2 >>> 0) && (n2 = n2 + 1 >>> 0)), t2 = "number" == typeof (e2 = Ct(e2, n2)) ? t2 ? -e2 : e2 : t2 ? "-" + e2 : e2;
    }
    return t2;
  }
  function se(t2) {
    var e2 = Kt(Number(t2));
    return Wt(e2) ? String(e2) : (-1 !== (e2 = t2.indexOf(".")) && (t2 = t2.substring(0, e2)), re(t2));
  }
  function oe(t2) {
    var e2 = Kt(Number(t2));
    return Wt(e2) ? Et(e2) : (-1 !== (e2 = t2.indexOf(".")) && (t2 = t2.substring(0, e2)), D() ? Et(Xt(64, BigInt(t2))) : Et(re(t2)));
  }
  function ae(t2) {
    return Wt(t2) ? t2 = Et(ie(t2)) : (t2 = Kt(t2), Wt(t2) ? t2 = String(t2) : (Mt(t2), t2 = Bt(Rt, It)), t2 = Et(t2)), t2;
  }
  function ce(t2) {
    const e2 = typeof t2;
    return null == t2 ? t2 : "bigint" === e2 ? Et(Xt(64, t2)) : te(t2) ? "string" === e2 ? oe(t2) : ae(t2) : void 0;
  }
  function he(t2) {
    if ("string" != typeof t2) throw Error();
    return t2;
  }
  function ue(t2) {
    if (null != t2 && "string" != typeof t2) throw Error();
    return t2;
  }
  function le(t2) {
    return null == t2 || "string" == typeof t2 ? t2 : void 0;
  }
  function fe(t2, e2, n2, r2) {
    return null != t2 && t2[q] === ot ? t2 : Array.isArray(t2) ? ((r2 = (n2 = 0 | t2[Q]) | 32 & r2 | 2 & r2) !== n2 && rt(t2, r2), new e2(t2)) : (n2 ? 2 & r2 ? ((t2 = e2[V]) || (it((t2 = new e2()).v), t2 = e2[V] = t2), e2 = t2) : e2 = new e2() : e2 = void 0, e2);
  }
  function de(t2, e2, n2) {
    if (e2) t: {
      if (!te(e2 = t2)) throw N("int64");
      switch (typeof e2) {
        case "string":
          e2 = oe(e2);
          break t;
        case "bigint":
          e2 = Et(Xt(64, e2));
          break t;
        default:
          e2 = ae(e2);
      }
    }
    else e2 = ce(t2);
    return null == (t2 = e2) ? n2 ? Yt : void 0 : t2;
  }
  var pe = {};
  var ge = (function() {
    try {
      return m(new class extends Map {
        constructor() {
          super();
        }
      }()), false;
    } catch {
      return true;
    }
  })();
  var me = class {
    constructor() {
      this.g = /* @__PURE__ */ new Map();
    }
    get(t2) {
      return this.g.get(t2);
    }
    set(t2, e2) {
      return this.g.set(t2, e2), this.size = this.g.size, this;
    }
    delete(t2) {
      return t2 = this.g.delete(t2), this.size = this.g.size, t2;
    }
    clear() {
      this.g.clear(), this.size = this.g.size;
    }
    has(t2) {
      return this.g.has(t2);
    }
    entries() {
      return this.g.entries();
    }
    keys() {
      return this.g.keys();
    }
    values() {
      return this.g.values();
    }
    forEach(t2, e2) {
      return this.g.forEach(t2, e2);
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  };
  var ye = ge ? (Object.setPrototypeOf(me.prototype, Map.prototype), Object.defineProperties(me.prototype, { size: { value: 0, configurable: true, enumerable: true, writable: true } }), me) : class extends Map {
    constructor() {
      super();
    }
  };
  function _e(t2) {
    return t2;
  }
  function ve(t2) {
    if (2 & t2.J) throw Error("Cannot mutate an immutable Map");
  }
  var Ee = class extends ye {
    constructor(t2, e2, n2 = _e, r2 = _e) {
      super(), this.J = 0 | t2[Q], this.K = e2, this.S = n2, this.fa = this.K ? we : r2;
      for (let i2 = 0; i2 < t2.length; i2++) {
        const s2 = t2[i2], o2 = n2(s2[0], false, true);
        let a2 = s2[1];
        e2 ? void 0 === a2 && (a2 = null) : a2 = r2(s2[1], false, true, void 0, void 0, this.J), super.set(o2, a2);
      }
    }
    V(t2) {
      return st(Array.from(super.entries(), t2));
    }
    clear() {
      ve(this), super.clear();
    }
    delete(t2) {
      return ve(this), super.delete(this.S(t2, true, false));
    }
    entries() {
      if (this.K) {
        var t2 = super.keys();
        t2 = new ut(t2, Te, this);
      } else t2 = super.entries();
      return t2;
    }
    values() {
      if (this.K) {
        var t2 = super.keys();
        t2 = new ut(t2, Ee.prototype.get, this);
      } else t2 = super.values();
      return t2;
    }
    forEach(t2, e2) {
      this.K ? super.forEach(((n2, r2, i2) => {
        t2.call(e2, i2.get(r2), r2, i2);
      })) : super.forEach(t2, e2);
    }
    set(t2, e2) {
      return ve(this), null == (t2 = this.S(t2, true, false)) ? this : null == e2 ? (super.delete(t2), this) : super.set(t2, this.fa(e2, true, true, this.K, false, this.J));
    }
    Ma(t2) {
      const e2 = this.S(t2[0], false, true);
      t2 = t2[1], t2 = this.K ? void 0 === t2 ? null : t2 : this.fa(t2, false, true, void 0, false, this.J), super.set(e2, t2);
    }
    has(t2) {
      return super.has(this.S(t2, false, false));
    }
    get(t2) {
      t2 = this.S(t2, false, false);
      const e2 = super.get(t2);
      if (void 0 !== e2) {
        var n2 = this.K;
        return n2 ? ((n2 = this.fa(e2, false, true, n2, this.ra, this.J)) !== e2 && super.set(t2, n2), n2) : e2;
      }
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  };
  function we(t2, e2, n2, r2, i2, s2) {
    return t2 = fe(t2, r2, n2, s2), i2 && (t2 = Xe(t2)), t2;
  }
  function Te(t2) {
    return [t2, this.get(t2)];
  }
  var Ae;
  function be() {
    return Ae ||= new Ee(it([]), void 0, void 0, void 0, pe);
  }
  function ke(t2) {
    return H ? t2[H] : void 0;
  }
  function Se(t2, e2) {
    for (const n2 in t2) !isNaN(n2) && e2(t2, +n2, t2[n2]);
  }
  Ee.prototype.toJSON = void 0;
  var xe = class {
  };
  var Le = { Ka: true };
  function Re(t2, e2) {
    e2 < 100 || U(z, 1);
  }
  function Ie(t2, e2, n2, r2) {
    const i2 = void 0 !== r2;
    r2 = !!r2;
    var s2, o2 = H;
    !i2 && B && o2 && (s2 = t2[o2]) && Se(s2, Re), o2 = [];
    var a2 = t2.length;
    let c2;
    s2 = 4294967295;
    let h2 = false;
    const u2 = !!(64 & e2), l2 = u2 ? 128 & e2 ? 0 : -1 : void 0;
    1 & e2 || (c2 = a2 && t2[a2 - 1], null != c2 && "object" == typeof c2 && c2.constructor === Object ? s2 = --a2 : c2 = void 0, !u2 || 128 & e2 || i2 || (h2 = true, s2 = s2 - l2 + l2)), e2 = void 0;
    for (var f2 = 0; f2 < a2; f2++) {
      let i3 = t2[f2];
      if (null != i3 && null != (i3 = n2(i3, r2))) if (u2 && f2 >= s2) {
        const t3 = f2 - l2;
        (e2 ??= {})[t3] = i3;
      } else o2[f2] = i3;
    }
    if (c2) for (let t3 in c2) {
      if (null == (a2 = c2[t3]) || null == (a2 = n2(a2, r2))) continue;
      let i3;
      f2 = +t3, u2 && !Number.isNaN(f2) && (i3 = f2 + l2) < s2 ? o2[i3] = a2 : (e2 ??= {})[t3] = a2;
    }
    return e2 && (h2 ? o2.push(e2) : o2[s2] = e2), i2 && H && (t2 = ke(t2)) && t2 instanceof xe && (o2[H] = (function(t3) {
      const e3 = new xe();
      return Se(t3, ((t4, n3, r3) => {
        e3[n3] = Vt(r3);
      })), e3.da = t3.da, e3;
    })(t2)), o2;
  }
  function Fe(t2) {
    return t2[0] = Me(t2[0]), t2[1] = Me(t2[1]), t2;
  }
  function Me(t2) {
    switch (typeof t2) {
      case "number":
        return Number.isFinite(t2) ? t2 : "" + t2;
      case "bigint":
        return wt(t2) ? Number(t2) : "" + t2;
      case "boolean":
        return t2 ? 1 : 0;
      case "object":
        if (Array.isArray(t2)) {
          var e2 = 0 | t2[Q];
          return 0 === t2.length && 1 & e2 ? void 0 : Ie(t2, e2, Me);
        }
        if (null != t2 && t2[q] === ot) return Oe(t2);
        if (t2 instanceof F) {
          if (null == (e2 = t2.g)) t2 = "";
          else if ("string" == typeof e2) t2 = e2;
          else {
            if (T) {
              for (var n2 = "", r2 = 0, i2 = e2.length - 10240; r2 < i2; ) n2 += String.fromCharCode.apply(null, e2.subarray(r2, r2 += 10240));
              n2 += String.fromCharCode.apply(null, r2 ? e2.subarray(r2) : e2), e2 = btoa(n2);
            } else {
              void 0 === n2 && (n2 = 0), E(), n2 = y[n2], r2 = Array(Math.floor(e2.length / 3)), i2 = n2[64] || "";
              let t3 = 0, h2 = 0;
              for (; t3 < e2.length - 2; t3 += 3) {
                var s2 = e2[t3], o2 = e2[t3 + 1], a2 = e2[t3 + 2], c2 = n2[s2 >> 2];
                s2 = n2[(3 & s2) << 4 | o2 >> 4], o2 = n2[(15 & o2) << 2 | a2 >> 6], a2 = n2[63 & a2], r2[h2++] = c2 + s2 + o2 + a2;
              }
              switch (c2 = 0, a2 = i2, e2.length - t3) {
                case 2:
                  a2 = n2[(15 & (c2 = e2[t3 + 1])) << 2] || i2;
                case 1:
                  e2 = e2[t3], r2[h2] = n2[e2 >> 2] + n2[(3 & e2) << 4 | c2 >> 4] + a2 + i2;
              }
              e2 = r2.join("");
            }
            t2 = t2.g = e2;
          }
          return t2;
        }
        return t2 instanceof Ee ? t2 = 0 !== t2.size ? t2.V(Fe) : void 0 : void 0;
    }
    return t2;
  }
  var Pe;
  var Ce;
  function Oe(t2) {
    return Ie(t2 = t2.v, 0 | t2[Q], Me);
  }
  function Ne(t2, e2) {
    return Ue(t2, e2[0], e2[1]);
  }
  function Ue(t2, e2, n2, r2 = 0) {
    if (null == t2) {
      var i2 = 32;
      n2 ? (t2 = [n2], i2 |= 128) : t2 = [], e2 && (i2 = -16760833 & i2 | (1023 & e2) << 14);
    } else {
      if (!Array.isArray(t2)) throw Error("narr");
      if (i2 = 0 | t2[Q], d && 1 & i2) throw Error("rfarr");
      if (2048 & i2 && !(2 & i2) && (function() {
        if (d) throw Error("carr");
        U(Y, 5);
      })(), 256 & i2) throw Error("farr");
      if (64 & i2) return (i2 | r2) !== i2 && rt(t2, i2 | r2), t2;
      if (n2 && (i2 |= 128, n2 !== t2[0])) throw Error("mid");
      t: {
        i2 |= 64;
        var s2 = (n2 = t2).length;
        if (s2) {
          var o2 = s2 - 1;
          const t3 = n2[o2];
          if (null != t3 && "object" == typeof t3 && t3.constructor === Object) {
            if ((o2 -= e2 = 128 & i2 ? 0 : -1) >= 1024) throw Error("pvtlmt");
            for (var a2 in t3) (s2 = +a2) < o2 && (n2[s2 + e2] = t3[a2], delete t3[a2]);
            i2 = -16760833 & i2 | (1023 & o2) << 14;
            break t;
          }
        }
        if (e2) {
          if ((a2 = Math.max(e2, s2 - (128 & i2 ? 0 : -1))) > 1024) throw Error("spvt");
          i2 = -16760833 & i2 | (1023 & a2) << 14;
        }
      }
    }
    return rt(t2, 64 | i2 | r2), t2;
  }
  function De(t2, e2) {
    if ("object" != typeof t2) return t2;
    if (Array.isArray(t2)) {
      var n2 = 0 | t2[Q];
      return 0 === t2.length && 1 & n2 ? void 0 : Be(t2, n2, e2);
    }
    if (null != t2 && t2[q] === ot) return je(t2);
    if (t2 instanceof Ee) {
      if (2 & (e2 = t2.J)) return t2;
      if (!t2.size) return;
      if (n2 = it(t2.V()), t2.K) for (t2 = 0; t2 < n2.length; t2++) {
        const r2 = n2[t2];
        let i2 = r2[1];
        i2 = null == i2 || "object" != typeof i2 ? void 0 : null != i2 && i2[q] === ot ? je(i2) : Array.isArray(i2) ? Be(i2, 0 | i2[Q], !!(32 & e2)) : void 0, r2[1] = i2;
      }
      return n2;
    }
    return t2 instanceof F ? t2 : void 0;
  }
  function Be(t2, e2, n2) {
    return 2 & e2 || (!n2 || 4096 & e2 || 16 & e2 ? t2 = Ve(t2, e2, false, n2 && !(16 & e2)) : (nt(t2, 34), 4 & e2 && Object.freeze(t2))), t2;
  }
  function Ge(t2, e2, n2) {
    return t2 = new t2.constructor(e2), n2 && (t2.h = ct), t2.m = ct, t2;
  }
  function je(t2) {
    const e2 = t2.v, n2 = 0 | e2[Q];
    return at(t2, n2) ? t2 : Ke(t2, e2, n2) ? Ge(t2, e2) : Ve(e2, n2);
  }
  function Ve(t2, e2, n2, r2) {
    return r2 ??= !!(34 & e2), t2 = Ie(t2, e2, De, r2), r2 = 32, n2 && (r2 |= 2), rt(t2, e2 = 16769217 & e2 | r2), t2;
  }
  function Xe(t2) {
    const e2 = t2.v, n2 = 0 | e2[Q];
    return at(t2, n2) ? Ke(t2, e2, n2) ? Ge(t2, e2, true) : new t2.constructor(Ve(e2, n2, false)) : t2;
  }
  function He(t2) {
    if (t2.h !== ct) return false;
    var e2 = t2.v;
    return nt(e2 = Ve(e2, 0 | e2[Q]), 2048), t2.v = e2, t2.h = void 0, t2.m = void 0, true;
  }
  function We(t2) {
    if (!He(t2) && at(t2, 0 | t2.v[Q])) throw Error();
  }
  function ze(t2, e2) {
    void 0 === e2 && (e2 = 0 | t2[Q]), 32 & e2 && !(4096 & e2) && rt(t2, 4096 | e2);
  }
  function Ke(t2, e2, n2) {
    return !!(2 & n2) || !(!(32 & n2) || 4096 & n2) && (rt(e2, 2 | n2), t2.h = ct, true);
  }
  var Ye = Et(0);
  var qe = {};
  function $e(t2, e2, n2, r2, i2) {
    if (null !== (e2 = Je(t2.v, e2, n2, i2)) || r2 && t2.m !== ct) return e2;
  }
  function Je(t2, e2, n2, r2) {
    if (-1 === e2) return null;
    const i2 = e2 + (n2 ? 0 : -1), s2 = t2.length - 1;
    let o2, a2;
    if (!(s2 < 1 + (n2 ? 0 : -1))) {
      if (i2 >= s2) if (o2 = t2[s2], null != o2 && "object" == typeof o2 && o2.constructor === Object) n2 = o2[e2], a2 = true;
      else {
        if (i2 !== s2) return;
        n2 = o2;
      }
      else n2 = t2[i2];
      if (r2 && null != n2) {
        if (null == (r2 = r2(n2))) return r2;
        if (!Object.is(r2, n2)) return a2 ? o2[e2] = r2 : t2[i2] = r2, r2;
      }
      return n2;
    }
  }
  function Ze(t2, e2, n2, r2) {
    We(t2), Qe(t2 = t2.v, 0 | t2[Q], e2, n2, r2);
  }
  function Qe(t2, e2, n2, r2, i2) {
    const s2 = n2 + (i2 ? 0 : -1);
    var o2 = t2.length - 1;
    if (o2 >= 1 + (i2 ? 0 : -1) && s2 >= o2) {
      const i3 = t2[o2];
      if (null != i3 && "object" == typeof i3 && i3.constructor === Object) return i3[n2] = r2, e2;
    }
    return s2 <= o2 ? (t2[s2] = r2, e2) : (void 0 !== r2 && (n2 >= (o2 = (e2 ??= 0 | t2[Q]) >> 14 & 1023 || 536870912) ? null != r2 && (t2[o2 + (i2 ? 0 : -1)] = { [n2]: r2 }) : t2[s2] = r2), e2);
  }
  function tn() {
    return void 0 === lt ? 2 : 4;
  }
  function en(t2, e2, n2, r2, i2) {
    let s2 = t2.v, o2 = 0 | s2[Q];
    r2 = at(t2, o2) ? 1 : r2, i2 = !!i2 || 3 === r2, 2 === r2 && He(t2) && (s2 = t2.v, o2 = 0 | s2[Q]);
    let a2 = (t2 = rn(s2, e2)) === tt ? 7 : 0 | t2[Q], c2 = sn(a2, o2);
    var h2 = !(4 & c2);
    if (h2) {
      4 & c2 && (t2 = Vt(t2), a2 = 0, c2 = An(c2, o2), o2 = Qe(s2, o2, e2, t2));
      let r3 = 0, i3 = 0;
      for (; r3 < t2.length; r3++) {
        const e3 = n2(t2[r3]);
        null != e3 && (t2[i3++] = e3);
      }
      i3 < r3 && (t2.length = i3), n2 = -513 & (4 | c2), c2 = n2 &= -1025, c2 &= -4097;
    }
    return c2 !== a2 && (rt(t2, c2), 2 & c2 && Object.freeze(t2)), nn(t2, c2, s2, o2, e2, r2, h2, i2);
  }
  function nn(t2, e2, n2, r2, i2, s2, o2, a2) {
    let c2 = e2;
    return 1 === s2 || 4 === s2 && (2 & e2 || !(16 & e2) && 32 & r2) ? on(e2) || ((e2 |= !t2.length || o2 && !(4096 & e2) || 32 & r2 && !(4096 & e2 || 16 & e2) ? 2 : 256) !== c2 && rt(t2, e2), Object.freeze(t2)) : (2 === s2 && on(e2) && (t2 = Vt(t2), c2 = 0, e2 = An(e2, r2), r2 = Qe(n2, r2, i2, t2)), on(e2) || (a2 || (e2 |= 16), e2 !== c2 && rt(t2, e2))), 2 & e2 || !(4096 & e2 || 16 & e2) || ze(n2, r2), t2;
  }
  function rn(t2, e2, n2) {
    return t2 = Je(t2, e2, n2), Array.isArray(t2) ? t2 : tt;
  }
  function sn(t2, e2) {
    return 2 & e2 && (t2 |= 2), 1 | t2;
  }
  function on(t2) {
    return !!(2 & t2) && !!(4 & t2) || !!(256 & t2);
  }
  function an(t2) {
    return ht(t2, true);
  }
  function cn(t2) {
    t2 = Vt(t2);
    for (let e2 = 0; e2 < t2.length; e2++) {
      const n2 = t2[e2] = Vt(t2[e2]);
      Array.isArray(n2[1]) && (n2[1] = it(n2[1]));
    }
    return st(t2);
  }
  function hn(t2, e2, n2, r2) {
    We(t2), Qe(t2 = t2.v, 0 | t2[Q], e2, ("0" === r2 ? 0 === Number(n2) : n2 === r2) ? void 0 : n2);
  }
  function un(t2, e2, n2) {
    if (2 & e2) throw Error();
    const r2 = pt(e2);
    let i2 = rn(t2, n2, r2), s2 = i2 === tt ? 7 : 0 | i2[Q], o2 = sn(s2, e2);
    return (2 & o2 || on(o2) || 16 & o2) && (o2 === s2 || on(o2) || rt(i2, o2), i2 = Vt(i2), s2 = 0, o2 = An(o2, e2), Qe(t2, e2, n2, i2, r2)), o2 &= -13, o2 !== s2 && rt(i2, o2), i2;
  }
  function ln(t2, e2) {
    var n2 = Cs;
    return pn(fn(t2 = t2.v), t2, void 0, n2) === e2 ? e2 : -1;
  }
  function fn(t2) {
    if (B) return t2[X] ?? (t2[X] = /* @__PURE__ */ new Map());
    if (X in t2) return t2[X];
    const e2 = /* @__PURE__ */ new Map();
    return Object.defineProperty(t2, X, { value: e2 }), e2;
  }
  function dn(t2, e2, n2, r2, i2) {
    const s2 = fn(t2), o2 = pn(s2, t2, e2, n2, i2);
    return o2 !== r2 && (o2 && (e2 = Qe(t2, e2, o2, void 0, i2)), s2.set(n2, r2)), e2;
  }
  function pn(t2, e2, n2, r2, i2) {
    let s2 = t2.get(r2);
    if (null != s2) return s2;
    s2 = 0;
    for (let t3 = 0; t3 < r2.length; t3++) {
      const o2 = r2[t3];
      null != Je(e2, o2, i2) && (0 !== s2 && (n2 = Qe(e2, n2, s2, void 0, i2)), s2 = o2);
    }
    return t2.set(r2, s2), s2;
  }
  function gn(t2, e2, n2) {
    let r2 = 0 | t2[Q];
    const i2 = pt(r2), s2 = Je(t2, n2, i2);
    let o2;
    if (null != s2 && s2[q] === ot) {
      if (!at(s2)) return He(s2), s2.v;
      o2 = s2.v;
    } else Array.isArray(s2) && (o2 = s2);
    if (o2) {
      const t3 = 0 | o2[Q];
      2 & t3 && (o2 = Ve(o2, t3));
    }
    return o2 = Ne(o2, e2), o2 !== s2 && Qe(t2, r2, n2, o2, i2), o2;
  }
  function mn(t2, e2, n2, r2, i2) {
    let s2 = false;
    if (null != (r2 = Je(t2, r2, i2, ((t3) => {
      const r3 = fe(t3, n2, false, e2);
      return s2 = r3 !== t3 && null != r3, r3;
    })))) return s2 && !at(r2) && ze(t2, e2), r2;
  }
  function yn(t2, e2, n2, r2) {
    let i2 = t2.v, s2 = 0 | i2[Q];
    if (null == (e2 = mn(i2, s2, e2, n2, r2))) return e2;
    if (s2 = 0 | i2[Q], !at(t2, s2)) {
      const o2 = Xe(e2);
      o2 !== e2 && (He(t2) && (i2 = t2.v, s2 = 0 | i2[Q]), s2 = Qe(i2, s2, n2, e2 = o2, r2), ze(i2, s2));
    }
    return e2;
  }
  function _n(t2, e2, n2, r2, i2, s2, o2, a2) {
    var c2 = at(t2, n2);
    s2 = c2 ? 1 : s2, o2 = !!o2 || 3 === s2, c2 = a2 && !c2, (2 === s2 || c2) && He(t2) && (n2 = 0 | (e2 = t2.v)[Q]);
    var h2 = (t2 = rn(e2, i2)) === tt ? 7 : 0 | t2[Q], u2 = sn(h2, n2);
    if (a2 = !(4 & u2)) {
      var l2 = t2, f2 = n2;
      const e3 = !!(2 & u2);
      e3 && (f2 |= 2);
      let i3 = !e3, s3 = true, o3 = 0, a3 = 0;
      for (; o3 < l2.length; o3++) {
        const t3 = fe(l2[o3], r2, false, f2);
        if (t3 instanceof r2) {
          if (!e3) {
            const e4 = at(t3);
            i3 &&= !e4, s3 &&= e4;
          }
          l2[a3++] = t3;
        }
      }
      a3 < o3 && (l2.length = a3), u2 |= 4, u2 = s3 ? -4097 & u2 : 4096 | u2, u2 = i3 ? 8 | u2 : -9 & u2;
    }
    if (u2 !== h2 && (rt(t2, u2), 2 & u2 && Object.freeze(t2)), c2 && !(8 & u2 || !t2.length && (1 === s2 || 4 === s2 && (2 & u2 || !(16 & u2) && 32 & n2)))) {
      for (on(u2) && (t2 = Vt(t2), u2 = An(u2, n2), n2 = Qe(e2, n2, i2, t2)), r2 = t2, c2 = u2, h2 = 0; h2 < r2.length; h2++) (l2 = r2[h2]) !== (u2 = Xe(l2)) && (r2[h2] = u2);
      c2 |= 8, rt(t2, u2 = c2 = r2.length ? 4096 | c2 : -4097 & c2);
    }
    return nn(t2, u2, e2, n2, i2, s2, a2, o2);
  }
  function vn(t2, e2, n2) {
    const r2 = t2.v;
    return _n(t2, r2, 0 | r2[Q], e2, n2, tn(), false, true);
  }
  function En(t2) {
    return null == t2 && (t2 = void 0), t2;
  }
  function wn(t2, e2, n2, r2, i2) {
    return Ze(t2, n2, r2 = En(r2), i2), r2 && !at(r2) && ze(t2.v), t2;
  }
  function Tn(t2, e2, n2, r2) {
    t: {
      var i2 = r2 = En(r2);
      We(t2);
      const s2 = t2.v;
      let o2 = 0 | s2[Q];
      if (null == i2) {
        const t3 = fn(s2);
        if (pn(t3, s2, o2, n2) !== e2) break t;
        t3.set(n2, 0);
      } else o2 = dn(s2, o2, n2, e2);
      Qe(s2, o2, e2, i2);
    }
    r2 && !at(r2) && ze(t2.v);
  }
  function An(t2, e2) {
    return -273 & (2 & e2 ? 2 | t2 : -3 & t2);
  }
  function bn(t2, e2, n2, r2) {
    var i2 = r2;
    We(t2), t2 = _n(t2, r2 = t2.v, 0 | r2[Q], n2, e2, 2, true), i2 = null != i2 ? i2 : new n2(), t2.push(i2), e2 = n2 = t2 === tt ? 7 : 0 | t2[Q], (i2 = at(i2)) ? (n2 &= -9, 1 === t2.length && (n2 &= -4097)) : n2 |= 4096, n2 !== e2 && rt(t2, n2), i2 || ze(r2);
  }
  function kn(t2, e2, n2) {
    return ee($e(t2, e2, void 0, n2));
  }
  function Sn(t2, e2) {
    return $e(t2, e2, void 0, void 0, $t) ?? 0;
  }
  function xn(t2, e2, n2) {
    if (null != n2) {
      if ("number" != typeof n2) throw N("int32");
      if (!zt(n2)) throw N("int32");
      n2 |= 0;
    }
    Ze(t2, e2, n2);
  }
  function Ln(t2, e2, n2) {
    Ze(t2, e2, qt(n2));
  }
  function Rn(t2, e2, n2) {
    hn(t2, e2, ue(n2), "");
  }
  function In(t2, e2, n2) {
    {
      We(t2);
      const o2 = t2.v;
      let a2 = 0 | o2[Q];
      if (null == n2) Qe(o2, a2, e2);
      else {
        var r2 = t2 = n2 === tt ? 7 : 0 | n2[Q], i2 = on(t2), s2 = i2 || Object.isFrozen(n2);
        for (i2 || (t2 = 0), s2 || (n2 = Vt(n2), r2 = 0, t2 = An(t2, a2), s2 = false), t2 |= 5, t2 |= (4 & t2 ? 512 & t2 ? 512 : 1024 & t2 ? 1024 : 0 : void 0) ?? 1024, i2 = 0; i2 < n2.length; i2++) {
          const e3 = n2[i2], o3 = he(e3);
          Object.is(e3, o3) || (s2 && (n2 = Vt(n2), r2 = 0, t2 = An(t2, a2), s2 = false), n2[i2] = o3);
        }
        t2 !== r2 && (s2 && (n2 = Vt(n2), t2 = An(t2, a2)), rt(n2, t2)), Qe(o2, a2, e2, n2);
      }
    }
  }
  function Fn(t2, e2, n2) {
    We(t2), en(t2, e2, le, 2, true).push(he(n2));
  }
  var Mn = class {
    constructor(t2, e2, n2) {
      if (this.buffer = t2, n2 && !e2) throw Error();
      this.g = e2;
    }
  };
  function Pn(t2, e2) {
    if ("string" == typeof t2) return new Mn(S(t2), e2);
    if (Array.isArray(t2)) return new Mn(new Uint8Array(t2), e2);
    if (t2.constructor === Uint8Array) return new Mn(t2, false);
    if (t2.constructor === ArrayBuffer) return t2 = new Uint8Array(t2), new Mn(t2, false);
    if (t2.constructor === F) return e2 = I(t2) || new Uint8Array(0), new Mn(e2, true, t2);
    if (t2 instanceof Uint8Array) return t2 = t2.constructor === Uint8Array ? t2 : new Uint8Array(t2.buffer, t2.byteOffset, t2.byteLength), new Mn(t2, false);
    throw Error();
  }
  function Cn(t2, e2) {
    let n2, r2 = 0, i2 = 0, s2 = 0;
    const o2 = t2.h;
    let a2 = t2.g;
    do {
      n2 = o2[a2++], r2 |= (127 & n2) << s2, s2 += 7;
    } while (s2 < 32 && 128 & n2);
    if (s2 > 32) for (i2 |= (127 & n2) >> 4, s2 = 3; s2 < 32 && 128 & n2; s2 += 7) n2 = o2[a2++], i2 |= (127 & n2) << s2;
    if (Gn(t2, a2), !(128 & n2)) return e2(r2 >>> 0, i2 >>> 0);
    throw Error();
  }
  function On(t2) {
    let e2 = 0, n2 = t2.g;
    const r2 = n2 + 10, i2 = t2.h;
    for (; n2 < r2; ) {
      const r3 = i2[n2++];
      if (e2 |= r3, 0 == (128 & r3)) return Gn(t2, n2), !!(127 & e2);
    }
    throw Error();
  }
  function Nn(t2) {
    const e2 = t2.h;
    let n2 = t2.g, r2 = e2[n2++], i2 = 127 & r2;
    if (128 & r2 && (r2 = e2[n2++], i2 |= (127 & r2) << 7, 128 & r2 && (r2 = e2[n2++], i2 |= (127 & r2) << 14, 128 & r2 && (r2 = e2[n2++], i2 |= (127 & r2) << 21, 128 & r2 && (r2 = e2[n2++], i2 |= r2 << 28, 128 & r2 && 128 & e2[n2++] && 128 & e2[n2++] && 128 & e2[n2++] && 128 & e2[n2++] && 128 & e2[n2++]))))) throw Error();
    return Gn(t2, n2), i2;
  }
  function Un(t2) {
    return Nn(t2) >>> 0;
  }
  function Dn(t2) {
    var e2 = t2.h;
    const n2 = t2.g;
    var r2 = e2[n2], i2 = e2[n2 + 1];
    const s2 = e2[n2 + 2];
    return e2 = e2[n2 + 3], Gn(t2, t2.g + 4), t2 = 2 * ((i2 = (r2 << 0 | i2 << 8 | s2 << 16 | e2 << 24) >>> 0) >> 31) + 1, r2 = i2 >>> 23 & 255, i2 &= 8388607, 255 == r2 ? i2 ? NaN : t2 * (1 / 0) : 0 == r2 ? 1401298464324817e-60 * t2 * i2 : t2 * Math.pow(2, r2 - 150) * (i2 + 8388608);
  }
  function Bn(t2) {
    return Nn(t2);
  }
  function Gn(t2, e2) {
    if (t2.g = e2, e2 > t2.l) throw Error();
  }
  function jn(t2, e2) {
    if (e2 < 0) throw Error();
    const n2 = t2.g;
    if ((e2 = n2 + e2) > t2.l) throw Error();
    return t2.g = e2, n2;
  }
  function Vn(t2, e2) {
    if (0 == e2) return R();
    var n2 = jn(t2, e2);
    return t2.Y && t2.j ? n2 = t2.h.subarray(n2, n2 + e2) : (t2 = t2.h, n2 = n2 === (e2 = n2 + e2) ? new Uint8Array(0) : xt ? t2.slice(n2, e2) : new Uint8Array(t2.subarray(n2, e2))), 0 == n2.length ? R() : new F(n2, L);
  }
  var Xn = [];
  function Hn(t2, e2, n2, r2) {
    if (Qn.length) {
      const i2 = Qn.pop();
      return i2.o(r2), i2.g.init(t2, e2, n2, r2), i2;
    }
    return new Zn(t2, e2, n2, r2);
  }
  function Wn(t2) {
    t2.g.clear(), t2.l = -1, t2.h = -1, Qn.length < 100 && Qn.push(t2);
  }
  function zn(t2) {
    var e2 = t2.g;
    if (e2.g == e2.l) return false;
    t2.m = t2.g.g;
    var n2 = Un(t2.g);
    if (e2 = n2 >>> 3, !((n2 &= 7) >= 0 && n2 <= 5)) throw Error();
    if (e2 < 1) throw Error();
    return t2.l = e2, t2.h = n2, true;
  }
  function Kn(t2) {
    switch (t2.h) {
      case 0:
        0 != t2.h ? Kn(t2) : On(t2.g);
        break;
      case 1:
        Gn(t2 = t2.g, t2.g + 8);
        break;
      case 2:
        if (2 != t2.h) Kn(t2);
        else {
          var e2 = Un(t2.g);
          Gn(t2 = t2.g, t2.g + e2);
        }
        break;
      case 5:
        Gn(t2 = t2.g, t2.g + 4);
        break;
      case 3:
        for (e2 = t2.l; ; ) {
          if (!zn(t2)) throw Error();
          if (4 == t2.h) {
            if (t2.l != e2) throw Error();
            break;
          }
          Kn(t2);
        }
        break;
      default:
        throw Error();
    }
  }
  function Yn(t2, e2, n2) {
    const r2 = t2.g.l;
    var i2 = Un(t2.g);
    let s2 = (i2 = t2.g.g + i2) - r2;
    if (s2 <= 0 && (t2.g.l = i2, n2(e2, t2, void 0, void 0, void 0), s2 = i2 - t2.g.g), s2) throw Error();
    return t2.g.g = i2, t2.g.l = r2, e2;
  }
  function qn(t2) {
    var e2 = Un(t2.g), a2 = jn(t2 = t2.g, e2);
    if (t2 = t2.h, o) {
      var c2, h2 = t2;
      (c2 = s) || (c2 = s = new TextDecoder("utf-8", { fatal: true })), e2 = a2 + e2, h2 = 0 === a2 && e2 === h2.length ? h2 : h2.subarray(a2, e2);
      try {
        var u2 = c2.decode(h2);
      } catch (t3) {
        if (void 0 === i) {
          try {
            c2.decode(new Uint8Array([128]));
          } catch (t4) {
          }
          try {
            c2.decode(new Uint8Array([97])), i = true;
          } catch (t4) {
            i = false;
          }
        }
        throw !i && (s = void 0), t3;
      }
    } else {
      e2 = (u2 = a2) + e2, a2 = [];
      let i2, s2 = null;
      for (; u2 < e2; ) {
        var l2 = t2[u2++];
        l2 < 128 ? a2.push(l2) : l2 < 224 ? u2 >= e2 ? n() : (i2 = t2[u2++], l2 < 194 || 128 != (192 & i2) ? (u2--, n()) : a2.push((31 & l2) << 6 | 63 & i2)) : l2 < 240 ? u2 >= e2 - 1 ? n() : (i2 = t2[u2++], 128 != (192 & i2) || 224 === l2 && i2 < 160 || 237 === l2 && i2 >= 160 || 128 != (192 & (c2 = t2[u2++])) ? (u2--, n()) : a2.push((15 & l2) << 12 | (63 & i2) << 6 | 63 & c2)) : l2 <= 244 ? u2 >= e2 - 2 ? n() : (i2 = t2[u2++], 128 != (192 & i2) || i2 - 144 + (l2 << 28) >> 30 != 0 || 128 != (192 & (c2 = t2[u2++])) || 128 != (192 & (h2 = t2[u2++])) ? (u2--, n()) : (l2 = (7 & l2) << 18 | (63 & i2) << 12 | (63 & c2) << 6 | 63 & h2, l2 -= 65536, a2.push(55296 + (l2 >> 10 & 1023), 56320 + (1023 & l2)))) : n(), a2.length >= 8192 && (s2 = r(s2, a2), a2.length = 0);
      }
      u2 = r(s2, a2);
    }
    return u2;
  }
  function $n(t2) {
    const e2 = Un(t2.g);
    return Vn(t2.g, e2);
  }
  function Jn(t2, e2, n2) {
    var r2 = Un(t2.g);
    for (r2 = t2.g.g + r2; t2.g.g < r2; ) n2.push(e2(t2.g));
  }
  var Zn = class {
    constructor(t2, e2, n2, r2) {
      if (Xn.length) {
        const i2 = Xn.pop();
        i2.init(t2, e2, n2, r2), t2 = i2;
      } else t2 = new class {
        constructor(t3, e3, n3, r3) {
          this.h = null, this.j = false, this.g = this.l = this.m = 0, this.init(t3, e3, n3, r3);
        }
        init(t3, e3, n3, { Y: r3 = false, ea: i2 = false } = {}) {
          this.Y = r3, this.ea = i2, t3 && (t3 = Pn(t3, this.ea), this.h = t3.buffer, this.j = t3.g, this.m = e3 || 0, this.l = void 0 !== n3 ? this.m + n3 : this.h.length, this.g = this.m);
        }
        clear() {
          this.h = null, this.j = false, this.g = this.l = this.m = 0, this.Y = false;
        }
      }(t2, e2, n2, r2);
      this.g = t2, this.m = this.g.g, this.h = this.l = -1, this.o(r2);
    }
    o({ ha: t2 = false } = {}) {
      this.ha = t2;
    }
  };
  var Qn = [];
  function tr(t2) {
    return t2 ? /^\d+$/.test(t2) ? (Gt(t2), new er(Rt, It)) : null : nr ||= new er(0, 0);
  }
  var er = class {
    constructor(t2, e2) {
      this.h = t2 >>> 0, this.g = e2 >>> 0;
    }
  };
  var nr;
  function rr(t2) {
    return t2 ? /^-?\d+$/.test(t2) ? (Gt(t2), new ir(Rt, It)) : null : sr ||= new ir(0, 0);
  }
  var ir = class {
    constructor(t2, e2) {
      this.h = t2 >>> 0, this.g = e2 >>> 0;
    }
  };
  var sr;
  function or(t2, e2, n2) {
    for (; n2 > 0 || e2 > 127; ) t2.g.push(127 & e2 | 128), e2 = (e2 >>> 7 | n2 << 25) >>> 0, n2 >>>= 7;
    t2.g.push(e2);
  }
  function ar(t2, e2) {
    for (; e2 > 127; ) t2.g.push(127 & e2 | 128), e2 >>>= 7;
    t2.g.push(e2);
  }
  function cr(t2, e2) {
    if (e2 >= 0) ar(t2, e2);
    else {
      for (let n2 = 0; n2 < 9; n2++) t2.g.push(127 & e2 | 128), e2 >>= 7;
      t2.g.push(1);
    }
  }
  function hr(t2) {
    var e2 = Rt;
    t2.g.push(e2 >>> 0 & 255), t2.g.push(e2 >>> 8 & 255), t2.g.push(e2 >>> 16 & 255), t2.g.push(e2 >>> 24 & 255);
  }
  function ur(t2, e2) {
    0 !== e2.length && (t2.l.push(e2), t2.h += e2.length);
  }
  function lr(t2, e2, n2) {
    ar(t2.g, 8 * e2 + n2);
  }
  function fr(t2, e2) {
    return lr(t2, e2, 2), e2 = t2.g.end(), ur(t2, e2), e2.push(t2.h), e2;
  }
  function dr(t2, e2) {
    var n2 = e2.pop();
    for (n2 = t2.h + t2.g.length() - n2; n2 > 127; ) e2.push(127 & n2 | 128), n2 >>>= 7, t2.h++;
    e2.push(n2), t2.h++;
  }
  function pr(t2, e2, n2) {
    lr(t2, e2, 2), ar(t2.g, n2.length), ur(t2, t2.g.end()), ur(t2, n2);
  }
  function gr(t2, e2, n2, r2) {
    null != n2 && (e2 = fr(t2, e2), r2(n2, t2), dr(t2, e2));
  }
  function mr() {
    const t2 = class {
      constructor() {
        throw Error();
      }
    };
    return Object.setPrototypeOf(t2, t2.prototype), t2;
  }
  var yr = mr();
  var _r = mr();
  var vr = mr();
  var Er = mr();
  var wr = mr();
  var Tr = mr();
  var Ar = mr();
  var br = mr();
  var kr = mr();
  var Sr = mr();
  function xr(t2, e2, n2) {
    var r2 = t2.v;
    H && H in r2 && (r2 = r2[H]) && delete r2[e2.g], e2.h ? e2.j(t2, e2.h, e2.g, n2, e2.l) : e2.j(t2, e2.g, n2, e2.l);
  }
  var Lr = class {
    constructor(t2, e2) {
      this.v = Ue(t2, e2, void 0, 2048);
    }
    toJSON() {
      return Oe(this);
    }
    j() {
      var t2 = xo, e2 = this.v, n2 = t2.g, r2 = H;
      if (B && r2 && null != e2[r2]?.[n2] && U(W, 3), e2 = t2.g, $ && H && void 0 === $ && (r2 = (n2 = this.v)[H]) && (r2 = r2.da)) try {
        r2(n2, e2, Le);
      } catch (t3) {
        u(t3);
      }
      return t2.h ? t2.m(this, t2.h, t2.g, t2.l) : t2.m(this, t2.g, t2.defaultValue, t2.l);
    }
    clone() {
      const t2 = this.v, e2 = 0 | t2[Q];
      return Ke(this, t2, e2) ? Ge(this, t2, true) : new this.constructor(Ve(t2, e2, false));
    }
  };
  Lr.prototype[q] = ot, Lr.prototype.toString = function() {
    return this.v.toString();
  };
  var Rr = class {
    constructor(t2, e2, n2) {
      this.g = t2, this.h = e2, t2 = yr, this.l = !!t2 && n2 === t2 || false;
    }
  };
  function Ir(t2, e2) {
    return new Rr(t2, e2, yr);
  }
  function Fr(t2, e2, n2, r2, i2) {
    gr(t2, n2, Xr(e2, r2), i2);
  }
  var Mr = Ir((function(t2, e2, n2, r2, i2) {
    return 2 === t2.h && (Yn(t2, gn(e2, r2, n2), i2), true);
  }), Fr);
  var Pr = Ir((function(t2, e2, n2, r2, i2) {
    return 2 === t2.h && (Yn(t2, gn(e2, r2, n2), i2), true);
  }), Fr);
  var Cr = /* @__PURE__ */ Symbol();
  var Or = /* @__PURE__ */ Symbol();
  var Nr = /* @__PURE__ */ Symbol();
  var Ur = /* @__PURE__ */ Symbol();
  var Dr = /* @__PURE__ */ Symbol();
  var Br;
  var Gr;
  function jr(t2, e2, n2, r2) {
    var i2 = r2[t2];
    if (i2) return i2;
    (i2 = {}).qa = r2, i2.T = (function(t3) {
      switch (typeof t3) {
        case "boolean":
          return Pe ||= [0, void 0, true];
        case "number":
          return t3 > 0 ? void 0 : 0 === t3 ? Ce ||= [0, void 0] : [-t3, void 0];
        case "string":
          return [0, t3];
        case "object":
          return t3;
      }
    })(r2[0]);
    var s2 = r2[1];
    let o2 = 1;
    s2 && s2.constructor === Object && (i2.ba = s2, "function" == typeof (s2 = r2[++o2]) && (i2.ma = true, Br ??= s2, Gr ??= r2[o2 + 1], s2 = r2[o2 += 2]));
    const a2 = {};
    for (; s2 && Array.isArray(s2) && s2.length && "number" == typeof s2[0] && s2[0] > 0; ) {
      for (var c2 = 0; c2 < s2.length; c2++) a2[s2[c2]] = s2;
      s2 = r2[++o2];
    }
    for (c2 = 1; void 0 !== s2; ) {
      let t3;
      "number" == typeof s2 && (c2 += s2, s2 = r2[++o2]);
      var h2 = void 0;
      if (s2 instanceof Rr ? t3 = s2 : (t3 = Mr, o2--), t3?.l) {
        s2 = r2[++o2], h2 = r2;
        var u2 = o2;
        "function" == typeof s2 && (s2 = s2(), h2[u2] = s2), h2 = s2;
      }
      for (u2 = c2 + 1, "number" == typeof (s2 = r2[++o2]) && s2 < 0 && (u2 -= s2, s2 = r2[++o2]); c2 < u2; c2++) {
        const r3 = a2[c2];
        h2 ? n2(i2, c2, t3, h2, r3) : e2(i2, c2, t3, r3);
      }
    }
    return r2[t2] = i2;
  }
  function Vr(t2) {
    return Array.isArray(t2) ? t2[0] instanceof Rr ? t2 : [Pr, t2] : [t2, void 0];
  }
  function Xr(t2, e2) {
    return t2 instanceof Lr ? t2.v : Array.isArray(t2) ? Ne(t2, e2) : void 0;
  }
  function Hr(t2, e2, n2, r2) {
    const i2 = n2.g;
    t2[e2] = r2 ? (t3, e3, n3) => i2(t3, e3, n3, r2) : i2;
  }
  function Wr(t2, e2, n2, r2, i2) {
    const s2 = n2.g;
    let o2, a2;
    t2[e2] = (t3, e3, n3) => s2(t3, e3, n3, a2 ||= jr(Or, Hr, Wr, r2).T, o2 ||= zr(r2), i2);
  }
  function zr(t2) {
    let e2 = t2[Nr];
    if (null != e2) return e2;
    const n2 = jr(Or, Hr, Wr, t2);
    return e2 = n2.ma ? (t3, e3) => Br(t3, e3, n2) : (t3, e3) => {
      for (; zn(e3) && 4 != e3.h; ) {
        var r2 = e3.l, i2 = n2[r2];
        if (null == i2) {
          var s2 = n2.ba;
          s2 && (s2 = s2[r2]) && (null != (s2 = Yr(s2)) && (i2 = n2[r2] = s2));
        }
        if (null == i2 || !i2(e3, t3, r2)) {
          if (i2 = (s2 = e3).m, Kn(s2), s2.ha) var o2 = void 0;
          else o2 = s2.g.g - i2, s2.g.g = i2, o2 = Vn(s2.g, o2);
          i2 = void 0, s2 = t3, o2 && ((i2 = s2[H] ?? (s2[H] = new xe()))[r2] ?? (i2[r2] = [])).push(o2);
        }
      }
      return (t3 = ke(t3)) && (t3.da = n2.qa[Dr]), true;
    }, t2[Nr] = e2, t2[Dr] = Kr.bind(t2), e2;
  }
  function Kr(t2, e2, n2, r2) {
    var i2 = this[Or];
    const s2 = this[Nr], o2 = Ne(void 0, i2.T), a2 = ke(t2);
    if (a2) {
      var c2 = false, h2 = i2.ba;
      if (h2) {
        if (i2 = (e3, n3, i3) => {
          if (0 !== i3.length) if (h2[n3]) for (const t3 of i3) {
            e3 = Hn(t3);
            try {
              c2 = true, s2(o2, e3);
            } finally {
              Wn(e3);
            }
          }
          else r2?.(t2, n3, i3);
        }, null == e2) Se(a2, i2);
        else if (null != a2) {
          const t3 = a2[e2];
          t3 && i2(a2, e2, t3);
        }
        if (c2) {
          let r3 = 0 | t2[Q];
          if (2 & r3 && 2048 & r3 && !n2?.Ka) throw Error();
          const i3 = pt(r3), s3 = (e3, s4) => {
            if (null != Je(t2, e3, i3)) {
              if (1 === n2?.Qa) return;
              throw Error();
            }
            null != s4 && (r3 = Qe(t2, r3, e3, s4, i3)), delete a2[e3];
          };
          null == e2 ? ft(o2, 0 | o2[Q], ((t3, e3) => {
            s3(t3, e3);
          })) : s3(e2, Je(o2, e2, i3));
        }
      }
    }
  }
  function Yr(t2) {
    const e2 = (t2 = Vr(t2))[0].g;
    if (t2 = t2[1]) {
      const n2 = zr(t2), r2 = jr(Or, Hr, Wr, t2).T;
      return (t3, i2, s2) => e2(t3, i2, s2, r2, n2);
    }
    return e2;
  }
  function qr(t2, e2, n2) {
    t2[e2] = n2.h;
  }
  function $r(t2, e2, n2, r2) {
    let i2, s2;
    const o2 = n2.h;
    t2[e2] = (t3, e3, n3) => o2(t3, e3, n3, s2 ||= jr(Cr, qr, $r, r2).T, i2 ||= Jr(r2));
  }
  function Jr(t2) {
    let e2 = t2[Ur];
    if (!e2) {
      const n2 = jr(Cr, qr, $r, t2);
      e2 = (t3, e3) => Zr(t3, e3, n2), t2[Ur] = e2;
    }
    return e2;
  }
  function Zr(t2, e2, n2) {
    ft(t2, 0 | t2[Q], ((t3, r2) => {
      if (null != r2) {
        var i2 = (function(t4, e3) {
          var n3 = t4[e3];
          if (n3) return n3;
          if ((n3 = t4.ba) && (n3 = n3[e3])) {
            var r3 = (n3 = Vr(n3))[0].h;
            if (n3 = n3[1]) {
              const e4 = Jr(n3), i3 = jr(Cr, qr, $r, n3).T;
              n3 = t4.ma ? Gr(i3, e4) : (t5, n4, s2) => r3(t5, n4, s2, i3, e4);
            } else n3 = r3;
            return t4[e3] = n3;
          }
        })(n2, t3);
        i2 ? i2(e2, r2, t3) : t3 < 500 || U(K, 3);
      }
    })), (t2 = ke(t2)) && Se(t2, ((t3, n3, r2) => {
      for (ur(e2, e2.g.end()), t3 = 0; t3 < r2.length; t3++) ur(e2, I(r2[t3]) || new Uint8Array(0));
    }));
  }
  var Qr = Et(0);
  function ti(t2, e2) {
    if (Array.isArray(e2)) {
      var n2 = 0 | e2[Q];
      if (4 & n2) return e2;
      for (var r2 = 0, i2 = 0; r2 < e2.length; r2++) {
        const n3 = t2(e2[r2]);
        null != n3 && (e2[i2++] = n3);
      }
      return i2 < r2 && (e2.length = i2), (t2 = -1537 & (5 | n2)) !== n2 && rt(e2, t2), 2 & t2 && Object.freeze(e2), e2;
    }
  }
  function ei(t2, e2, n2) {
    return new Rr(t2, e2, n2);
  }
  function ni(t2, e2, n2) {
    return new Rr(t2, e2, n2);
  }
  function ri(t2, e2, n2) {
    Qe(t2, 0 | t2[Q], e2, n2, pt(0 | t2[Q]));
  }
  var ii = Ir((function(t2, e2, n2, r2, i2) {
    if (2 !== t2.h) return false;
    if (t2 = Vt(t2 = Yn(t2, Ne([void 0, void 0], r2), i2)), i2 = pt(r2 = 0 | e2[Q]), 2 & r2) throw Error();
    let s2 = Je(e2, n2, i2);
    if (s2 instanceof Ee) 0 != (2 & s2.J) ? (s2 = s2.V(), s2.push(t2), Qe(e2, r2, n2, s2, i2)) : s2.Ma(t2);
    else if (Array.isArray(s2)) {
      var o2 = 0 | s2[Q];
      8192 & o2 || rt(s2, o2 |= 8192), 2 & o2 && (s2 = cn(s2), Qe(e2, r2, n2, s2, i2)), s2.push(t2);
    } else Qe(e2, r2, n2, st([t2]), i2);
    return true;
  }), (function(t2, e2, n2, r2, i2) {
    if (e2 instanceof Ee) e2.forEach(((e3, s2) => {
      gr(t2, n2, Ne([s2, e3], r2), i2);
    }));
    else if (Array.isArray(e2)) {
      for (let s2 = 0; s2 < e2.length; s2++) {
        const o2 = e2[s2];
        Array.isArray(o2) && gr(t2, n2, Ne(o2, r2), i2);
      }
      st(e2);
    }
  }));
  function si(t2, e2, n2) {
    null != (e2 = $t(e2)) && (lr(t2, n2, 5), t2 = t2.g, Pt(e2), hr(t2));
  }
  function oi(t2, e2, n2) {
    if (e2 = (function(t3) {
      if (null == t3) return t3;
      const e3 = typeof t3;
      if ("bigint" === e3) return String(Xt(64, t3));
      if (te(t3)) {
        if ("string" === e3) return se(t3);
        if ("number" === e3) return ie(t3);
      }
    })(e2), null != e2) {
      if ("string" == typeof e2) rr(e2);
      if (null != e2) switch (lr(t2, n2, 0), typeof e2) {
        case "number":
          t2 = t2.g, Mt(e2), or(t2, Rt, It);
          break;
        case "bigint":
          n2 = BigInt.asUintN(64, e2), n2 = new ir(Number(n2 & BigInt(4294967295)), Number(n2 >> BigInt(32))), or(t2.g, n2.h, n2.g);
          break;
        default:
          n2 = rr(e2), or(t2.g, n2.h, n2.g);
      }
    }
  }
  function ai(t2, e2, n2) {
    null != (e2 = ee(e2)) && null != e2 && (lr(t2, n2, 0), cr(t2.g, e2));
  }
  function ci(t2, e2, n2) {
    null != (e2 = Zt(e2)) && (lr(t2, n2, 0), t2.g.g.push(e2 ? 1 : 0));
  }
  function hi(t2, e2, n2) {
    null != (e2 = le(e2)) && pr(t2, n2, h(e2));
  }
  function ui(t2, e2, n2, r2, i2) {
    gr(t2, n2, Xr(e2, r2), i2);
  }
  function li(t2, e2, n2) {
    null != (e2 = null == e2 || "string" == typeof e2 || e2 instanceof F ? e2 : void 0) && pr(t2, n2, Pn(e2, true).buffer);
  }
  function fi(t2, e2, n2) {
    null != (e2 = ne(e2)) && null != e2 && (lr(t2, n2, 0), ar(t2.g, e2));
  }
  function di(t2, e2, n2) {
    return (5 === t2.h || 2 === t2.h) && (e2 = un(e2, 0 | e2[Q], n2), 2 == t2.h ? Jn(t2, Dn, e2) : e2.push(Dn(t2.g)), true);
  }
  var pi = ei((function(t2, e2, n2) {
    return 5 === t2.h && (ri(e2, n2, Dn(t2.g)), true);
  }), si, br);
  var gi = ni(di, (function(t2, e2, n2) {
    if (null != (e2 = ti($t, e2))) for (let o2 = 0; o2 < e2.length; o2++) {
      var r2 = t2, i2 = n2, s2 = e2[o2];
      null != s2 && (lr(r2, i2, 5), r2 = r2.g, Pt(s2), hr(r2));
    }
  }), br);
  var mi = ni(di, (function(t2, e2, n2) {
    if (null != (e2 = ti($t, e2)) && e2.length) {
      lr(t2, n2, 2), ar(t2.g, 4 * e2.length);
      for (let r2 = 0; r2 < e2.length; r2++) n2 = t2.g, Pt(e2[r2]), hr(n2);
    }
  }), br);
  var yi = ei((function(t2, e2, n2) {
    return 5 === t2.h && (ri(e2, n2, 0 === (t2 = Dn(t2.g)) ? void 0 : t2), true);
  }), si, br);
  var _i = ei((function(t2, e2, n2) {
    return 0 !== t2.h ? t2 = false : (ri(e2, n2, Cn(t2.g, Nt)), t2 = true), t2;
  }), oi, Tr);
  var vi = ei((function(t2, e2, n2) {
    return 0 !== t2.h ? e2 = false : (ri(e2, n2, (t2 = Cn(t2.g, Nt)) === Qr ? void 0 : t2), e2 = true), e2;
  }), oi, Tr);
  var Ei = ei((function(t2, e2, n2) {
    return 0 !== t2.h ? t2 = false : (ri(e2, n2, Cn(t2.g, Ot)), t2 = true), t2;
  }), (function(t2, e2, n2) {
    if (e2 = (function(t3) {
      if (null == t3) return t3;
      var e3 = typeof t3;
      if ("bigint" === e3) return String(Ht(64, t3));
      if (te(t3)) {
        if ("string" === e3) return e3 = Kt(Number(t3)), Wt(e3) && e3 >= 0 ? t3 = String(e3) : (-1 !== (e3 = t3.indexOf(".")) && (t3 = t3.substring(0, e3)), (e3 = "-" !== t3[0] && ((e3 = t3.length) < 20 || 20 === e3 && t3 <= "18446744073709551615")) || (Gt(t3), t3 = Ut(Rt, It))), t3;
        if ("number" === e3) return (t3 = Kt(t3)) >= 0 && Wt(t3) || (Mt(t3), t3 = Ct(Rt, It)), t3;
      }
    })(e2), null != e2) {
      if ("string" == typeof e2) tr(e2);
      if (null != e2) switch (lr(t2, n2, 0), typeof e2) {
        case "number":
          t2 = t2.g, Mt(e2), or(t2, Rt, It);
          break;
        case "bigint":
          n2 = BigInt.asUintN(64, e2), n2 = new er(Number(n2 & BigInt(4294967295)), Number(n2 >> BigInt(32))), or(t2.g, n2.h, n2.g);
          break;
        default:
          n2 = tr(e2), or(t2.g, n2.h, n2.g);
      }
    }
  }), Ar);
  var wi = ei((function(t2, e2, n2) {
    return 0 === t2.h && (ri(e2, n2, Nn(t2.g)), true);
  }), ai, Er);
  var Ti = ni((function(t2, e2, n2) {
    return (0 === t2.h || 2 === t2.h) && (e2 = un(e2, 0 | e2[Q], n2), 2 == t2.h ? Jn(t2, Nn, e2) : e2.push(Nn(t2.g)), true);
  }), (function(t2, e2, n2) {
    if (null != (e2 = ti(ee, e2)) && e2.length) {
      n2 = fr(t2, n2);
      for (let n3 = 0; n3 < e2.length; n3++) cr(t2.g, e2[n3]);
      dr(t2, n2);
    }
  }), Er);
  var Ai = ei((function(t2, e2, n2) {
    return 0 === t2.h && (ri(e2, n2, 0 === (t2 = Nn(t2.g)) ? void 0 : t2), true);
  }), ai, Er);
  var bi = ei((function(t2, e2, n2) {
    return 0 === t2.h && (ri(e2, n2, On(t2.g)), true);
  }), ci, _r);
  var ki = ei((function(t2, e2, n2) {
    return 0 === t2.h && (ri(e2, n2, false === (t2 = On(t2.g)) ? void 0 : t2), true);
  }), ci, _r);
  var Si = ni((function(t2, e2, n2) {
    return 2 === t2.h && (t2 = qn(t2), un(e2, 0 | e2[Q], n2).push(t2), true);
  }), (function(t2, e2, n2) {
    if (null != (e2 = ti(le, e2))) for (let o2 = 0; o2 < e2.length; o2++) {
      var r2 = t2, i2 = n2, s2 = e2[o2];
      null != s2 && pr(r2, i2, h(s2));
    }
  }), vr);
  var xi = ei((function(t2, e2, n2) {
    return 2 === t2.h && (ri(e2, n2, "" === (t2 = qn(t2)) ? void 0 : t2), true);
  }), hi, vr);
  var Li = ei((function(t2, e2, n2) {
    return 2 === t2.h && (ri(e2, n2, qn(t2)), true);
  }), hi, vr);
  var Ri = (function(t2, e2, n2 = yr) {
    return new Rr(t2, e2, n2);
  })((function(t2, e2, n2, r2, i2) {
    return 2 === t2.h && (r2 = Ne(void 0, r2), un(e2, 0 | e2[Q], n2).push(r2), Yn(t2, r2, i2), true);
  }), (function(t2, e2, n2, r2, i2) {
    if (Array.isArray(e2)) {
      for (let s2 = 0; s2 < e2.length; s2++) ui(t2, e2[s2], n2, r2, i2);
      1 & (t2 = 0 | e2[Q]) || rt(e2, 1 | t2);
    }
  }));
  var Ii = Ir((function(t2, e2, n2, r2, i2, s2) {
    if (2 !== t2.h) return false;
    let o2 = 0 | e2[Q];
    return dn(e2, o2, s2, n2, pt(o2)), Yn(t2, e2 = gn(e2, r2, n2), i2), true;
  }), ui);
  var Fi = ei((function(t2, e2, n2) {
    return 2 === t2.h && (ri(e2, n2, $n(t2)), true);
  }), li, kr);
  var Mi = ni((function(t2, e2, n2) {
    return (0 === t2.h || 2 === t2.h) && (e2 = un(e2, 0 | e2[Q], n2), 2 == t2.h ? Jn(t2, Un, e2) : e2.push(Un(t2.g)), true);
  }), (function(t2, e2, n2) {
    if (null != (e2 = ti(ne, e2))) for (let o2 = 0; o2 < e2.length; o2++) {
      var r2 = t2, i2 = n2, s2 = e2[o2];
      null != s2 && (lr(r2, i2, 0), ar(r2.g, s2));
    }
  }), wr);
  var Pi = ei((function(t2, e2, n2) {
    return 0 === t2.h && (ri(e2, n2, 0 === (t2 = Un(t2.g)) ? void 0 : t2), true);
  }), fi, wr);
  var Ci = ei((function(t2, e2, n2) {
    return 0 === t2.h && (ri(e2, n2, Nn(t2.g)), true);
  }), (function(t2, e2, n2) {
    null != (e2 = ee(e2)) && (e2 = parseInt(e2, 10), lr(t2, n2, 0), cr(t2.g, e2));
  }), Sr);
  var Oi = class {
    constructor(t2, e2) {
      var n2 = Qi;
      this.g = t2, this.h = e2, this.m = yn, this.j = wn, this.defaultValue = void 0, this.l = null != n2.Oa ? dt : void 0;
    }
    register() {
      m(this);
    }
  };
  function Ni(t2, e2) {
    return new Oi(t2, e2);
  }
  function Ui(t2, e2) {
    return (n2, r2) => {
      {
        const s2 = { ea: true };
        r2 && Object.assign(s2, r2), n2 = Hn(n2, void 0, void 0, s2);
        try {
          const r3 = new t2(), s3 = r3.v;
          zr(e2)(s3, n2);
          var i2 = r3;
        } finally {
          Wn(n2);
        }
      }
      return i2;
    };
  }
  function Di(t2) {
    return function() {
      const e2 = new class {
        constructor() {
          this.l = [], this.h = 0, this.g = new class {
            constructor() {
              this.g = [];
            }
            length() {
              return this.g.length;
            }
            end() {
              const t3 = this.g;
              return this.g = [], t3;
            }
          }();
        }
      }();
      Zr(this.v, e2, jr(Cr, qr, $r, t2)), ur(e2, e2.g.end());
      const n2 = new Uint8Array(e2.h), r2 = e2.l, i2 = r2.length;
      let s2 = 0;
      for (let t3 = 0; t3 < i2; t3++) {
        const e3 = r2[t3];
        n2.set(e3, s2), s2 += e3.length;
      }
      return e2.l = [n2], n2;
    };
  }
  var Bi = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Gi = [0, xi, ei((function(t2, e2, n2) {
    return 2 === t2.h && (ri(e2, n2, (t2 = $n(t2)) === R() ? void 0 : t2), true);
  }), (function(t2, e2, n2) {
    if (null != e2) {
      if (e2 instanceof Lr) {
        const r2 = e2.Ra;
        return void (r2 ? (e2 = r2(e2), null != e2 && pr(t2, n2, Pn(e2, true).buffer)) : U(K, 3));
      }
      if (Array.isArray(e2)) return void U(K, 3);
    }
    li(t2, e2, n2);
  }), kr)];
  var ji;
  var Vi = globalThis.trustedTypes;
  function Xi(t2) {
    var e2;
    return void 0 === ji && (ji = (function() {
      let t3 = null;
      if (!Vi) return t3;
      try {
        const e3 = (t4) => t4;
        t3 = Vi.createPolicy("goog#html", { createHTML: e3, createScript: e3, createScriptURL: e3 });
      } catch (t4) {
      }
      return t3;
    })()), t2 = (e2 = ji) ? e2.createScriptURL(t2) : t2, new class {
      constructor(t3) {
        this.g = t3;
      }
      toString() {
        return this.g + "";
      }
    }(t2);
  }
  function Hi(t2, ...e2) {
    if (0 === e2.length) return Xi(t2[0]);
    let n2 = t2[0];
    for (let r2 = 0; r2 < e2.length; r2++) n2 += encodeURIComponent(e2[r2]) + t2[r2 + 1];
    return Xi(n2);
  }
  var Wi = [0, wi, Ci, bi, -1, Ti, Ci, -1, bi];
  var zi = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Ki = [0, bi, Li, bi, Ci, -1, ni((function(t2, e2, n2) {
    return (0 === t2.h || 2 === t2.h) && (e2 = un(e2, 0 | e2[Q], n2), 2 == t2.h ? Jn(t2, Bn, e2) : e2.push(Nn(t2.g)), true);
  }), (function(t2, e2, n2) {
    if (null != (e2 = ti(ee, e2)) && e2.length) {
      n2 = fr(t2, n2);
      for (let n3 = 0; n3 < e2.length; n3++) cr(t2.g, e2[n3]);
      dr(t2, n2);
    }
  }), Sr), Li, -1, [0, bi, -1], Ci, bi, -1];
  var Yi = [0, 3, bi, -1, 2, [0, [2], wi, Ii, [0, ei((function(t2, e2, n2) {
    return 0 === t2.h && (ri(e2, n2, Un(t2.g)), true);
  }), fi, wr)]], [0, Ci, bi, Ci, bi, Ci, bi, Li, -1], [0, [3, 4], Li, -1, Ii, [0, wi], Ii, [0, Ci]], [0]];
  var qi = [0, Li, -2];
  var $i = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Ji = [0];
  var Zi = [0, wi, bi, 1, bi, -4];
  var Qi = class extends Lr {
    constructor(t2) {
      super(t2, 2);
    }
  };
  var ts = {};
  ts[336783863] = [0, Li, bi, -1, wi, [0, [1, 2, 3, 4, 5, 6, 7, 8, 9], Ii, Ji, Ii, Ki, Ii, qi, Ii, Zi, Ii, Wi, Ii, [0, Li, -2], Ii, [0, Li, Ci], Ii, Yi, Ii, [0, Ci, -1, bi]], [0, Li], bi, [0, [1, 3], [2, 4], Ii, [0, Ti], -1, Ii, [0, Si], -1, Ri, [0, Li, -1]], Li];
  var es = [0, vi, -1, ki, -3, vi, Ti, xi, Ai, vi, -1, ki, Ai, ki, -2, xi];
  function ns(t2, e2) {
    Fn(t2, 3, e2);
  }
  function rs(t2, e2) {
    Fn(t2, 4, e2);
  }
  var is = class extends Lr {
    constructor(t2) {
      super(t2, 500);
    }
    o(t2) {
      return wn(this, 0, 7, t2);
    }
  };
  var ss = [-1, {}];
  var os = [0, Li, 1, ss];
  var as = [0, Li, Si, ss];
  function cs(t2, e2) {
    bn(t2, 1, is, e2);
  }
  function hs(t2, e2) {
    Fn(t2, 10, e2);
  }
  function us(t2, e2) {
    Fn(t2, 15, e2);
  }
  var ls = class extends Lr {
    constructor(t2) {
      super(t2, 500);
    }
    o(t2) {
      return wn(this, 0, 1001, t2);
    }
  };
  var fs = [-500, Ri, [-500, xi, -1, Si, -3, [-2, ts, bi], Ri, Gi, Ai, -1, os, as, Ri, [0, xi, ki], xi, es, Ai, Si, 987, Si], 4, Ri, [-500, Li, -1, [-1, {}], 998, Li], Ri, [-500, Li, Si, -1, [-2, {}, bi], 997, Si, -1], Ai, Ri, [-500, Li, Si, ss, 998, Si], Si, Ai, os, as, Ri, [0, xi, -1, ss], Si, -2, es, xi, -1, ki, [0, ki, Pi], 978, ss, Ri, Gi];
  ls.prototype.g = Di(fs);
  var ds = Ui(ls, fs);
  var ps = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var gs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
    g() {
      return vn(this, ps, 1);
    }
  };
  var ms = [0, Ri, [0, wi, pi, Li, -1]];
  var ys = Ui(gs, ms);
  var _s = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var vs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Es = class extends Lr {
    constructor(t2) {
      super(t2);
    }
    l() {
      return yn(this, _s, 2);
    }
    g() {
      return vn(this, vs, 5);
    }
  };
  var ws = Ui(class extends Lr {
    constructor(t2) {
      super(t2);
    }
  }, [0, Si, Ti, mi, [0, Ci, [0, wi, -3], [0, pi, -3], [0, wi, -1, [0, Ri, [0, wi, -2]]], Ri, [0, pi, -1, Li, pi]], Li, -1, _i, Ri, [0, wi, pi], Si, _i]);
  var Ts = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var As = Ui(class extends Lr {
    constructor(t2) {
      super(t2);
    }
  }, [0, Ri, [0, pi, -4]]);
  var bs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var ks = Ui(class extends Lr {
    constructor(t2) {
      super(t2);
    }
  }, [0, Ri, [0, pi, -4]]);
  var Ss = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var xs = [0, wi, -1, mi, Ci];
  var Ls = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  Ls.prototype.g = Di([0, pi, -4, _i]);
  var Rs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Is = Ui(class extends Lr {
    constructor(t2) {
      super(t2);
    }
  }, [0, Ri, [0, 1, wi, Li, ms], _i]);
  var Fs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Ms = class extends Lr {
    constructor(t2) {
      super(t2);
    }
    na() {
      const t2 = $e(this, 1, void 0, void 0, an);
      return null == t2 ? R() : t2;
    }
  };
  var Ps = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Cs = [1, 2];
  var Os = Ui(class extends Lr {
    constructor(t2) {
      super(t2);
    }
  }, [0, Ri, [0, Cs, Ii, [0, mi], Ii, [0, Fi], wi, Li], _i]);
  var Ns = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Us = [0, Li, wi, pi, Si, -1];
  var Ds = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Bs = [0, bi, -1];
  var Gs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var js = [1, 2, 3, 4, 5, 6];
  var Vs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
    g() {
      return null != $e(this, 1, void 0, void 0, an);
    }
    l() {
      return null != le($e(this, 2));
    }
  };
  var Xs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
    g() {
      return Zt($e(this, 2)) ?? false;
    }
  };
  var Hs = [0, Fi, Li, [0, wi, _i, -1], [0, Ei, _i]];
  var Ws = [0, Hs, bi, [0, js, Ii, Zi, Ii, Ki, Ii, Wi, Ii, Ji, Ii, qi, Ii, Yi], Ci];
  var zs = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Ks = [0, Ws, pi, -1, wi];
  var Ys = Ni(502141897, zs);
  ts[502141897] = Ks;
  var qs = Ui(class extends Lr {
    constructor(t2) {
      super(t2);
    }
  }, [0, [0, Ci, -1, gi, Mi], xs]);
  var $s = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Js = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Zs = [0, Ws, pi, [0, Ws], bi];
  var Qs = Ni(508968150, Js);
  ts[508968150] = [0, Ws, Ks, Zs, pi, [0, [0, Hs]]], ts[508968149] = Zs;
  var to = class extends Lr {
    constructor(t2) {
      super(t2);
    }
    l() {
      return yn(this, Ns, 2);
    }
    g() {
      Ze(this, 2);
    }
  };
  var eo = [0, Ws, Us];
  ts[478825465] = eo;
  var no = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var ro = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var io = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var so = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var oo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var ao = [0, Ws, [0, Ws], eo, -1];
  var co = [0, Ws, pi, wi];
  var ho = [0, Ws, pi];
  var uo = [0, Ws, co, ho, pi];
  var lo = Ni(479097054, oo);
  ts[479097054] = [0, Ws, uo, ao], ts[463370452] = ao, ts[464864288] = co;
  var fo = Ni(462713202, so);
  ts[462713202] = uo, ts[474472470] = ho;
  var po = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var go = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var mo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var yo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var _o = [0, Ws, pi, -1, wi];
  var vo = [0, Ws, pi, bi];
  yo.prototype.g = Di([0, Ws, ho, [0, Ws], Ks, Zs, _o, vo]);
  var Eo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var wo = Ni(456383383, Eo);
  ts[456383383] = [0, Ws, Us];
  var To = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Ao = Ni(476348187, To);
  ts[476348187] = [0, Ws, Bs];
  var bo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var ko = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var So = [0, Ci, -1];
  var xo = Ni(458105876, class extends Lr {
    constructor(t2) {
      super(t2);
    }
    g() {
      let t2;
      var e2 = this.v;
      const n2 = 0 | e2[Q];
      return t2 = at(this, n2), e2 = (function(t3, e3, n3, r2) {
        var i2 = ko;
        !r2 && He(t3) && (n3 = 0 | (e3 = t3.v)[Q]);
        var s2 = Je(e3, 2);
        if (t3 = false, null == s2) {
          if (r2) return be();
          s2 = [];
        } else if (s2.constructor === Ee) {
          if (!(2 & s2.J) || r2) return s2;
          s2 = s2.V();
        } else Array.isArray(s2) ? t3 = !!(2 & (0 | s2[Q])) : s2 = [];
        if (r2) {
          if (!s2.length) return be();
          t3 || (t3 = true, it(s2));
        } else t3 && (t3 = false, st(s2), s2 = cn(s2));
        return !t3 && 32 & n3 && nt(s2, 32), n3 = Qe(e3, n3, 2, r2 = new Ee(s2, i2, de, void 0)), t3 || ze(e3, n3), r2;
      })(this, e2, n2, t2), !t2 && ko && (e2.ra = true), e2;
    }
  });
  ts[458105876] = [0, So, ii, [true, _i, [0, Li, -1, Si]], [0, Ti, bi, Ci]];
  var Lo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Ro = Ni(458105758, Lo);
  ts[458105758] = [0, Ws, Li, So];
  var Io = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Fo = [0, yi, -1, ki];
  var Mo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Po = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Co = [1, 2];
  Po.prototype.g = Di([0, Co, Ii, Fo, Ii, [0, Ri, Fo]]);
  var Oo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var No = Ni(443442058, Oo);
  ts[443442058] = [0, Ws, Li, wi, pi, Si, -1, bi, pi], ts[514774813] = _o;
  var Uo = class extends Lr {
    constructor(t2) {
      super(t2);
    }
  };
  var Do = Ni(516587230, Uo);
  function Bo(t2, e2) {
    return e2 = e2 ? e2.clone() : new Ns(), void 0 !== t2.displayNamesLocale ? Ze(e2, 1, ue(t2.displayNamesLocale)) : void 0 === t2.displayNamesLocale && Ze(e2, 1), void 0 !== t2.maxResults ? xn(e2, 2, t2.maxResults) : "maxResults" in t2 && Ze(e2, 2), void 0 !== t2.scoreThreshold ? Ln(e2, 3, t2.scoreThreshold) : "scoreThreshold" in t2 && Ze(e2, 3), void 0 !== t2.categoryAllowlist ? In(e2, 4, t2.categoryAllowlist) : "categoryAllowlist" in t2 && Ze(e2, 4), void 0 !== t2.categoryDenylist ? In(e2, 5, t2.categoryDenylist) : "categoryDenylist" in t2 && Ze(e2, 5), e2;
  }
  function Go(t2) {
    const e2 = Number(t2);
    return Number.isSafeInteger(e2) ? e2 : String(t2);
  }
  function jo(t2, e2 = -1, n2 = "") {
    return { categories: t2.map(((t3) => ({ index: kn(t3, 1) ?? 0 ?? -1, score: Sn(t3, 2) ?? 0, categoryName: le($e(t3, 3)) ?? "" ?? "", displayName: le($e(t3, 4)) ?? "" ?? "" }))), headIndex: e2, headName: n2 };
  }
  function Vo(t2) {
    const e2 = { classifications: vn(t2, Rs, 1).map(((t3) => jo(yn(t3, gs, 4)?.g() ?? [], kn(t3, 2) ?? 0, le($e(t3, 3)) ?? ""))) };
    return null != (function(t3) {
      return null == t3 ? t3 : "bigint" == typeof t3 ? (wt(t3) ? t3 = Number(t3) : (t3 = Xt(64, t3), t3 = wt(t3) ? Number(t3) : String(t3)), t3) : te(t3) ? "number" == typeof t3 ? ie(t3) : se(t3) : void 0;
    })($e(t2, 2, void 0, void 0, ce)) && (e2.timestampMs = Go($e(t2, 2, void 0, void 0, ce) ?? Ye)), e2;
  }
  function Xo(t2) {
    var e2 = en(t2, 3, $t, tn()), n2 = en(t2, 2, ee, tn()), r2 = en(t2, 1, le, tn()), i2 = en(t2, 9, le, tn());
    const s2 = { categories: [], keypoints: [] };
    for (let t3 = 0; t3 < e2.length; t3++) s2.categories.push({ score: e2[t3], index: n2[t3] ?? -1, categoryName: r2[t3] ?? "", displayName: i2[t3] ?? "" });
    if ((e2 = yn(t2, Es, 4)?.l()) && (s2.boundingBox = { originX: kn(e2, 1, qe) ?? 0, originY: kn(e2, 2, qe) ?? 0, width: kn(e2, 3, qe) ?? 0, height: kn(e2, 4, qe) ?? 0, angle: 0 }), yn(t2, Es, 4)?.g().length) for (const e3 of yn(t2, Es, 4).g()) s2.keypoints.push({ x: $e(e3, 1, void 0, qe, $t) ?? 0, y: $e(e3, 2, void 0, qe, $t) ?? 0, score: $e(e3, 4, void 0, qe, $t) ?? 0, label: le($e(e3, 3, void 0, qe)) ?? "" });
    return s2;
  }
  function Ho(t2) {
    const e2 = [];
    for (const n2 of vn(t2, bs, 1)) e2.push({ x: Sn(n2, 1) ?? 0, y: Sn(n2, 2) ?? 0, z: Sn(n2, 3) ?? 0, visibility: Sn(n2, 4) ?? 0 });
    return e2;
  }
  function Wo(t2) {
    const e2 = [];
    for (const n2 of vn(t2, Ts, 1)) e2.push({ x: Sn(n2, 1) ?? 0, y: Sn(n2, 2) ?? 0, z: Sn(n2, 3) ?? 0, visibility: Sn(n2, 4) ?? 0 });
    return e2;
  }
  function zo(t2) {
    return Array.from(t2, ((t3) => t3 > 127 ? t3 - 256 : t3));
  }
  function Ko(t2, e2) {
    if (t2.length !== e2.length) throw Error(`Cannot compute cosine similarity between embeddings of different sizes (${t2.length} vs. ${e2.length}).`);
    let n2 = 0, r2 = 0, i2 = 0;
    for (let s2 = 0; s2 < t2.length; s2++) n2 += t2[s2] * e2[s2], r2 += t2[s2] * t2[s2], i2 += e2[s2] * e2[s2];
    if (r2 <= 0 || i2 <= 0) throw Error("Cannot compute cosine similarity on embedding with 0 norm.");
    return n2 / Math.sqrt(r2 * i2);
  }
  var Yo;
  ts[516587230] = [0, Ws, _o, vo, pi], ts[518928384] = vo;
  var qo = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);
  async function $o(t2) {
    if (t2) return true;
    if (void 0 === Yo) try {
      await WebAssembly.instantiate(qo), Yo = true;
    } catch {
      Yo = false;
    }
    return Yo;
  }
  async function Jo(t2, e2, n2) {
    return { wasmLoaderPath: `${e2}/${t2}_${n2 = `wasm${n2 ? "_module" : ""}${await $o(n2) ? "" : "_nosimd"}_internal`}.js`, wasmBinaryPath: `${e2}/${t2}_${n2}.wasm` };
  }
  var Zo = class {
  };
  function Qo() {
    var t2 = navigator;
    return "undefined" != typeof OffscreenCanvas && (!(function(t3 = navigator) {
      return (t3 = t3.userAgent).includes("Safari") && !t3.includes("Chrome");
    })(t2) || !!((t2 = t2.userAgent.match(/Version\/([\d]+).*Safari/)) && t2.length >= 1 && Number(t2[1]) >= 17));
  }
  async function ta(t2) {
    if ("function" != typeof importScripts) {
      const e2 = document.createElement("script");
      return e2.src = t2.toString(), e2.crossOrigin = "anonymous", new Promise(((t3, n2) => {
        e2.addEventListener("load", (() => {
          t3();
        }), false), e2.addEventListener("error", ((t4) => {
          n2(t4);
        }), false), document.body.appendChild(e2);
      }));
    }
    try {
      importScripts(t2.toString());
    } catch (e2) {
      if (!(e2 instanceof TypeError)) throw e2;
      {
        const e3 = self.import;
        e3 ? await e3(t2.toString()) : await import(t2.toString());
      }
    }
  }
  function ea(t2) {
    return void 0 !== t2.videoWidth ? [t2.videoWidth, t2.videoHeight] : void 0 !== t2.naturalWidth ? [t2.naturalWidth, t2.naturalHeight] : void 0 !== t2.displayWidth ? [t2.displayWidth, t2.displayHeight] : [t2.width, t2.height];
  }
  function na(t2, e2, n2) {
    t2.m || console.error("No wasm multistream support detected: ensure dependency inclusion of :gl_graph_runner_internal_multi_input target"), n2(e2 = t2.i.stringToNewUTF8(e2)), t2.i._free(e2);
  }
  function ra(t2, e2, n2) {
    if (!t2.i.canvas) throw Error("No OpenGL canvas configured.");
    if (n2 ? t2.i._bindTextureToStream(n2) : t2.i._bindTextureToCanvas(), !(n2 = t2.i.canvas.getContext("webgl2") || t2.i.canvas.getContext("webgl"))) throw Error("Failed to obtain WebGL context from the provided canvas. `getContext()` should only be invoked with `webgl` or `webgl2`.");
    t2.i.gpuOriginForWebTexturesIsBottomLeft && n2.pixelStorei(n2.UNPACK_FLIP_Y_WEBGL, true), n2.texImage2D(n2.TEXTURE_2D, 0, n2.RGBA, n2.RGBA, n2.UNSIGNED_BYTE, e2), t2.i.gpuOriginForWebTexturesIsBottomLeft && n2.pixelStorei(n2.UNPACK_FLIP_Y_WEBGL, false);
    const [r2, i2] = ea(e2);
    return !t2.l || r2 === t2.i.canvas.width && i2 === t2.i.canvas.height || (t2.i.canvas.width = r2, t2.i.canvas.height = i2), [r2, i2];
  }
  function ia(t2, e2, n2) {
    t2.m || console.error("No wasm multistream support detected: ensure dependency inclusion of :gl_graph_runner_internal_multi_input target");
    const r2 = new Uint32Array(e2.length);
    for (let n3 = 0; n3 < e2.length; n3++) r2[n3] = t2.i.stringToNewUTF8(e2[n3]);
    e2 = t2.i._malloc(4 * r2.length), t2.i.HEAPU32.set(r2, e2 >> 2), n2(e2);
    for (const e3 of r2) t2.i._free(e3);
    t2.i._free(e2);
  }
  function sa(t2, e2, n2) {
    t2.i.simpleListeners = t2.i.simpleListeners || {}, t2.i.simpleListeners[e2] = n2;
  }
  function oa(t2, e2, n2) {
    let r2 = [];
    t2.i.simpleListeners = t2.i.simpleListeners || {}, t2.i.simpleListeners[e2] = (t3, e3, i2) => {
      e3 ? (n2(r2, i2), r2 = []) : r2.push(t3);
    };
  }
  Zo.forVisionTasks = function(t2, e2 = false) {
    return Jo("vision", t2 ?? Hi``, e2);
  }, Zo.forTextTasks = function(t2, e2 = false) {
    return Jo("text", t2 ?? Hi``, e2);
  }, Zo.forGenAiTasks = function(t2, e2 = false) {
    return Jo("genai", t2 ?? Hi``, e2);
  }, Zo.forAudioTasks = function(t2, e2 = false) {
    return Jo("audio", t2 ?? Hi``, e2);
  }, Zo.isSimdSupported = function(t2 = false) {
    return $o(t2);
  };
  async function aa(t2, e2, n2, r2) {
    return t2 = await (async (t3, e3, n3, r3, i2) => {
      if (e3 && await ta(e3), !self.ModuleFactory) throw Error("ModuleFactory not set.");
      if (n3 && (await ta(n3), !self.ModuleFactory)) throw Error("ModuleFactory not set.");
      return self.Module && i2 && ((e3 = self.Module).locateFile = i2.locateFile, i2.mainScriptUrlOrBlob && (e3.mainScriptUrlOrBlob = i2.mainScriptUrlOrBlob)), i2 = await self.ModuleFactory(self.Module || i2), self.ModuleFactory = self.Module = void 0, new t3(i2, r3);
    })(t2, n2.wasmLoaderPath, n2.assetLoaderPath, e2, { locateFile: (t3) => t3.endsWith(".wasm") ? n2.wasmBinaryPath.toString() : n2.assetBinaryPath && t3.endsWith(".data") ? n2.assetBinaryPath.toString() : t3 }), await t2.o(r2), t2;
  }
  function ca(t2, e2) {
    const n2 = yn(t2.baseOptions, Vs, 1) || new Vs();
    "string" == typeof e2 ? (Ze(n2, 2, ue(e2)), Ze(n2, 1)) : e2 instanceof Uint8Array && (Ze(n2, 1, ht(e2, false)), Ze(n2, 2)), wn(t2.baseOptions, 0, 1, n2);
  }
  function ha(t2) {
    try {
      const e2 = t2.H.length;
      if (1 === e2) throw Error(t2.H[0].message);
      if (e2 > 1) throw Error("Encountered multiple errors: " + t2.H.map(((t3) => t3.message)).join(", "));
    } finally {
      t2.H = [];
    }
  }
  function ua(t2, e2) {
    t2.C = Math.max(t2.C, e2);
  }
  function la(t2, e2) {
    t2.B = new is(), Rn(t2.B, 2, "PassThroughCalculator"), ns(t2.B, "free_memory"), rs(t2.B, "free_memory_unused_out"), hs(e2, "free_memory"), cs(e2, t2.B);
  }
  function fa(t2, e2) {
    ns(t2.B, e2), rs(t2.B, e2 + "_unused_out");
  }
  function da(t2) {
    t2.g.addBoolToStream(true, "free_memory", t2.C);
  }
  var pa = class {
    constructor(t2) {
      this.g = t2, this.H = [], this.C = 0, this.g.setAutoRenderToScreen(false);
    }
    l(t2, e2 = true) {
      if (e2) {
        const e3 = t2.baseOptions || {};
        if (t2.baseOptions?.modelAssetBuffer && t2.baseOptions?.modelAssetPath) throw Error("Cannot set both baseOptions.modelAssetPath and baseOptions.modelAssetBuffer");
        if (!(yn(this.baseOptions, Vs, 1)?.g() || yn(this.baseOptions, Vs, 1)?.l() || t2.baseOptions?.modelAssetBuffer || t2.baseOptions?.modelAssetPath)) throw Error("Either baseOptions.modelAssetPath or baseOptions.modelAssetBuffer must be set");
        if ((function(t3, e4) {
          let n2 = yn(t3.baseOptions, Gs, 3);
          if (!n2) {
            var r2 = n2 = new Gs(), i2 = new $i();
            Tn(r2, 4, js, i2);
          }
          "delegate" in e4 && ("GPU" === e4.delegate ? (e4 = n2, r2 = new zi(), Tn(e4, 2, js, r2)) : (e4 = n2, r2 = new $i(), Tn(e4, 4, js, r2))), wn(t3.baseOptions, 0, 3, n2);
        })(this, e3), e3.modelAssetPath) return fetch(e3.modelAssetPath.toString()).then(((t3) => {
          if (t3.ok) return t3.arrayBuffer();
          throw Error(`Failed to fetch model: ${e3.modelAssetPath} (${t3.status})`);
        })).then(((t3) => {
          try {
            this.g.i.FS_unlink("/model.dat");
          } catch {
          }
          this.g.i.FS_createDataFile("/", "model.dat", new Uint8Array(t3), true, false, false), ca(this, "/model.dat"), this.m(), this.L();
        }));
        if (e3.modelAssetBuffer instanceof Uint8Array) ca(this, e3.modelAssetBuffer);
        else if (e3.modelAssetBuffer) return (async function(t3) {
          const e4 = [];
          for (var n2 = 0; ; ) {
            const { done: r2, value: i2 } = await t3.read();
            if (r2) break;
            e4.push(i2), n2 += i2.length;
          }
          if (0 === e4.length) return new Uint8Array(0);
          if (1 === e4.length) return e4[0];
          t3 = new Uint8Array(n2), n2 = 0;
          for (const r2 of e4) t3.set(r2, n2), n2 += r2.length;
          return t3;
        })(e3.modelAssetBuffer).then(((t3) => {
          ca(this, t3), this.m(), this.L();
        }));
      }
      return this.m(), this.L(), Promise.resolve();
    }
    L() {
    }
    ca() {
      let t2;
      if (this.g.ca(((e2) => {
        t2 = ds(e2);
      })), !t2) throw Error("Failed to retrieve CalculatorGraphConfig");
      return t2;
    }
    setGraph(t2, e2) {
      this.g.attachErrorListener(((t3, e3) => {
        this.H.push(Error(e3));
      })), this.g.Ja(), this.g.setGraph(t2, e2), this.B = void 0, ha(this);
    }
    finishProcessing() {
      this.g.finishProcessing(), ha(this);
    }
    close() {
      this.B = void 0, this.g.closeGraph();
    }
  };
  function ga(t2, e2) {
    if (!t2) throw Error(`Unable to obtain required WebGL resource: ${e2}`);
    return t2;
  }
  pa.prototype.close = pa.prototype.close;
  var ma = class {
    constructor(t2, e2, n2, r2) {
      this.g = t2, this.h = e2, this.m = n2, this.l = r2;
    }
    bind() {
      this.g.bindVertexArray(this.h);
    }
    close() {
      this.g.deleteVertexArray(this.h), this.g.deleteBuffer(this.m), this.g.deleteBuffer(this.l);
    }
  };
  function ya(t2, e2, n2) {
    const r2 = t2.g;
    if (n2 = ga(r2.createShader(n2), "Failed to create WebGL shader"), r2.shaderSource(n2, e2), r2.compileShader(n2), !r2.getShaderParameter(n2, r2.COMPILE_STATUS)) throw Error(`Could not compile WebGL shader: ${r2.getShaderInfoLog(n2)}`);
    return r2.attachShader(t2.h, n2), n2;
  }
  function _a(t2, e2) {
    const n2 = t2.g, r2 = ga(n2.createVertexArray(), "Failed to create vertex array");
    n2.bindVertexArray(r2);
    const i2 = ga(n2.createBuffer(), "Failed to create buffer");
    n2.bindBuffer(n2.ARRAY_BUFFER, i2), n2.enableVertexAttribArray(t2.O), n2.vertexAttribPointer(t2.O, 2, n2.FLOAT, false, 0, 0), n2.bufferData(n2.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), n2.STATIC_DRAW);
    const s2 = ga(n2.createBuffer(), "Failed to create buffer");
    return n2.bindBuffer(n2.ARRAY_BUFFER, s2), n2.enableVertexAttribArray(t2.L), n2.vertexAttribPointer(t2.L, 2, n2.FLOAT, false, 0, 0), n2.bufferData(n2.ARRAY_BUFFER, new Float32Array(e2 ? [0, 1, 0, 0, 1, 0, 1, 1] : [0, 0, 0, 1, 1, 1, 1, 0]), n2.STATIC_DRAW), n2.bindBuffer(n2.ARRAY_BUFFER, null), n2.bindVertexArray(null), new ma(n2, r2, i2, s2);
  }
  function va(t2, e2) {
    if (t2.g) {
      if (e2 !== t2.g) throw Error("Cannot change GL context once initialized");
    } else t2.g = e2;
  }
  function Ea(t2, e2, n2, r2) {
    return va(t2, e2), t2.h || (t2.m(), t2.D()), n2 ? (t2.u || (t2.u = _a(t2, true)), n2 = t2.u) : (t2.A || (t2.A = _a(t2, false)), n2 = t2.A), e2.useProgram(t2.h), n2.bind(), t2.l(), t2 = r2(), n2.g.bindVertexArray(null), t2;
  }
  function wa(t2, e2, n2) {
    return va(t2, e2), t2 = ga(e2.createTexture(), "Failed to create texture"), e2.bindTexture(e2.TEXTURE_2D, t2), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_T, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MIN_FILTER, n2 ?? e2.LINEAR), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MAG_FILTER, n2 ?? e2.LINEAR), e2.bindTexture(e2.TEXTURE_2D, null), t2;
  }
  function Ta(t2, e2, n2) {
    va(t2, e2), t2.B || (t2.B = ga(e2.createFramebuffer(), "Failed to create framebuffe.")), e2.bindFramebuffer(e2.FRAMEBUFFER, t2.B), e2.framebufferTexture2D(e2.FRAMEBUFFER, e2.COLOR_ATTACHMENT0, e2.TEXTURE_2D, n2, 0);
  }
  function Aa(t2) {
    t2.g?.bindFramebuffer(t2.g.FRAMEBUFFER, null);
  }
  var ba = class {
    H() {
      return "\n  precision mediump float;\n  varying vec2 vTex;\n  uniform sampler2D inputTexture;\n  void main() {\n    gl_FragColor = texture2D(inputTexture, vTex);\n  }\n ";
    }
    m() {
      const t2 = this.g;
      if (this.h = ga(t2.createProgram(), "Failed to create WebGL program"), this.X = ya(this, "\n  attribute vec2 aVertex;\n  attribute vec2 aTex;\n  varying vec2 vTex;\n  void main(void) {\n    gl_Position = vec4(aVertex, 0.0, 1.0);\n    vTex = aTex;\n  }", t2.VERTEX_SHADER), this.W = ya(this, this.H(), t2.FRAGMENT_SHADER), t2.linkProgram(this.h), !t2.getProgramParameter(this.h, t2.LINK_STATUS)) throw Error(`Error during program linking: ${t2.getProgramInfoLog(this.h)}`);
      this.O = t2.getAttribLocation(this.h, "aVertex"), this.L = t2.getAttribLocation(this.h, "aTex");
    }
    D() {
    }
    l() {
    }
    close() {
      if (this.h) {
        const t2 = this.g;
        t2.deleteProgram(this.h), t2.deleteShader(this.X), t2.deleteShader(this.W);
      }
      this.B && this.g.deleteFramebuffer(this.B), this.A && this.A.close(), this.u && this.u.close();
    }
  };
  var ka = class extends ba {
    H() {
      return "\n  precision mediump float;\n  uniform sampler2D backgroundTexture;\n  uniform sampler2D maskTexture;\n  uniform sampler2D colorMappingTexture;\n  varying vec2 vTex;\n  void main() {\n    vec4 backgroundColor = texture2D(backgroundTexture, vTex);\n    float category = texture2D(maskTexture, vTex).r;\n    vec4 categoryColor = texture2D(colorMappingTexture, vec2(category, 0.0));\n    gl_FragColor = mix(backgroundColor, categoryColor, categoryColor.a);\n  }\n ";
    }
    D() {
      const t2 = this.g;
      t2.activeTexture(t2.TEXTURE1), this.C = wa(this, t2, t2.LINEAR), t2.activeTexture(t2.TEXTURE2), this.j = wa(this, t2, t2.NEAREST);
    }
    m() {
      super.m();
      const t2 = this.g;
      this.P = ga(t2.getUniformLocation(this.h, "backgroundTexture"), "Uniform location"), this.U = ga(t2.getUniformLocation(this.h, "colorMappingTexture"), "Uniform location"), this.M = ga(t2.getUniformLocation(this.h, "maskTexture"), "Uniform location");
    }
    l() {
      super.l();
      const t2 = this.g;
      t2.uniform1i(this.M, 0), t2.uniform1i(this.P, 1), t2.uniform1i(this.U, 2);
    }
    close() {
      this.C && this.g.deleteTexture(this.C), this.j && this.g.deleteTexture(this.j), super.close();
    }
  };
  var Sa = class extends ba {
    H() {
      return "\n  precision mediump float;\n  uniform sampler2D maskTexture;\n  uniform sampler2D defaultTexture;\n  uniform sampler2D overlayTexture;\n  varying vec2 vTex;\n  void main() {\n    float confidence = texture2D(maskTexture, vTex).r;\n    vec4 defaultColor = texture2D(defaultTexture, vTex);\n    vec4 overlayColor = texture2D(overlayTexture, vTex);\n    // Apply the alpha from the overlay and merge in the default color\n    overlayColor = mix(defaultColor, overlayColor, overlayColor.a);\n    gl_FragColor = mix(defaultColor, overlayColor, confidence);\n  }\n ";
    }
    D() {
      const t2 = this.g;
      t2.activeTexture(t2.TEXTURE1), this.j = wa(this, t2), t2.activeTexture(t2.TEXTURE2), this.C = wa(this, t2);
    }
    m() {
      super.m();
      const t2 = this.g;
      this.M = ga(t2.getUniformLocation(this.h, "defaultTexture"), "Uniform location"), this.P = ga(t2.getUniformLocation(this.h, "overlayTexture"), "Uniform location"), this.I = ga(t2.getUniformLocation(this.h, "maskTexture"), "Uniform location");
    }
    l() {
      super.l();
      const t2 = this.g;
      t2.uniform1i(this.I, 0), t2.uniform1i(this.M, 1), t2.uniform1i(this.P, 2);
    }
    close() {
      this.j && this.g.deleteTexture(this.j), this.C && this.g.deleteTexture(this.C), super.close();
    }
  };
  function xa(t2, e2) {
    switch (e2) {
      case 0:
        return t2.g.find(((t3) => t3 instanceof Uint8Array));
      case 1:
        return t2.g.find(((t3) => t3 instanceof Float32Array));
      case 2:
        return t2.g.find(((t3) => "undefined" != typeof WebGLTexture && t3 instanceof WebGLTexture));
      default:
        throw Error(`Type is not supported: ${e2}`);
    }
  }
  function La(t2) {
    var e2 = xa(t2, 1);
    if (!e2) {
      if (e2 = xa(t2, 0)) e2 = new Float32Array(e2).map(((t3) => t3 / 255));
      else {
        e2 = new Float32Array(t2.width * t2.height);
        const r2 = Ia(t2);
        var n2 = Ma(t2);
        if (Ta(n2, r2, Ra(t2)), "iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(";").includes(navigator.platform) || navigator.userAgent.includes("Mac") && "document" in self && "ontouchend" in self.document) {
          n2 = new Float32Array(t2.width * t2.height * 4), r2.readPixels(0, 0, t2.width, t2.height, r2.RGBA, r2.FLOAT, n2);
          for (let t3 = 0, r3 = 0; t3 < e2.length; ++t3, r3 += 4) e2[t3] = n2[r3];
        } else r2.readPixels(0, 0, t2.width, t2.height, r2.RED, r2.FLOAT, e2);
      }
      t2.g.push(e2);
    }
    return e2;
  }
  function Ra(t2) {
    let e2 = xa(t2, 2);
    if (!e2) {
      const n2 = Ia(t2);
      e2 = Pa(t2);
      const r2 = La(t2), i2 = Fa(t2);
      n2.texImage2D(n2.TEXTURE_2D, 0, i2, t2.width, t2.height, 0, n2.RED, n2.FLOAT, r2), Ca(t2);
    }
    return e2;
  }
  function Ia(t2) {
    if (!t2.canvas) throw Error("Conversion to different image formats require that a canvas is passed when initializing the image.");
    return t2.h || (t2.h = ga(t2.canvas.getContext("webgl2"), "You cannot use a canvas that is already bound to a different type of rendering context.")), t2.h;
  }
  function Fa(t2) {
    if (t2 = Ia(t2), !Oa) if (t2.getExtension("EXT_color_buffer_float") && t2.getExtension("OES_texture_float_linear") && t2.getExtension("EXT_float_blend")) Oa = t2.R32F;
    else {
      if (!t2.getExtension("EXT_color_buffer_half_float")) throw Error("GPU does not fully support 4-channel float32 or float16 formats");
      Oa = t2.R16F;
    }
    return Oa;
  }
  function Ma(t2) {
    return t2.l || (t2.l = new ba()), t2.l;
  }
  function Pa(t2) {
    const e2 = Ia(t2);
    e2.viewport(0, 0, t2.width, t2.height), e2.activeTexture(e2.TEXTURE0);
    let n2 = xa(t2, 2);
    return n2 || (n2 = wa(Ma(t2), e2, t2.m ? e2.LINEAR : e2.NEAREST), t2.g.push(n2), t2.j = true), e2.bindTexture(e2.TEXTURE_2D, n2), n2;
  }
  function Ca(t2) {
    t2.h.bindTexture(t2.h.TEXTURE_2D, null);
  }
  var Oa;
  var Na = class {
    constructor(t2, e2, n2, r2, i2, s2, o2) {
      this.g = t2, this.m = e2, this.j = n2, this.canvas = r2, this.l = i2, this.width = s2, this.height = o2, this.j && (0 === --Ua && console.error("You seem to be creating MPMask instances without invoking .close(). This leaks resources."));
    }
    Fa() {
      return !!xa(this, 0);
    }
    ka() {
      return !!xa(this, 1);
    }
    R() {
      return !!xa(this, 2);
    }
    ja() {
      return (e2 = xa(t2 = this, 0)) || (e2 = La(t2), e2 = new Uint8Array(e2.map(((t3) => Math.round(255 * t3)))), t2.g.push(e2)), e2;
      var t2, e2;
    }
    ia() {
      return La(this);
    }
    N() {
      return Ra(this);
    }
    clone() {
      const t2 = [];
      for (const e2 of this.g) {
        let n2;
        if (e2 instanceof Uint8Array) n2 = new Uint8Array(e2);
        else if (e2 instanceof Float32Array) n2 = new Float32Array(e2);
        else {
          if (!(e2 instanceof WebGLTexture)) throw Error(`Type is not supported: ${e2}`);
          {
            const t3 = Ia(this), e3 = Ma(this);
            t3.activeTexture(t3.TEXTURE1), n2 = wa(e3, t3, this.m ? t3.LINEAR : t3.NEAREST), t3.bindTexture(t3.TEXTURE_2D, n2);
            const r2 = Fa(this);
            t3.texImage2D(t3.TEXTURE_2D, 0, r2, this.width, this.height, 0, t3.RED, t3.FLOAT, null), t3.bindTexture(t3.TEXTURE_2D, null), Ta(e3, t3, n2), Ea(e3, t3, false, (() => {
              Pa(this), t3.clearColor(0, 0, 0, 0), t3.clear(t3.COLOR_BUFFER_BIT), t3.drawArrays(t3.TRIANGLE_FAN, 0, 4), Ca(this);
            })), Aa(e3), Ca(this);
          }
        }
        t2.push(n2);
      }
      return new Na(t2, this.m, this.R(), this.canvas, this.l, this.width, this.height);
    }
    close() {
      this.j && Ia(this).deleteTexture(xa(this, 2)), Ua = -1;
    }
  };
  Na.prototype.close = Na.prototype.close, Na.prototype.clone = Na.prototype.clone, Na.prototype.getAsWebGLTexture = Na.prototype.N, Na.prototype.getAsFloat32Array = Na.prototype.ia, Na.prototype.getAsUint8Array = Na.prototype.ja, Na.prototype.hasWebGLTexture = Na.prototype.R, Na.prototype.hasFloat32Array = Na.prototype.ka, Na.prototype.hasUint8Array = Na.prototype.Fa;
  var Ua = 250;
  var Da = { color: "white", lineWidth: 4, radius: 6 };
  function Ba(t2) {
    return { ...Da, fillColor: (t2 = t2 || {}).color, ...t2 };
  }
  function Ga(t2, e2) {
    return t2 instanceof Function ? t2(e2) : t2;
  }
  function ja(t2, e2, n2) {
    return Math.max(Math.min(e2, n2), Math.min(Math.max(e2, n2), t2));
  }
  function Va(t2) {
    if (!t2.l) throw Error("CPU rendering requested but CanvasRenderingContext2D not provided.");
    return t2.l;
  }
  function Xa(t2) {
    if (!t2.j) throw Error("GPU rendering requested but WebGL2RenderingContext not provided.");
    return t2.j;
  }
  function Ha(t2, e2, n2) {
    if (e2.R()) n2(e2.N());
    else {
      const r2 = e2.ka() ? e2.ia() : e2.ja();
      t2.m = t2.m ?? new ba();
      const i2 = Xa(t2);
      n2((t2 = new Na([r2], e2.m, false, i2.canvas, t2.m, e2.width, e2.height)).N()), t2.close();
    }
  }
  function Wa(t2, e2, n2, r2) {
    const i2 = (function(t3) {
      return t3.g || (t3.g = new ka()), t3.g;
    })(t2), s2 = Xa(t2), o2 = Array.isArray(n2) ? new ImageData(new Uint8ClampedArray(n2), 1, 1) : n2;
    Ea(i2, s2, true, (() => {
      !(function(t4, e3, n3, r3) {
        const i3 = t4.g;
        if (i3.activeTexture(i3.TEXTURE0), i3.bindTexture(i3.TEXTURE_2D, e3), i3.activeTexture(i3.TEXTURE1), i3.bindTexture(i3.TEXTURE_2D, t4.C), i3.texImage2D(i3.TEXTURE_2D, 0, i3.RGBA, i3.RGBA, i3.UNSIGNED_BYTE, n3), t4.I && (function(t5, e4) {
          if (t5 !== e4) return false;
          t5 = t5.entries(), e4 = e4.entries();
          for (const [n4, r4] of t5) {
            t5 = n4;
            const i4 = r4, s3 = e4.next();
            if (s3.done) return false;
            const [o3, a2] = s3.value;
            if (t5 !== o3 || i4[0] !== a2[0] || i4[1] !== a2[1] || i4[2] !== a2[2] || i4[3] !== a2[3]) return false;
          }
          return !!e4.next().done;
        })(t4.I, r3)) i3.activeTexture(i3.TEXTURE2), i3.bindTexture(i3.TEXTURE_2D, t4.j);
        else {
          t4.I = r3;
          const e4 = Array(1024).fill(0);
          r3.forEach(((t5, n4) => {
            if (4 !== t5.length) throw Error(`Color at index ${n4} is not a four-channel value.`);
            e4[4 * n4] = t5[0], e4[4 * n4 + 1] = t5[1], e4[4 * n4 + 2] = t5[2], e4[4 * n4 + 3] = t5[3];
          })), i3.activeTexture(i3.TEXTURE2), i3.bindTexture(i3.TEXTURE_2D, t4.j), i3.texImage2D(i3.TEXTURE_2D, 0, i3.RGBA, 256, 1, 0, i3.RGBA, i3.UNSIGNED_BYTE, new Uint8Array(e4));
        }
      })(i2, e2, o2, r2), s2.clearColor(0, 0, 0, 0), s2.clear(s2.COLOR_BUFFER_BIT), s2.drawArrays(s2.TRIANGLE_FAN, 0, 4);
      const t3 = i2.g;
      t3.activeTexture(t3.TEXTURE0), t3.bindTexture(t3.TEXTURE_2D, null), t3.activeTexture(t3.TEXTURE1), t3.bindTexture(t3.TEXTURE_2D, null), t3.activeTexture(t3.TEXTURE2), t3.bindTexture(t3.TEXTURE_2D, null);
    }));
  }
  function za(t2, e2, n2, r2) {
    const i2 = Xa(t2), s2 = (function(t3) {
      return t3.h || (t3.h = new Sa()), t3.h;
    })(t2), o2 = Array.isArray(n2) ? new ImageData(new Uint8ClampedArray(n2), 1, 1) : n2, a2 = Array.isArray(r2) ? new ImageData(new Uint8ClampedArray(r2), 1, 1) : r2;
    Ea(s2, i2, true, (() => {
      var t3 = s2.g;
      t3.activeTexture(t3.TEXTURE0), t3.bindTexture(t3.TEXTURE_2D, e2), t3.activeTexture(t3.TEXTURE1), t3.bindTexture(t3.TEXTURE_2D, s2.j), t3.texImage2D(t3.TEXTURE_2D, 0, t3.RGBA, t3.RGBA, t3.UNSIGNED_BYTE, o2), t3.activeTexture(t3.TEXTURE2), t3.bindTexture(t3.TEXTURE_2D, s2.C), t3.texImage2D(t3.TEXTURE_2D, 0, t3.RGBA, t3.RGBA, t3.UNSIGNED_BYTE, a2), i2.clearColor(0, 0, 0, 0), i2.clear(i2.COLOR_BUFFER_BIT), i2.drawArrays(i2.TRIANGLE_FAN, 0, 4), i2.bindTexture(i2.TEXTURE_2D, null), (t3 = s2.g).activeTexture(t3.TEXTURE0), t3.bindTexture(t3.TEXTURE_2D, null), t3.activeTexture(t3.TEXTURE1), t3.bindTexture(t3.TEXTURE_2D, null), t3.activeTexture(t3.TEXTURE2), t3.bindTexture(t3.TEXTURE_2D, null);
    }));
  }
  var Ka = class {
    constructor(t2, e2) {
      "undefined" != typeof CanvasRenderingContext2D && t2 instanceof CanvasRenderingContext2D || t2 instanceof OffscreenCanvasRenderingContext2D ? (this.l = t2, this.j = e2) : this.j = t2;
    }
    ya(t2, e2) {
      if (t2) {
        var n2 = Va(this);
        e2 = Ba(e2), n2.save();
        var r2 = n2.canvas, i2 = 0;
        for (const s2 of t2) n2.fillStyle = Ga(e2.fillColor, { index: i2, from: s2 }), n2.strokeStyle = Ga(e2.color, { index: i2, from: s2 }), n2.lineWidth = Ga(e2.lineWidth, { index: i2, from: s2 }), (t2 = new Path2D()).arc(s2.x * r2.width, s2.y * r2.height, Ga(e2.radius, { index: i2, from: s2 }), 0, 2 * Math.PI), n2.fill(t2), n2.stroke(t2), ++i2;
        n2.restore();
      }
    }
    xa(t2, e2, n2) {
      if (t2 && e2) {
        var r2 = Va(this);
        n2 = Ba(n2), r2.save();
        var i2 = r2.canvas, s2 = 0;
        for (const o2 of e2) {
          r2.beginPath(), e2 = t2[o2.start];
          const a2 = t2[o2.end];
          e2 && a2 && (r2.strokeStyle = Ga(n2.color, { index: s2, from: e2, to: a2 }), r2.lineWidth = Ga(n2.lineWidth, { index: s2, from: e2, to: a2 }), r2.moveTo(e2.x * i2.width, e2.y * i2.height), r2.lineTo(a2.x * i2.width, a2.y * i2.height)), ++s2, r2.stroke();
        }
        r2.restore();
      }
    }
    ua(t2, e2) {
      const n2 = Va(this);
      e2 = Ba(e2), n2.save(), n2.beginPath(), n2.lineWidth = Ga(e2.lineWidth, {}), n2.strokeStyle = Ga(e2.color, {}), n2.fillStyle = Ga(e2.fillColor, {}), n2.moveTo(t2.originX, t2.originY), n2.lineTo(t2.originX + t2.width, t2.originY), n2.lineTo(t2.originX + t2.width, t2.originY + t2.height), n2.lineTo(t2.originX, t2.originY + t2.height), n2.lineTo(t2.originX, t2.originY), n2.stroke(), n2.fill(), n2.restore();
    }
    va(t2, e2, n2 = [0, 0, 0, 255]) {
      this.l ? (function(t3, e3, n3, r2) {
        const i2 = Xa(t3);
        Ha(t3, e3, ((e4) => {
          Wa(t3, e4, n3, r2), (e4 = Va(t3)).drawImage(i2.canvas, 0, 0, e4.canvas.width, e4.canvas.height);
        }));
      })(this, t2, n2, e2) : Wa(this, t2.N(), n2, e2);
    }
    wa(t2, e2, n2) {
      this.l ? (function(t3, e3, n3, r2) {
        const i2 = Xa(t3);
        Ha(t3, e3, ((e4) => {
          za(t3, e4, n3, r2), (e4 = Va(t3)).drawImage(i2.canvas, 0, 0, e4.canvas.width, e4.canvas.height);
        }));
      })(this, t2, e2, n2) : za(this, t2.N(), e2, n2);
    }
    close() {
      this.g?.close(), this.g = void 0, this.h?.close(), this.h = void 0, this.m?.close(), this.m = void 0;
    }
  };
  function Ya(t2, e2) {
    switch (e2) {
      case 0:
        return t2.g.find(((t3) => t3 instanceof ImageData));
      case 1:
        return t2.g.find(((t3) => "undefined" != typeof ImageBitmap && t3 instanceof ImageBitmap));
      case 2:
        return t2.g.find(((t3) => "undefined" != typeof WebGLTexture && t3 instanceof WebGLTexture));
      default:
        throw Error(`Type is not supported: ${e2}`);
    }
  }
  function qa(t2) {
    var e2 = Ya(t2, 0);
    if (!e2) {
      e2 = Ja(t2);
      const n2 = Za(t2), r2 = new Uint8Array(t2.width * t2.height * 4);
      Ta(n2, e2, $a(t2)), e2.readPixels(0, 0, t2.width, t2.height, e2.RGBA, e2.UNSIGNED_BYTE, r2), Aa(n2), e2 = new ImageData(new Uint8ClampedArray(r2.buffer), t2.width, t2.height), t2.g.push(e2);
    }
    return e2;
  }
  function $a(t2) {
    let e2 = Ya(t2, 2);
    if (!e2) {
      const n2 = Ja(t2);
      e2 = Qa(t2);
      const r2 = Ya(t2, 1) || qa(t2);
      n2.texImage2D(n2.TEXTURE_2D, 0, n2.RGBA, n2.RGBA, n2.UNSIGNED_BYTE, r2), tc(t2);
    }
    return e2;
  }
  function Ja(t2) {
    if (!t2.canvas) throw Error("Conversion to different image formats require that a canvas is passed when initializing the image.");
    return t2.h || (t2.h = ga(t2.canvas.getContext("webgl2"), "You cannot use a canvas that is already bound to a different type of rendering context.")), t2.h;
  }
  function Za(t2) {
    return t2.l || (t2.l = new ba()), t2.l;
  }
  function Qa(t2) {
    const e2 = Ja(t2);
    e2.viewport(0, 0, t2.width, t2.height), e2.activeTexture(e2.TEXTURE0);
    let n2 = Ya(t2, 2);
    return n2 || (n2 = wa(Za(t2), e2), t2.g.push(n2), t2.m = true), e2.bindTexture(e2.TEXTURE_2D, n2), n2;
  }
  function tc(t2) {
    t2.h.bindTexture(t2.h.TEXTURE_2D, null);
  }
  function ec(t2) {
    const e2 = Ja(t2);
    return Ea(Za(t2), e2, true, (() => (function(t3, e3) {
      const n2 = t3.canvas;
      if (n2.width === t3.width && n2.height === t3.height) return e3();
      const r2 = n2.width, i2 = n2.height;
      return n2.width = t3.width, n2.height = t3.height, t3 = e3(), n2.width = r2, n2.height = i2, t3;
    })(t2, (() => {
      if (e2.bindFramebuffer(e2.FRAMEBUFFER, null), e2.clearColor(0, 0, 0, 0), e2.clear(e2.COLOR_BUFFER_BIT), e2.drawArrays(e2.TRIANGLE_FAN, 0, 4), !(t2.canvas instanceof OffscreenCanvas)) throw Error("Conversion to ImageBitmap requires that the MediaPipe Tasks is initialized with an OffscreenCanvas");
      return t2.canvas.transferToImageBitmap();
    }))));
  }
  Ka.prototype.close = Ka.prototype.close, Ka.prototype.drawConfidenceMask = Ka.prototype.wa, Ka.prototype.drawCategoryMask = Ka.prototype.va, Ka.prototype.drawBoundingBox = Ka.prototype.ua, Ka.prototype.drawConnectors = Ka.prototype.xa, Ka.prototype.drawLandmarks = Ka.prototype.ya, Ka.lerp = function(t2, e2, n2, r2, i2) {
    return ja(r2 * (1 - (t2 - e2) / (n2 - e2)) + i2 * (1 - (n2 - t2) / (n2 - e2)), r2, i2);
  }, Ka.clamp = ja;
  var nc = class {
    constructor(t2, e2, n2, r2, i2, s2, o2) {
      this.g = t2, this.j = e2, this.m = n2, this.canvas = r2, this.l = i2, this.width = s2, this.height = o2, (this.j || this.m) && (0 === --rc && console.error("You seem to be creating MPImage instances without invoking .close(). This leaks resources."));
    }
    Ea() {
      return !!Ya(this, 0);
    }
    la() {
      return !!Ya(this, 1);
    }
    R() {
      return !!Ya(this, 2);
    }
    Ca() {
      return qa(this);
    }
    Ba() {
      var t2 = Ya(this, 1);
      return t2 || ($a(this), Qa(this), t2 = ec(this), tc(this), this.g.push(t2), this.j = true), t2;
    }
    N() {
      return $a(this);
    }
    clone() {
      const t2 = [];
      for (const e2 of this.g) {
        let n2;
        if (e2 instanceof ImageData) n2 = new ImageData(e2.data, this.width, this.height);
        else if (e2 instanceof WebGLTexture) {
          const t3 = Ja(this), e3 = Za(this);
          t3.activeTexture(t3.TEXTURE1), n2 = wa(e3, t3), t3.bindTexture(t3.TEXTURE_2D, n2), t3.texImage2D(t3.TEXTURE_2D, 0, t3.RGBA, this.width, this.height, 0, t3.RGBA, t3.UNSIGNED_BYTE, null), t3.bindTexture(t3.TEXTURE_2D, null), Ta(e3, t3, n2), Ea(e3, t3, false, (() => {
            Qa(this), t3.clearColor(0, 0, 0, 0), t3.clear(t3.COLOR_BUFFER_BIT), t3.drawArrays(t3.TRIANGLE_FAN, 0, 4), tc(this);
          })), Aa(e3), tc(this);
        } else {
          if (!(e2 instanceof ImageBitmap)) throw Error(`Type is not supported: ${e2}`);
          $a(this), Qa(this), n2 = ec(this), tc(this);
        }
        t2.push(n2);
      }
      return new nc(t2, this.la(), this.R(), this.canvas, this.l, this.width, this.height);
    }
    close() {
      this.j && Ya(this, 1).close(), this.m && Ja(this).deleteTexture(Ya(this, 2)), rc = -1;
    }
  };
  nc.prototype.close = nc.prototype.close, nc.prototype.clone = nc.prototype.clone, nc.prototype.getAsWebGLTexture = nc.prototype.N, nc.prototype.getAsImageBitmap = nc.prototype.Ba, nc.prototype.getAsImageData = nc.prototype.Ca, nc.prototype.hasWebGLTexture = nc.prototype.R, nc.prototype.hasImageBitmap = nc.prototype.la, nc.prototype.hasImageData = nc.prototype.Ea;
  var rc = 250;
  function ic(...t2) {
    return t2.map((([t3, e2]) => ({ start: t3, end: e2 })));
  }
  var sc = /* @__PURE__ */ (function(t2) {
    return class extends t2 {
      Ja() {
        this.i._registerModelResourcesGraphService();
      }
    };
  })((oc = class {
    constructor(t2, e2) {
      this.l = true, this.i = t2, this.g = null, this.h = 0, this.m = "function" == typeof this.i._addIntToInputStream, void 0 !== e2 ? this.i.canvas = e2 : Qo() ? this.i.canvas = new OffscreenCanvas(1, 1) : (console.warn("OffscreenCanvas not supported and GraphRunner constructor glCanvas parameter is undefined. Creating backup canvas."), this.i.canvas = document.createElement("canvas"));
    }
    async initializeGraph(t2) {
      const e2 = await (await fetch(t2)).arrayBuffer();
      t2 = !(t2.endsWith(".pbtxt") || t2.endsWith(".textproto")), this.setGraph(new Uint8Array(e2), t2);
    }
    setGraphFromString(t2) {
      this.setGraph(new TextEncoder().encode(t2), false);
    }
    setGraph(t2, e2) {
      const n2 = t2.length, r2 = this.i._malloc(n2);
      this.i.HEAPU8.set(t2, r2), e2 ? this.i._changeBinaryGraph(n2, r2) : this.i._changeTextGraph(n2, r2), this.i._free(r2);
    }
    configureAudio(t2, e2, n2, r2, i2) {
      this.i._configureAudio || console.warn('Attempting to use configureAudio without support for input audio. Is build dep ":gl_graph_runner_audio" missing?'), na(this, r2 || "input_audio", ((r3) => {
        na(this, i2 = i2 || "audio_header", ((i3) => {
          this.i._configureAudio(r3, i3, t2, e2 ?? 0, n2);
        }));
      }));
    }
    setAutoResizeCanvas(t2) {
      this.l = t2;
    }
    setAutoRenderToScreen(t2) {
      this.i._setAutoRenderToScreen(t2);
    }
    setGpuBufferVerticalFlip(t2) {
      this.i.gpuOriginForWebTexturesIsBottomLeft = t2;
    }
    ca(t2) {
      sa(this, "__graph_config__", ((e2) => {
        t2(e2);
      })), na(this, "__graph_config__", ((t3) => {
        this.i._getGraphConfig(t3, void 0);
      })), delete this.i.simpleListeners.__graph_config__;
    }
    attachErrorListener(t2) {
      this.i.errorListener = t2;
    }
    attachEmptyPacketListener(t2, e2) {
      this.i.emptyPacketListeners = this.i.emptyPacketListeners || {}, this.i.emptyPacketListeners[t2] = e2;
    }
    addAudioToStream(t2, e2, n2) {
      this.addAudioToStreamWithShape(t2, 0, 0, e2, n2);
    }
    addAudioToStreamWithShape(t2, e2, n2, r2, i2) {
      const s2 = 4 * t2.length;
      this.h !== s2 && (this.g && this.i._free(this.g), this.g = this.i._malloc(s2), this.h = s2), this.i.HEAPF32.set(t2, this.g / 4), na(this, r2, ((t3) => {
        this.i._addAudioToInputStream(this.g, e2, n2, t3, i2);
      }));
    }
    addGpuBufferToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        const [r2, i2] = ra(this, t2, e3);
        this.i._addBoundTextureToStream(e3, r2, i2, n2);
      }));
    }
    addBoolToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        this.i._addBoolToInputStream(t2, e3, n2);
      }));
    }
    addDoubleToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        this.i._addDoubleToInputStream(t2, e3, n2);
      }));
    }
    addFloatToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        this.i._addFloatToInputStream(t2, e3, n2);
      }));
    }
    addIntToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        this.i._addIntToInputStream(t2, e3, n2);
      }));
    }
    addUintToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        this.i._addUintToInputStream(t2, e3, n2);
      }));
    }
    addStringToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        na(this, t2, ((t3) => {
          this.i._addStringToInputStream(t3, e3, n2);
        }));
      }));
    }
    addStringRecordToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        ia(this, Object.keys(t2), ((r2) => {
          ia(this, Object.values(t2), ((i2) => {
            this.i._addFlatHashMapToInputStream(r2, i2, Object.keys(t2).length, e3, n2);
          }));
        }));
      }));
    }
    addProtoToStream(t2, e2, n2, r2) {
      na(this, n2, ((n3) => {
        na(this, e2, ((e3) => {
          const i2 = this.i._malloc(t2.length);
          this.i.HEAPU8.set(t2, i2), this.i._addProtoToInputStream(i2, t2.length, e3, n3, r2), this.i._free(i2);
        }));
      }));
    }
    addEmptyPacketToStream(t2, e2) {
      na(this, t2, ((t3) => {
        this.i._addEmptyPacketToInputStream(t3, e2);
      }));
    }
    addBoolVectorToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        const r2 = this.i._allocateBoolVector(t2.length);
        if (!r2) throw Error("Unable to allocate new bool vector on heap.");
        for (const e4 of t2) this.i._addBoolVectorEntry(r2, e4);
        this.i._addBoolVectorToInputStream(r2, e3, n2);
      }));
    }
    addDoubleVectorToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        const r2 = this.i._allocateDoubleVector(t2.length);
        if (!r2) throw Error("Unable to allocate new double vector on heap.");
        for (const e4 of t2) this.i._addDoubleVectorEntry(r2, e4);
        this.i._addDoubleVectorToInputStream(r2, e3, n2);
      }));
    }
    addFloatVectorToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        const r2 = this.i._allocateFloatVector(t2.length);
        if (!r2) throw Error("Unable to allocate new float vector on heap.");
        for (const e4 of t2) this.i._addFloatVectorEntry(r2, e4);
        this.i._addFloatVectorToInputStream(r2, e3, n2);
      }));
    }
    addIntVectorToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        const r2 = this.i._allocateIntVector(t2.length);
        if (!r2) throw Error("Unable to allocate new int vector on heap.");
        for (const e4 of t2) this.i._addIntVectorEntry(r2, e4);
        this.i._addIntVectorToInputStream(r2, e3, n2);
      }));
    }
    addUintVectorToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        const r2 = this.i._allocateUintVector(t2.length);
        if (!r2) throw Error("Unable to allocate new unsigned int vector on heap.");
        for (const e4 of t2) this.i._addUintVectorEntry(r2, e4);
        this.i._addUintVectorToInputStream(r2, e3, n2);
      }));
    }
    addStringVectorToStream(t2, e2, n2) {
      na(this, e2, ((e3) => {
        const r2 = this.i._allocateStringVector(t2.length);
        if (!r2) throw Error("Unable to allocate new string vector on heap.");
        for (const e4 of t2) na(this, e4, ((t3) => {
          this.i._addStringVectorEntry(r2, t3);
        }));
        this.i._addStringVectorToInputStream(r2, e3, n2);
      }));
    }
    addBoolToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        this.i._addBoolToInputSidePacket(t2, e3);
      }));
    }
    addDoubleToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        this.i._addDoubleToInputSidePacket(t2, e3);
      }));
    }
    addFloatToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        this.i._addFloatToInputSidePacket(t2, e3);
      }));
    }
    addIntToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        this.i._addIntToInputSidePacket(t2, e3);
      }));
    }
    addUintToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        this.i._addUintToInputSidePacket(t2, e3);
      }));
    }
    addStringToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        na(this, t2, ((t3) => {
          this.i._addStringToInputSidePacket(t3, e3);
        }));
      }));
    }
    addProtoToInputSidePacket(t2, e2, n2) {
      na(this, n2, ((n3) => {
        na(this, e2, ((e3) => {
          const r2 = this.i._malloc(t2.length);
          this.i.HEAPU8.set(t2, r2), this.i._addProtoToInputSidePacket(r2, t2.length, e3, n3), this.i._free(r2);
        }));
      }));
    }
    addBoolVectorToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        const n2 = this.i._allocateBoolVector(t2.length);
        if (!n2) throw Error("Unable to allocate new bool vector on heap.");
        for (const e4 of t2) this.i._addBoolVectorEntry(n2, e4);
        this.i._addBoolVectorToInputSidePacket(n2, e3);
      }));
    }
    addDoubleVectorToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        const n2 = this.i._allocateDoubleVector(t2.length);
        if (!n2) throw Error("Unable to allocate new double vector on heap.");
        for (const e4 of t2) this.i._addDoubleVectorEntry(n2, e4);
        this.i._addDoubleVectorToInputSidePacket(n2, e3);
      }));
    }
    addFloatVectorToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        const n2 = this.i._allocateFloatVector(t2.length);
        if (!n2) throw Error("Unable to allocate new float vector on heap.");
        for (const e4 of t2) this.i._addFloatVectorEntry(n2, e4);
        this.i._addFloatVectorToInputSidePacket(n2, e3);
      }));
    }
    addIntVectorToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        const n2 = this.i._allocateIntVector(t2.length);
        if (!n2) throw Error("Unable to allocate new int vector on heap.");
        for (const e4 of t2) this.i._addIntVectorEntry(n2, e4);
        this.i._addIntVectorToInputSidePacket(n2, e3);
      }));
    }
    addUintVectorToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        const n2 = this.i._allocateUintVector(t2.length);
        if (!n2) throw Error("Unable to allocate new unsigned int vector on heap.");
        for (const e4 of t2) this.i._addUintVectorEntry(n2, e4);
        this.i._addUintVectorToInputSidePacket(n2, e3);
      }));
    }
    addStringVectorToInputSidePacket(t2, e2) {
      na(this, e2, ((e3) => {
        const n2 = this.i._allocateStringVector(t2.length);
        if (!n2) throw Error("Unable to allocate new string vector on heap.");
        for (const e4 of t2) na(this, e4, ((t3) => {
          this.i._addStringVectorEntry(n2, t3);
        }));
        this.i._addStringVectorToInputSidePacket(n2, e3);
      }));
    }
    attachBoolListener(t2, e2) {
      sa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachBoolListener(t3);
      }));
    }
    attachBoolVectorListener(t2, e2) {
      oa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachBoolVectorListener(t3);
      }));
    }
    attachIntListener(t2, e2) {
      sa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachIntListener(t3);
      }));
    }
    attachIntVectorListener(t2, e2) {
      oa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachIntVectorListener(t3);
      }));
    }
    attachUintListener(t2, e2) {
      sa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachUintListener(t3);
      }));
    }
    attachUintVectorListener(t2, e2) {
      oa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachUintVectorListener(t3);
      }));
    }
    attachDoubleListener(t2, e2) {
      sa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachDoubleListener(t3);
      }));
    }
    attachDoubleVectorListener(t2, e2) {
      oa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachDoubleVectorListener(t3);
      }));
    }
    attachFloatListener(t2, e2) {
      sa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachFloatListener(t3);
      }));
    }
    attachFloatVectorListener(t2, e2) {
      oa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachFloatVectorListener(t3);
      }));
    }
    attachStringListener(t2, e2) {
      sa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachStringListener(t3);
      }));
    }
    attachStringVectorListener(t2, e2) {
      oa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachStringVectorListener(t3);
      }));
    }
    attachProtoListener(t2, e2, n2) {
      sa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachProtoListener(t3, n2 || false);
      }));
    }
    attachProtoVectorListener(t2, e2, n2) {
      oa(this, t2, e2), na(this, t2, ((t3) => {
        this.i._attachProtoVectorListener(t3, n2 || false);
      }));
    }
    attachAudioListener(t2, e2, n2) {
      this.i._attachAudioListener || console.warn('Attempting to use attachAudioListener without support for output audio. Is build dep ":gl_graph_runner_audio_out" missing?'), sa(this, t2, ((t3, n3) => {
        t3 = new Float32Array(t3.buffer, t3.byteOffset, t3.length / 4), e2(t3, n3);
      })), na(this, t2, ((t3) => {
        this.i._attachAudioListener(t3, n2 || false);
      }));
    }
    finishProcessing() {
      this.i._waitUntilIdle();
    }
    closeGraph() {
      this.i._closeGraph(), this.i.simpleListeners = void 0, this.i.emptyPacketListeners = void 0;
    }
  }, class extends oc {
    get ga() {
      return this.i;
    }
    pa(t2, e2, n2) {
      na(this, e2, ((e3) => {
        const [r2, i2] = ra(this, t2, e3);
        this.ga._addBoundTextureAsImageToStream(e3, r2, i2, n2);
      }));
    }
    Z(t2, e2) {
      sa(this, t2, e2), na(this, t2, ((t3) => {
        this.ga._attachImageListener(t3);
      }));
    }
    aa(t2, e2) {
      oa(this, t2, e2), na(this, t2, ((t3) => {
        this.ga._attachImageVectorListener(t3);
      }));
    }
  }));
  var oc;
  var ac = class extends sc {
  };
  async function cc(t2, e2, n2) {
    return (async function(t3, e3, n3, r2) {
      return aa(t3, e3, n3, r2);
    })(t2, n2.canvas ?? (Qo() ? void 0 : document.createElement("canvas")), e2, n2);
  }
  function hc(t2, e2, n2, r2) {
    if (t2.U) {
      const s2 = new Ls();
      if (n2?.regionOfInterest) {
        if (!t2.oa) throw Error("This task doesn't support region-of-interest.");
        var i2 = n2.regionOfInterest;
        if (i2.left >= i2.right || i2.top >= i2.bottom) throw Error("Expected RectF with left < right and top < bottom.");
        if (i2.left < 0 || i2.top < 0 || i2.right > 1 || i2.bottom > 1) throw Error("Expected RectF values to be in [0,1].");
        Ln(s2, 1, (i2.left + i2.right) / 2), Ln(s2, 2, (i2.top + i2.bottom) / 2), Ln(s2, 4, i2.right - i2.left), Ln(s2, 3, i2.bottom - i2.top);
      } else Ln(s2, 1, 0.5), Ln(s2, 2, 0.5), Ln(s2, 4, 1), Ln(s2, 3, 1);
      if (n2?.rotationDegrees) {
        if (n2?.rotationDegrees % 90 != 0) throw Error("Expected rotation to be a multiple of 90\xB0.");
        if (Ln(s2, 5, -Math.PI * n2.rotationDegrees / 180), n2?.rotationDegrees % 180 != 0) {
          const [t3, r3] = ea(e2);
          n2 = Sn(s2, 3) * r3 / t3, i2 = Sn(s2, 4) * t3 / r3, Ln(s2, 4, n2), Ln(s2, 3, i2);
        }
      }
      t2.g.addProtoToStream(s2.g(), "mediapipe.NormalizedRect", t2.U, r2);
    }
    t2.g.pa(e2, t2.X, r2 ?? performance.now()), t2.finishProcessing();
  }
  function uc(t2, e2, n2) {
    if (t2.baseOptions?.g()) throw Error("Task is not initialized with image mode. 'runningMode' must be set to 'IMAGE'.");
    hc(t2, e2, n2, t2.C + 1);
  }
  function lc(t2, e2, n2, r2) {
    if (!t2.baseOptions?.g()) throw Error("Task is not initialized with video mode. 'runningMode' must be set to 'VIDEO'.");
    hc(t2, e2, n2, r2);
  }
  function fc(t2, e2, n2, r2) {
    var i2 = e2.data;
    const s2 = e2.width, o2 = s2 * (e2 = e2.height);
    if ((i2 instanceof Uint8Array || i2 instanceof Float32Array) && i2.length !== o2) throw Error("Unsupported channel count: " + i2.length / o2);
    return t2 = new Na([i2], n2, false, t2.g.i.canvas, t2.P, s2, e2), r2 ? t2.clone() : t2;
  }
  var dc = class extends pa {
    constructor(t2, e2, n2, r2) {
      super(t2), this.g = t2, this.X = e2, this.U = n2, this.oa = r2, this.P = new ba();
    }
    l(t2, e2 = true) {
      if ("runningMode" in t2 && Ze(this.baseOptions, 2, Jt(!!t2.runningMode && "IMAGE" !== t2.runningMode)), void 0 !== t2.canvas && this.g.i.canvas !== t2.canvas) throw Error("You must create a new task to reset the canvas.");
      return super.l(t2, e2);
    }
    close() {
      this.P.close(), super.close();
    }
  };
  dc.prototype.close = dc.prototype.close;
  var pc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "image_in", "norm_rect_in", false), this.j = { detections: [] }, wn(t2 = this.h = new zs(), 0, 1, e2 = new Xs()), Ln(this.h, 2, 0.5), Ln(this.h, 3, 0.3);
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      return "minDetectionConfidence" in t2 && Ln(this.h, 2, t2.minDetectionConfidence ?? 0.5), "minSuppressionThreshold" in t2 && Ln(this.h, 3, t2.minSuppressionThreshold ?? 0.3), this.l(t2);
    }
    F(t2, e2) {
      return this.j = { detections: [] }, uc(this, t2, e2), this.j;
    }
    G(t2, e2, n2) {
      return this.j = { detections: [] }, lc(this, t2, n2, e2), this.j;
    }
    m() {
      var t2 = new ls();
      hs(t2, "image_in"), hs(t2, "norm_rect_in"), us(t2, "detections");
      const e2 = new Qi();
      xr(e2, Ys, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.face_detector.FaceDetectorGraph"), ns(n2, "IMAGE:image_in"), ns(n2, "NORM_RECT:norm_rect_in"), rs(n2, "DETECTIONS:detections"), n2.o(e2), cs(t2, n2), this.g.attachProtoVectorListener("detections", ((t3, e3) => {
        for (const e4 of t3) t3 = ws(e4), this.j.detections.push(Xo(t3));
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("detections", ((t3) => {
        ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  pc.prototype.detectForVideo = pc.prototype.G, pc.prototype.detect = pc.prototype.F, pc.prototype.setOptions = pc.prototype.o, pc.createFromModelPath = async function(t2, e2) {
    return cc(pc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, pc.createFromModelBuffer = function(t2, e2) {
    return cc(pc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, pc.createFromOptions = function(t2, e2) {
    return cc(pc, t2, e2);
  };
  var gc = ic([61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291], [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267], [267, 269], [269, 270], [270, 409], [409, 291], [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317], [317, 402], [402, 318], [318, 324], [324, 308], [78, 191], [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415], [415, 308]);
  var mc = ic([263, 249], [249, 390], [390, 373], [373, 374], [374, 380], [380, 381], [381, 382], [382, 362], [263, 466], [466, 388], [388, 387], [387, 386], [386, 385], [385, 384], [384, 398], [398, 362]);
  var yc = ic([276, 283], [283, 282], [282, 295], [295, 285], [300, 293], [293, 334], [334, 296], [296, 336]);
  var _c = ic([474, 475], [475, 476], [476, 477], [477, 474]);
  var vc = ic([33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155], [155, 133], [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133]);
  var Ec = ic([46, 53], [53, 52], [52, 65], [65, 55], [70, 63], [63, 105], [105, 66], [66, 107]);
  var wc = ic([469, 470], [470, 471], [471, 472], [472, 469]);
  var Tc = ic([10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10]);
  var Ac = [...gc, ...mc, ...yc, ...vc, ...Ec, ...Tc];
  var bc = ic([127, 34], [34, 139], [139, 127], [11, 0], [0, 37], [37, 11], [232, 231], [231, 120], [120, 232], [72, 37], [37, 39], [39, 72], [128, 121], [121, 47], [47, 128], [232, 121], [121, 128], [128, 232], [104, 69], [69, 67], [67, 104], [175, 171], [171, 148], [148, 175], [118, 50], [50, 101], [101, 118], [73, 39], [39, 40], [40, 73], [9, 151], [151, 108], [108, 9], [48, 115], [115, 131], [131, 48], [194, 204], [204, 211], [211, 194], [74, 40], [40, 185], [185, 74], [80, 42], [42, 183], [183, 80], [40, 92], [92, 186], [186, 40], [230, 229], [229, 118], [118, 230], [202, 212], [212, 214], [214, 202], [83, 18], [18, 17], [17, 83], [76, 61], [61, 146], [146, 76], [160, 29], [29, 30], [30, 160], [56, 157], [157, 173], [173, 56], [106, 204], [204, 194], [194, 106], [135, 214], [214, 192], [192, 135], [203, 165], [165, 98], [98, 203], [21, 71], [71, 68], [68, 21], [51, 45], [45, 4], [4, 51], [144, 24], [24, 23], [23, 144], [77, 146], [146, 91], [91, 77], [205, 50], [50, 187], [187, 205], [201, 200], [200, 18], [18, 201], [91, 106], [106, 182], [182, 91], [90, 91], [91, 181], [181, 90], [85, 84], [84, 17], [17, 85], [206, 203], [203, 36], [36, 206], [148, 171], [171, 140], [140, 148], [92, 40], [40, 39], [39, 92], [193, 189], [189, 244], [244, 193], [159, 158], [158, 28], [28, 159], [247, 246], [246, 161], [161, 247], [236, 3], [3, 196], [196, 236], [54, 68], [68, 104], [104, 54], [193, 168], [168, 8], [8, 193], [117, 228], [228, 31], [31, 117], [189, 193], [193, 55], [55, 189], [98, 97], [97, 99], [99, 98], [126, 47], [47, 100], [100, 126], [166, 79], [79, 218], [218, 166], [155, 154], [154, 26], [26, 155], [209, 49], [49, 131], [131, 209], [135, 136], [136, 150], [150, 135], [47, 126], [126, 217], [217, 47], [223, 52], [52, 53], [53, 223], [45, 51], [51, 134], [134, 45], [211, 170], [170, 140], [140, 211], [67, 69], [69, 108], [108, 67], [43, 106], [106, 91], [91, 43], [230, 119], [119, 120], [120, 230], [226, 130], [130, 247], [247, 226], [63, 53], [53, 52], [52, 63], [238, 20], [20, 242], [242, 238], [46, 70], [70, 156], [156, 46], [78, 62], [62, 96], [96, 78], [46, 53], [53, 63], [63, 46], [143, 34], [34, 227], [227, 143], [123, 117], [117, 111], [111, 123], [44, 125], [125, 19], [19, 44], [236, 134], [134, 51], [51, 236], [216, 206], [206, 205], [205, 216], [154, 153], [153, 22], [22, 154], [39, 37], [37, 167], [167, 39], [200, 201], [201, 208], [208, 200], [36, 142], [142, 100], [100, 36], [57, 212], [212, 202], [202, 57], [20, 60], [60, 99], [99, 20], [28, 158], [158, 157], [157, 28], [35, 226], [226, 113], [113, 35], [160, 159], [159, 27], [27, 160], [204, 202], [202, 210], [210, 204], [113, 225], [225, 46], [46, 113], [43, 202], [202, 204], [204, 43], [62, 76], [76, 77], [77, 62], [137, 123], [123, 116], [116, 137], [41, 38], [38, 72], [72, 41], [203, 129], [129, 142], [142, 203], [64, 98], [98, 240], [240, 64], [49, 102], [102, 64], [64, 49], [41, 73], [73, 74], [74, 41], [212, 216], [216, 207], [207, 212], [42, 74], [74, 184], [184, 42], [169, 170], [170, 211], [211, 169], [170, 149], [149, 176], [176, 170], [105, 66], [66, 69], [69, 105], [122, 6], [6, 168], [168, 122], [123, 147], [147, 187], [187, 123], [96, 77], [77, 90], [90, 96], [65, 55], [55, 107], [107, 65], [89, 90], [90, 180], [180, 89], [101, 100], [100, 120], [120, 101], [63, 105], [105, 104], [104, 63], [93, 137], [137, 227], [227, 93], [15, 86], [86, 85], [85, 15], [129, 102], [102, 49], [49, 129], [14, 87], [87, 86], [86, 14], [55, 8], [8, 9], [9, 55], [100, 47], [47, 121], [121, 100], [145, 23], [23, 22], [22, 145], [88, 89], [89, 179], [179, 88], [6, 122], [122, 196], [196, 6], [88, 95], [95, 96], [96, 88], [138, 172], [172, 136], [136, 138], [215, 58], [58, 172], [172, 215], [115, 48], [48, 219], [219, 115], [42, 80], [80, 81], [81, 42], [195, 3], [3, 51], [51, 195], [43, 146], [146, 61], [61, 43], [171, 175], [175, 199], [199, 171], [81, 82], [82, 38], [38, 81], [53, 46], [46, 225], [225, 53], [144, 163], [163, 110], [110, 144], [52, 65], [65, 66], [66, 52], [229, 228], [228, 117], [117, 229], [34, 127], [127, 234], [234, 34], [107, 108], [108, 69], [69, 107], [109, 108], [108, 151], [151, 109], [48, 64], [64, 235], [235, 48], [62, 78], [78, 191], [191, 62], [129, 209], [209, 126], [126, 129], [111, 35], [35, 143], [143, 111], [117, 123], [123, 50], [50, 117], [222, 65], [65, 52], [52, 222], [19, 125], [125, 141], [141, 19], [221, 55], [55, 65], [65, 221], [3, 195], [195, 197], [197, 3], [25, 7], [7, 33], [33, 25], [220, 237], [237, 44], [44, 220], [70, 71], [71, 139], [139, 70], [122, 193], [193, 245], [245, 122], [247, 130], [130, 33], [33, 247], [71, 21], [21, 162], [162, 71], [170, 169], [169, 150], [150, 170], [188, 174], [174, 196], [196, 188], [216, 186], [186, 92], [92, 216], [2, 97], [97, 167], [167, 2], [141, 125], [125, 241], [241, 141], [164, 167], [167, 37], [37, 164], [72, 38], [38, 12], [12, 72], [38, 82], [82, 13], [13, 38], [63, 68], [68, 71], [71, 63], [226, 35], [35, 111], [111, 226], [101, 50], [50, 205], [205, 101], [206, 92], [92, 165], [165, 206], [209, 198], [198, 217], [217, 209], [165, 167], [167, 97], [97, 165], [220, 115], [115, 218], [218, 220], [133, 112], [112, 243], [243, 133], [239, 238], [238, 241], [241, 239], [214, 135], [135, 169], [169, 214], [190, 173], [173, 133], [133, 190], [171, 208], [208, 32], [32, 171], [125, 44], [44, 237], [237, 125], [86, 87], [87, 178], [178, 86], [85, 86], [86, 179], [179, 85], [84, 85], [85, 180], [180, 84], [83, 84], [84, 181], [181, 83], [201, 83], [83, 182], [182, 201], [137, 93], [93, 132], [132, 137], [76, 62], [62, 183], [183, 76], [61, 76], [76, 184], [184, 61], [57, 61], [61, 185], [185, 57], [212, 57], [57, 186], [186, 212], [214, 207], [207, 187], [187, 214], [34, 143], [143, 156], [156, 34], [79, 239], [239, 237], [237, 79], [123, 137], [137, 177], [177, 123], [44, 1], [1, 4], [4, 44], [201, 194], [194, 32], [32, 201], [64, 102], [102, 129], [129, 64], [213, 215], [215, 138], [138, 213], [59, 166], [166, 219], [219, 59], [242, 99], [99, 97], [97, 242], [2, 94], [94, 141], [141, 2], [75, 59], [59, 235], [235, 75], [24, 110], [110, 228], [228, 24], [25, 130], [130, 226], [226, 25], [23, 24], [24, 229], [229, 23], [22, 23], [23, 230], [230, 22], [26, 22], [22, 231], [231, 26], [112, 26], [26, 232], [232, 112], [189, 190], [190, 243], [243, 189], [221, 56], [56, 190], [190, 221], [28, 56], [56, 221], [221, 28], [27, 28], [28, 222], [222, 27], [29, 27], [27, 223], [223, 29], [30, 29], [29, 224], [224, 30], [247, 30], [30, 225], [225, 247], [238, 79], [79, 20], [20, 238], [166, 59], [59, 75], [75, 166], [60, 75], [75, 240], [240, 60], [147, 177], [177, 215], [215, 147], [20, 79], [79, 166], [166, 20], [187, 147], [147, 213], [213, 187], [112, 233], [233, 244], [244, 112], [233, 128], [128, 245], [245, 233], [128, 114], [114, 188], [188, 128], [114, 217], [217, 174], [174, 114], [131, 115], [115, 220], [220, 131], [217, 198], [198, 236], [236, 217], [198, 131], [131, 134], [134, 198], [177, 132], [132, 58], [58, 177], [143, 35], [35, 124], [124, 143], [110, 163], [163, 7], [7, 110], [228, 110], [110, 25], [25, 228], [356, 389], [389, 368], [368, 356], [11, 302], [302, 267], [267, 11], [452, 350], [350, 349], [349, 452], [302, 303], [303, 269], [269, 302], [357, 343], [343, 277], [277, 357], [452, 453], [453, 357], [357, 452], [333, 332], [332, 297], [297, 333], [175, 152], [152, 377], [377, 175], [347, 348], [348, 330], [330, 347], [303, 304], [304, 270], [270, 303], [9, 336], [336, 337], [337, 9], [278, 279], [279, 360], [360, 278], [418, 262], [262, 431], [431, 418], [304, 408], [408, 409], [409, 304], [310, 415], [415, 407], [407, 310], [270, 409], [409, 410], [410, 270], [450, 348], [348, 347], [347, 450], [422, 430], [430, 434], [434, 422], [313, 314], [314, 17], [17, 313], [306, 307], [307, 375], [375, 306], [387, 388], [388, 260], [260, 387], [286, 414], [414, 398], [398, 286], [335, 406], [406, 418], [418, 335], [364, 367], [367, 416], [416, 364], [423, 358], [358, 327], [327, 423], [251, 284], [284, 298], [298, 251], [281, 5], [5, 4], [4, 281], [373, 374], [374, 253], [253, 373], [307, 320], [320, 321], [321, 307], [425, 427], [427, 411], [411, 425], [421, 313], [313, 18], [18, 421], [321, 405], [405, 406], [406, 321], [320, 404], [404, 405], [405, 320], [315, 16], [16, 17], [17, 315], [426, 425], [425, 266], [266, 426], [377, 400], [400, 369], [369, 377], [322, 391], [391, 269], [269, 322], [417, 465], [465, 464], [464, 417], [386, 257], [257, 258], [258, 386], [466, 260], [260, 388], [388, 466], [456, 399], [399, 419], [419, 456], [284, 332], [332, 333], [333, 284], [417, 285], [285, 8], [8, 417], [346, 340], [340, 261], [261, 346], [413, 441], [441, 285], [285, 413], [327, 460], [460, 328], [328, 327], [355, 371], [371, 329], [329, 355], [392, 439], [439, 438], [438, 392], [382, 341], [341, 256], [256, 382], [429, 420], [420, 360], [360, 429], [364, 394], [394, 379], [379, 364], [277, 343], [343, 437], [437, 277], [443, 444], [444, 283], [283, 443], [275, 440], [440, 363], [363, 275], [431, 262], [262, 369], [369, 431], [297, 338], [338, 337], [337, 297], [273, 375], [375, 321], [321, 273], [450, 451], [451, 349], [349, 450], [446, 342], [342, 467], [467, 446], [293, 334], [334, 282], [282, 293], [458, 461], [461, 462], [462, 458], [276, 353], [353, 383], [383, 276], [308, 324], [324, 325], [325, 308], [276, 300], [300, 293], [293, 276], [372, 345], [345, 447], [447, 372], [352, 345], [345, 340], [340, 352], [274, 1], [1, 19], [19, 274], [456, 248], [248, 281], [281, 456], [436, 427], [427, 425], [425, 436], [381, 256], [256, 252], [252, 381], [269, 391], [391, 393], [393, 269], [200, 199], [199, 428], [428, 200], [266, 330], [330, 329], [329, 266], [287, 273], [273, 422], [422, 287], [250, 462], [462, 328], [328, 250], [258, 286], [286, 384], [384, 258], [265, 353], [353, 342], [342, 265], [387, 259], [259, 257], [257, 387], [424, 431], [431, 430], [430, 424], [342, 353], [353, 276], [276, 342], [273, 335], [335, 424], [424, 273], [292, 325], [325, 307], [307, 292], [366, 447], [447, 345], [345, 366], [271, 303], [303, 302], [302, 271], [423, 266], [266, 371], [371, 423], [294, 455], [455, 460], [460, 294], [279, 278], [278, 294], [294, 279], [271, 272], [272, 304], [304, 271], [432, 434], [434, 427], [427, 432], [272, 407], [407, 408], [408, 272], [394, 430], [430, 431], [431, 394], [395, 369], [369, 400], [400, 395], [334, 333], [333, 299], [299, 334], [351, 417], [417, 168], [168, 351], [352, 280], [280, 411], [411, 352], [325, 319], [319, 320], [320, 325], [295, 296], [296, 336], [336, 295], [319, 403], [403, 404], [404, 319], [330, 348], [348, 349], [349, 330], [293, 298], [298, 333], [333, 293], [323, 454], [454, 447], [447, 323], [15, 16], [16, 315], [315, 15], [358, 429], [429, 279], [279, 358], [14, 15], [15, 316], [316, 14], [285, 336], [336, 9], [9, 285], [329, 349], [349, 350], [350, 329], [374, 380], [380, 252], [252, 374], [318, 402], [402, 403], [403, 318], [6, 197], [197, 419], [419, 6], [318, 319], [319, 325], [325, 318], [367, 364], [364, 365], [365, 367], [435, 367], [367, 397], [397, 435], [344, 438], [438, 439], [439, 344], [272, 271], [271, 311], [311, 272], [195, 5], [5, 281], [281, 195], [273, 287], [287, 291], [291, 273], [396, 428], [428, 199], [199, 396], [311, 271], [271, 268], [268, 311], [283, 444], [444, 445], [445, 283], [373, 254], [254, 339], [339, 373], [282, 334], [334, 296], [296, 282], [449, 347], [347, 346], [346, 449], [264, 447], [447, 454], [454, 264], [336, 296], [296, 299], [299, 336], [338, 10], [10, 151], [151, 338], [278, 439], [439, 455], [455, 278], [292, 407], [407, 415], [415, 292], [358, 371], [371, 355], [355, 358], [340, 345], [345, 372], [372, 340], [346, 347], [347, 280], [280, 346], [442, 443], [443, 282], [282, 442], [19, 94], [94, 370], [370, 19], [441, 442], [442, 295], [295, 441], [248, 419], [419, 197], [197, 248], [263, 255], [255, 359], [359, 263], [440, 275], [275, 274], [274, 440], [300, 383], [383, 368], [368, 300], [351, 412], [412, 465], [465, 351], [263, 467], [467, 466], [466, 263], [301, 368], [368, 389], [389, 301], [395, 378], [378, 379], [379, 395], [412, 351], [351, 419], [419, 412], [436, 426], [426, 322], [322, 436], [2, 164], [164, 393], [393, 2], [370, 462], [462, 461], [461, 370], [164, 0], [0, 267], [267, 164], [302, 11], [11, 12], [12, 302], [268, 12], [12, 13], [13, 268], [293, 300], [300, 301], [301, 293], [446, 261], [261, 340], [340, 446], [330, 266], [266, 425], [425, 330], [426, 423], [423, 391], [391, 426], [429, 355], [355, 437], [437, 429], [391, 327], [327, 326], [326, 391], [440, 457], [457, 438], [438, 440], [341, 382], [382, 362], [362, 341], [459, 457], [457, 461], [461, 459], [434, 430], [430, 394], [394, 434], [414, 463], [463, 362], [362, 414], [396, 369], [369, 262], [262, 396], [354, 461], [461, 457], [457, 354], [316, 403], [403, 402], [402, 316], [315, 404], [404, 403], [403, 315], [314, 405], [405, 404], [404, 314], [313, 406], [406, 405], [405, 313], [421, 418], [418, 406], [406, 421], [366, 401], [401, 361], [361, 366], [306, 408], [408, 407], [407, 306], [291, 409], [409, 408], [408, 291], [287, 410], [410, 409], [409, 287], [432, 436], [436, 410], [410, 432], [434, 416], [416, 411], [411, 434], [264, 368], [368, 383], [383, 264], [309, 438], [438, 457], [457, 309], [352, 376], [376, 401], [401, 352], [274, 275], [275, 4], [4, 274], [421, 428], [428, 262], [262, 421], [294, 327], [327, 358], [358, 294], [433, 416], [416, 367], [367, 433], [289, 455], [455, 439], [439, 289], [462, 370], [370, 326], [326, 462], [2, 326], [326, 370], [370, 2], [305, 460], [460, 455], [455, 305], [254, 449], [449, 448], [448, 254], [255, 261], [261, 446], [446, 255], [253, 450], [450, 449], [449, 253], [252, 451], [451, 450], [450, 252], [256, 452], [452, 451], [451, 256], [341, 453], [453, 452], [452, 341], [413, 464], [464, 463], [463, 413], [441, 413], [413, 414], [414, 441], [258, 442], [442, 441], [441, 258], [257, 443], [443, 442], [442, 257], [259, 444], [444, 443], [443, 259], [260, 445], [445, 444], [444, 260], [467, 342], [342, 445], [445, 467], [459, 458], [458, 250], [250, 459], [289, 392], [392, 290], [290, 289], [290, 328], [328, 460], [460, 290], [376, 433], [433, 435], [435, 376], [250, 290], [290, 392], [392, 250], [411, 416], [416, 433], [433, 411], [341, 463], [463, 464], [464, 341], [453, 464], [464, 465], [465, 453], [357, 465], [465, 412], [412, 357], [343, 412], [412, 399], [399, 343], [360, 363], [363, 440], [440, 360], [437, 399], [399, 456], [456, 437], [420, 456], [456, 363], [363, 420], [401, 435], [435, 288], [288, 401], [372, 383], [383, 353], [353, 372], [339, 255], [255, 249], [249, 339], [448, 261], [261, 255], [255, 448], [133, 243], [243, 190], [190, 133], [133, 155], [155, 112], [112, 133], [33, 246], [246, 247], [247, 33], [33, 130], [130, 25], [25, 33], [398, 384], [384, 286], [286, 398], [362, 398], [398, 414], [414, 362], [362, 463], [463, 341], [341, 362], [263, 359], [359, 467], [467, 263], [263, 249], [249, 255], [255, 263], [466, 467], [467, 260], [260, 466], [75, 60], [60, 166], [166, 75], [238, 239], [239, 79], [79, 238], [162, 127], [127, 139], [139, 162], [72, 11], [11, 37], [37, 72], [121, 232], [232, 120], [120, 121], [73, 72], [72, 39], [39, 73], [114, 128], [128, 47], [47, 114], [233, 232], [232, 128], [128, 233], [103, 104], [104, 67], [67, 103], [152, 175], [175, 148], [148, 152], [119, 118], [118, 101], [101, 119], [74, 73], [73, 40], [40, 74], [107, 9], [9, 108], [108, 107], [49, 48], [48, 131], [131, 49], [32, 194], [194, 211], [211, 32], [184, 74], [74, 185], [185, 184], [191, 80], [80, 183], [183, 191], [185, 40], [40, 186], [186, 185], [119, 230], [230, 118], [118, 119], [210, 202], [202, 214], [214, 210], [84, 83], [83, 17], [17, 84], [77, 76], [76, 146], [146, 77], [161, 160], [160, 30], [30, 161], [190, 56], [56, 173], [173, 190], [182, 106], [106, 194], [194, 182], [138, 135], [135, 192], [192, 138], [129, 203], [203, 98], [98, 129], [54, 21], [21, 68], [68, 54], [5, 51], [51, 4], [4, 5], [145, 144], [144, 23], [23, 145], [90, 77], [77, 91], [91, 90], [207, 205], [205, 187], [187, 207], [83, 201], [201, 18], [18, 83], [181, 91], [91, 182], [182, 181], [180, 90], [90, 181], [181, 180], [16, 85], [85, 17], [17, 16], [205, 206], [206, 36], [36, 205], [176, 148], [148, 140], [140, 176], [165, 92], [92, 39], [39, 165], [245, 193], [193, 244], [244, 245], [27, 159], [159, 28], [28, 27], [30, 247], [247, 161], [161, 30], [174, 236], [236, 196], [196, 174], [103, 54], [54, 104], [104, 103], [55, 193], [193, 8], [8, 55], [111, 117], [117, 31], [31, 111], [221, 189], [189, 55], [55, 221], [240, 98], [98, 99], [99, 240], [142, 126], [126, 100], [100, 142], [219, 166], [166, 218], [218, 219], [112, 155], [155, 26], [26, 112], [198, 209], [209, 131], [131, 198], [169, 135], [135, 150], [150, 169], [114, 47], [47, 217], [217, 114], [224, 223], [223, 53], [53, 224], [220, 45], [45, 134], [134, 220], [32, 211], [211, 140], [140, 32], [109, 67], [67, 108], [108, 109], [146, 43], [43, 91], [91, 146], [231, 230], [230, 120], [120, 231], [113, 226], [226, 247], [247, 113], [105, 63], [63, 52], [52, 105], [241, 238], [238, 242], [242, 241], [124, 46], [46, 156], [156, 124], [95, 78], [78, 96], [96, 95], [70, 46], [46, 63], [63, 70], [116, 143], [143, 227], [227, 116], [116, 123], [123, 111], [111, 116], [1, 44], [44, 19], [19, 1], [3, 236], [236, 51], [51, 3], [207, 216], [216, 205], [205, 207], [26, 154], [154, 22], [22, 26], [165, 39], [39, 167], [167, 165], [199, 200], [200, 208], [208, 199], [101, 36], [36, 100], [100, 101], [43, 57], [57, 202], [202, 43], [242, 20], [20, 99], [99, 242], [56, 28], [28, 157], [157, 56], [124, 35], [35, 113], [113, 124], [29, 160], [160, 27], [27, 29], [211, 204], [204, 210], [210, 211], [124, 113], [113, 46], [46, 124], [106, 43], [43, 204], [204, 106], [96, 62], [62, 77], [77, 96], [227, 137], [137, 116], [116, 227], [73, 41], [41, 72], [72, 73], [36, 203], [203, 142], [142, 36], [235, 64], [64, 240], [240, 235], [48, 49], [49, 64], [64, 48], [42, 41], [41, 74], [74, 42], [214, 212], [212, 207], [207, 214], [183, 42], [42, 184], [184, 183], [210, 169], [169, 211], [211, 210], [140, 170], [170, 176], [176, 140], [104, 105], [105, 69], [69, 104], [193, 122], [122, 168], [168, 193], [50, 123], [123, 187], [187, 50], [89, 96], [96, 90], [90, 89], [66, 65], [65, 107], [107, 66], [179, 89], [89, 180], [180, 179], [119, 101], [101, 120], [120, 119], [68, 63], [63, 104], [104, 68], [234, 93], [93, 227], [227, 234], [16, 15], [15, 85], [85, 16], [209, 129], [129, 49], [49, 209], [15, 14], [14, 86], [86, 15], [107, 55], [55, 9], [9, 107], [120, 100], [100, 121], [121, 120], [153, 145], [145, 22], [22, 153], [178, 88], [88, 179], [179, 178], [197, 6], [6, 196], [196, 197], [89, 88], [88, 96], [96, 89], [135, 138], [138, 136], [136, 135], [138, 215], [215, 172], [172, 138], [218, 115], [115, 219], [219, 218], [41, 42], [42, 81], [81, 41], [5, 195], [195, 51], [51, 5], [57, 43], [43, 61], [61, 57], [208, 171], [171, 199], [199, 208], [41, 81], [81, 38], [38, 41], [224, 53], [53, 225], [225, 224], [24, 144], [144, 110], [110, 24], [105, 52], [52, 66], [66, 105], [118, 229], [229, 117], [117, 118], [227, 34], [34, 234], [234, 227], [66, 107], [107, 69], [69, 66], [10, 109], [109, 151], [151, 10], [219, 48], [48, 235], [235, 219], [183, 62], [62, 191], [191, 183], [142, 129], [129, 126], [126, 142], [116, 111], [111, 143], [143, 116], [118, 117], [117, 50], [50, 118], [223, 222], [222, 52], [52, 223], [94, 19], [19, 141], [141, 94], [222, 221], [221, 65], [65, 222], [196, 3], [3, 197], [197, 196], [45, 220], [220, 44], [44, 45], [156, 70], [70, 139], [139, 156], [188, 122], [122, 245], [245, 188], [139, 71], [71, 162], [162, 139], [149, 170], [170, 150], [150, 149], [122, 188], [188, 196], [196, 122], [206, 216], [216, 92], [92, 206], [164, 2], [2, 167], [167, 164], [242, 141], [141, 241], [241, 242], [0, 164], [164, 37], [37, 0], [11, 72], [72, 12], [12, 11], [12, 38], [38, 13], [13, 12], [70, 63], [63, 71], [71, 70], [31, 226], [226, 111], [111, 31], [36, 101], [101, 205], [205, 36], [203, 206], [206, 165], [165, 203], [126, 209], [209, 217], [217, 126], [98, 165], [165, 97], [97, 98], [237, 220], [220, 218], [218, 237], [237, 239], [239, 241], [241, 237], [210, 214], [214, 169], [169, 210], [140, 171], [171, 32], [32, 140], [241, 125], [125, 237], [237, 241], [179, 86], [86, 178], [178, 179], [180, 85], [85, 179], [179, 180], [181, 84], [84, 180], [180, 181], [182, 83], [83, 181], [181, 182], [194, 201], [201, 182], [182, 194], [177, 137], [137, 132], [132, 177], [184, 76], [76, 183], [183, 184], [185, 61], [61, 184], [184, 185], [186, 57], [57, 185], [185, 186], [216, 212], [212, 186], [186, 216], [192, 214], [214, 187], [187, 192], [139, 34], [34, 156], [156, 139], [218, 79], [79, 237], [237, 218], [147, 123], [123, 177], [177, 147], [45, 44], [44, 4], [4, 45], [208, 201], [201, 32], [32, 208], [98, 64], [64, 129], [129, 98], [192, 213], [213, 138], [138, 192], [235, 59], [59, 219], [219, 235], [141, 242], [242, 97], [97, 141], [97, 2], [2, 141], [141, 97], [240, 75], [75, 235], [235, 240], [229, 24], [24, 228], [228, 229], [31, 25], [25, 226], [226, 31], [230, 23], [23, 229], [229, 230], [231, 22], [22, 230], [230, 231], [232, 26], [26, 231], [231, 232], [233, 112], [112, 232], [232, 233], [244, 189], [189, 243], [243, 244], [189, 221], [221, 190], [190, 189], [222, 28], [28, 221], [221, 222], [223, 27], [27, 222], [222, 223], [224, 29], [29, 223], [223, 224], [225, 30], [30, 224], [224, 225], [113, 247], [247, 225], [225, 113], [99, 60], [60, 240], [240, 99], [213, 147], [147, 215], [215, 213], [60, 20], [20, 166], [166, 60], [192, 187], [187, 213], [213, 192], [243, 112], [112, 244], [244, 243], [244, 233], [233, 245], [245, 244], [245, 128], [128, 188], [188, 245], [188, 114], [114, 174], [174, 188], [134, 131], [131, 220], [220, 134], [174, 217], [217, 236], [236, 174], [236, 198], [198, 134], [134, 236], [215, 177], [177, 58], [58, 215], [156, 143], [143, 124], [124, 156], [25, 110], [110, 7], [7, 25], [31, 228], [228, 25], [25, 31], [264, 356], [356, 368], [368, 264], [0, 11], [11, 267], [267, 0], [451, 452], [452, 349], [349, 451], [267, 302], [302, 269], [269, 267], [350, 357], [357, 277], [277, 350], [350, 452], [452, 357], [357, 350], [299, 333], [333, 297], [297, 299], [396, 175], [175, 377], [377, 396], [280, 347], [347, 330], [330, 280], [269, 303], [303, 270], [270, 269], [151, 9], [9, 337], [337, 151], [344, 278], [278, 360], [360, 344], [424, 418], [418, 431], [431, 424], [270, 304], [304, 409], [409, 270], [272, 310], [310, 407], [407, 272], [322, 270], [270, 410], [410, 322], [449, 450], [450, 347], [347, 449], [432, 422], [422, 434], [434, 432], [18, 313], [313, 17], [17, 18], [291, 306], [306, 375], [375, 291], [259, 387], [387, 260], [260, 259], [424, 335], [335, 418], [418, 424], [434, 364], [364, 416], [416, 434], [391, 423], [423, 327], [327, 391], [301, 251], [251, 298], [298, 301], [275, 281], [281, 4], [4, 275], [254, 373], [373, 253], [253, 254], [375, 307], [307, 321], [321, 375], [280, 425], [425, 411], [411, 280], [200, 421], [421, 18], [18, 200], [335, 321], [321, 406], [406, 335], [321, 320], [320, 405], [405, 321], [314, 315], [315, 17], [17, 314], [423, 426], [426, 266], [266, 423], [396, 377], [377, 369], [369, 396], [270, 322], [322, 269], [269, 270], [413, 417], [417, 464], [464, 413], [385, 386], [386, 258], [258, 385], [248, 456], [456, 419], [419, 248], [298, 284], [284, 333], [333, 298], [168, 417], [417, 8], [8, 168], [448, 346], [346, 261], [261, 448], [417, 413], [413, 285], [285, 417], [326, 327], [327, 328], [328, 326], [277, 355], [355, 329], [329, 277], [309, 392], [392, 438], [438, 309], [381, 382], [382, 256], [256, 381], [279, 429], [429, 360], [360, 279], [365, 364], [364, 379], [379, 365], [355, 277], [277, 437], [437, 355], [282, 443], [443, 283], [283, 282], [281, 275], [275, 363], [363, 281], [395, 431], [431, 369], [369, 395], [299, 297], [297, 337], [337, 299], [335, 273], [273, 321], [321, 335], [348, 450], [450, 349], [349, 348], [359, 446], [446, 467], [467, 359], [283, 293], [293, 282], [282, 283], [250, 458], [458, 462], [462, 250], [300, 276], [276, 383], [383, 300], [292, 308], [308, 325], [325, 292], [283, 276], [276, 293], [293, 283], [264, 372], [372, 447], [447, 264], [346, 352], [352, 340], [340, 346], [354, 274], [274, 19], [19, 354], [363, 456], [456, 281], [281, 363], [426, 436], [436, 425], [425, 426], [380, 381], [381, 252], [252, 380], [267, 269], [269, 393], [393, 267], [421, 200], [200, 428], [428, 421], [371, 266], [266, 329], [329, 371], [432, 287], [287, 422], [422, 432], [290, 250], [250, 328], [328, 290], [385, 258], [258, 384], [384, 385], [446, 265], [265, 342], [342, 446], [386, 387], [387, 257], [257, 386], [422, 424], [424, 430], [430, 422], [445, 342], [342, 276], [276, 445], [422, 273], [273, 424], [424, 422], [306, 292], [292, 307], [307, 306], [352, 366], [366, 345], [345, 352], [268, 271], [271, 302], [302, 268], [358, 423], [423, 371], [371, 358], [327, 294], [294, 460], [460, 327], [331, 279], [279, 294], [294, 331], [303, 271], [271, 304], [304, 303], [436, 432], [432, 427], [427, 436], [304, 272], [272, 408], [408, 304], [395, 394], [394, 431], [431, 395], [378, 395], [395, 400], [400, 378], [296, 334], [334, 299], [299, 296], [6, 351], [351, 168], [168, 6], [376, 352], [352, 411], [411, 376], [307, 325], [325, 320], [320, 307], [285, 295], [295, 336], [336, 285], [320, 319], [319, 404], [404, 320], [329, 330], [330, 349], [349, 329], [334, 293], [293, 333], [333, 334], [366, 323], [323, 447], [447, 366], [316, 15], [15, 315], [315, 316], [331, 358], [358, 279], [279, 331], [317, 14], [14, 316], [316, 317], [8, 285], [285, 9], [9, 8], [277, 329], [329, 350], [350, 277], [253, 374], [374, 252], [252, 253], [319, 318], [318, 403], [403, 319], [351, 6], [6, 419], [419, 351], [324, 318], [318, 325], [325, 324], [397, 367], [367, 365], [365, 397], [288, 435], [435, 397], [397, 288], [278, 344], [344, 439], [439, 278], [310, 272], [272, 311], [311, 310], [248, 195], [195, 281], [281, 248], [375, 273], [273, 291], [291, 375], [175, 396], [396, 199], [199, 175], [312, 311], [311, 268], [268, 312], [276, 283], [283, 445], [445, 276], [390, 373], [373, 339], [339, 390], [295, 282], [282, 296], [296, 295], [448, 449], [449, 346], [346, 448], [356, 264], [264, 454], [454, 356], [337, 336], [336, 299], [299, 337], [337, 338], [338, 151], [151, 337], [294, 278], [278, 455], [455, 294], [308, 292], [292, 415], [415, 308], [429, 358], [358, 355], [355, 429], [265, 340], [340, 372], [372, 265], [352, 346], [346, 280], [280, 352], [295, 442], [442, 282], [282, 295], [354, 19], [19, 370], [370, 354], [285, 441], [441, 295], [295, 285], [195, 248], [248, 197], [197, 195], [457, 440], [440, 274], [274, 457], [301, 300], [300, 368], [368, 301], [417, 351], [351, 465], [465, 417], [251, 301], [301, 389], [389, 251], [394, 395], [395, 379], [379, 394], [399, 412], [412, 419], [419, 399], [410, 436], [436, 322], [322, 410], [326, 2], [2, 393], [393, 326], [354, 370], [370, 461], [461, 354], [393, 164], [164, 267], [267, 393], [268, 302], [302, 12], [12, 268], [312, 268], [268, 13], [13, 312], [298, 293], [293, 301], [301, 298], [265, 446], [446, 340], [340, 265], [280, 330], [330, 425], [425, 280], [322, 426], [426, 391], [391, 322], [420, 429], [429, 437], [437, 420], [393, 391], [391, 326], [326, 393], [344, 440], [440, 438], [438, 344], [458, 459], [459, 461], [461, 458], [364, 434], [434, 394], [394, 364], [428, 396], [396, 262], [262, 428], [274, 354], [354, 457], [457, 274], [317, 316], [316, 402], [402, 317], [316, 315], [315, 403], [403, 316], [315, 314], [314, 404], [404, 315], [314, 313], [313, 405], [405, 314], [313, 421], [421, 406], [406, 313], [323, 366], [366, 361], [361, 323], [292, 306], [306, 407], [407, 292], [306, 291], [291, 408], [408, 306], [291, 287], [287, 409], [409, 291], [287, 432], [432, 410], [410, 287], [427, 434], [434, 411], [411, 427], [372, 264], [264, 383], [383, 372], [459, 309], [309, 457], [457, 459], [366, 352], [352, 401], [401, 366], [1, 274], [274, 4], [4, 1], [418, 421], [421, 262], [262, 418], [331, 294], [294, 358], [358, 331], [435, 433], [433, 367], [367, 435], [392, 289], [289, 439], [439, 392], [328, 462], [462, 326], [326, 328], [94, 2], [2, 370], [370, 94], [289, 305], [305, 455], [455, 289], [339, 254], [254, 448], [448, 339], [359, 255], [255, 446], [446, 359], [254, 253], [253, 449], [449, 254], [253, 252], [252, 450], [450, 253], [252, 256], [256, 451], [451, 252], [256, 341], [341, 452], [452, 256], [414, 413], [413, 463], [463, 414], [286, 441], [441, 414], [414, 286], [286, 258], [258, 441], [441, 286], [258, 257], [257, 442], [442, 258], [257, 259], [259, 443], [443, 257], [259, 260], [260, 444], [444, 259], [260, 467], [467, 445], [445, 260], [309, 459], [459, 250], [250, 309], [305, 289], [289, 290], [290, 305], [305, 290], [290, 460], [460, 305], [401, 376], [376, 435], [435, 401], [309, 250], [250, 392], [392, 309], [376, 411], [411, 433], [433, 376], [453, 341], [341, 464], [464, 453], [357, 453], [453, 465], [465, 357], [343, 357], [357, 412], [412, 343], [437, 343], [343, 399], [399, 437], [344, 360], [360, 440], [440, 344], [420, 437], [437, 456], [456, 420], [360, 420], [420, 363], [363, 360], [361, 401], [401, 288], [288, 361], [265, 372], [372, 353], [353, 265], [390, 339], [339, 249], [249, 390], [339, 448], [448, 255], [255, 339]);
  function kc(t2) {
    t2.j = { faceLandmarks: [], faceBlendshapes: [], facialTransformationMatrixes: [] };
  }
  var Sc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "image_in", "norm_rect", false), this.j = { faceLandmarks: [], faceBlendshapes: [], facialTransformationMatrixes: [] }, this.outputFacialTransformationMatrixes = this.outputFaceBlendshapes = false, wn(t2 = this.h = new Js(), 0, 1, e2 = new Xs()), this.A = new $s(), wn(this.h, 0, 3, this.A), this.u = new zs(), wn(this.h, 0, 2, this.u), xn(this.u, 4, 1), Ln(this.u, 2, 0.5), Ln(this.A, 2, 0.5), Ln(this.h, 4, 0.5);
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      return "numFaces" in t2 && xn(this.u, 4, t2.numFaces ?? 1), "minFaceDetectionConfidence" in t2 && Ln(this.u, 2, t2.minFaceDetectionConfidence ?? 0.5), "minTrackingConfidence" in t2 && Ln(this.h, 4, t2.minTrackingConfidence ?? 0.5), "minFacePresenceConfidence" in t2 && Ln(this.A, 2, t2.minFacePresenceConfidence ?? 0.5), "outputFaceBlendshapes" in t2 && (this.outputFaceBlendshapes = !!t2.outputFaceBlendshapes), "outputFacialTransformationMatrixes" in t2 && (this.outputFacialTransformationMatrixes = !!t2.outputFacialTransformationMatrixes), this.l(t2);
    }
    F(t2, e2) {
      return kc(this), uc(this, t2, e2), this.j;
    }
    G(t2, e2, n2) {
      return kc(this), lc(this, t2, n2, e2), this.j;
    }
    m() {
      var t2 = new ls();
      hs(t2, "image_in"), hs(t2, "norm_rect"), us(t2, "face_landmarks");
      const e2 = new Qi();
      xr(e2, Qs, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.face_landmarker.FaceLandmarkerGraph"), ns(n2, "IMAGE:image_in"), ns(n2, "NORM_RECT:norm_rect"), rs(n2, "NORM_LANDMARKS:face_landmarks"), n2.o(e2), cs(t2, n2), this.g.attachProtoVectorListener("face_landmarks", ((t3, e3) => {
        for (const e4 of t3) t3 = ks(e4), this.j.faceLandmarks.push(Ho(t3));
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("face_landmarks", ((t3) => {
        ua(this, t3);
      })), this.outputFaceBlendshapes && (us(t2, "blendshapes"), rs(n2, "BLENDSHAPES:blendshapes"), this.g.attachProtoVectorListener("blendshapes", ((t3, e3) => {
        if (this.outputFaceBlendshapes) for (const e4 of t3) t3 = ys(e4), this.j.faceBlendshapes.push(jo(t3.g() ?? []));
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("blendshapes", ((t3) => {
        ua(this, t3);
      }))), this.outputFacialTransformationMatrixes && (us(t2, "face_geometry"), rs(n2, "FACE_GEOMETRY:face_geometry"), this.g.attachProtoVectorListener("face_geometry", ((t3, e3) => {
        if (this.outputFacialTransformationMatrixes) for (const e4 of t3) (t3 = yn(t3 = qs(e4), Ss, 2)) && this.j.facialTransformationMatrixes.push({ rows: kn(t3, 1) ?? 0 ?? 0, columns: kn(t3, 2) ?? 0 ?? 0, data: en(t3, 3, $t, tn()).slice() ?? [] });
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("face_geometry", ((t3) => {
        ua(this, t3);
      }))), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Sc.prototype.detectForVideo = Sc.prototype.G, Sc.prototype.detect = Sc.prototype.F, Sc.prototype.setOptions = Sc.prototype.o, Sc.createFromModelPath = function(t2, e2) {
    return cc(Sc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Sc.createFromModelBuffer = function(t2, e2) {
    return cc(Sc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Sc.createFromOptions = function(t2, e2) {
    return cc(Sc, t2, e2);
  }, Sc.FACE_LANDMARKS_LIPS = gc, Sc.FACE_LANDMARKS_LEFT_EYE = mc, Sc.FACE_LANDMARKS_LEFT_EYEBROW = yc, Sc.FACE_LANDMARKS_LEFT_IRIS = _c, Sc.FACE_LANDMARKS_RIGHT_EYE = vc, Sc.FACE_LANDMARKS_RIGHT_EYEBROW = Ec, Sc.FACE_LANDMARKS_RIGHT_IRIS = wc, Sc.FACE_LANDMARKS_FACE_OVAL = Tc, Sc.FACE_LANDMARKS_CONTOURS = Ac, Sc.FACE_LANDMARKS_TESSELATION = bc;
  var xc = ic([0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]);
  function Lc(t2) {
    t2.gestures = [], t2.landmarks = [], t2.worldLandmarks = [], t2.handedness = [];
  }
  function Rc(t2) {
    return 0 === t2.gestures.length ? { gestures: [], landmarks: [], worldLandmarks: [], handedness: [], handednesses: [] } : { gestures: t2.gestures, landmarks: t2.landmarks, worldLandmarks: t2.worldLandmarks, handedness: t2.handedness, handednesses: t2.handedness };
  }
  function Ic(t2, e2 = true) {
    const n2 = [];
    for (const i2 of t2) {
      var r2 = ys(i2);
      t2 = [];
      for (const n3 of r2.g()) r2 = e2 && null != kn(n3, 1) ? kn(n3, 1) ?? 0 : -1, t2.push({ score: Sn(n3, 2) ?? 0, index: r2, categoryName: le($e(n3, 3)) ?? "" ?? "", displayName: le($e(n3, 4)) ?? "" ?? "" });
      n2.push(t2);
    }
    return n2;
  }
  var Fc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "image_in", "norm_rect", false), this.gestures = [], this.landmarks = [], this.worldLandmarks = [], this.handedness = [], wn(t2 = this.j = new oo(), 0, 1, e2 = new Xs()), this.u = new so(), wn(this.j, 0, 2, this.u), this.D = new io(), wn(this.u, 0, 3, this.D), this.A = new ro(), wn(this.u, 0, 2, this.A), this.h = new no(), wn(this.j, 0, 3, this.h), Ln(this.A, 2, 0.5), Ln(this.u, 4, 0.5), Ln(this.D, 2, 0.5);
    }
    get baseOptions() {
      return yn(this.j, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.j, 0, 1, t2);
    }
    o(t2) {
      if (xn(this.A, 3, t2.numHands ?? 1), "minHandDetectionConfidence" in t2 && Ln(this.A, 2, t2.minHandDetectionConfidence ?? 0.5), "minTrackingConfidence" in t2 && Ln(this.u, 4, t2.minTrackingConfidence ?? 0.5), "minHandPresenceConfidence" in t2 && Ln(this.D, 2, t2.minHandPresenceConfidence ?? 0.5), t2.cannedGesturesClassifierOptions) {
        var e2 = new to(), n2 = e2, r2 = Bo(t2.cannedGesturesClassifierOptions, yn(this.h, to, 3)?.l());
        wn(n2, 0, 2, r2), wn(this.h, 0, 3, e2);
      } else void 0 === t2.cannedGesturesClassifierOptions && yn(this.h, to, 3)?.g();
      return t2.customGesturesClassifierOptions ? (wn(n2 = e2 = new to(), 0, 2, r2 = Bo(t2.customGesturesClassifierOptions, yn(this.h, to, 4)?.l())), wn(this.h, 0, 4, e2)) : void 0 === t2.customGesturesClassifierOptions && yn(this.h, to, 4)?.g(), this.l(t2);
    }
    Ha(t2, e2) {
      return Lc(this), uc(this, t2, e2), Rc(this);
    }
    Ia(t2, e2, n2) {
      return Lc(this), lc(this, t2, n2, e2), Rc(this);
    }
    m() {
      var t2 = new ls();
      hs(t2, "image_in"), hs(t2, "norm_rect"), us(t2, "hand_gestures"), us(t2, "hand_landmarks"), us(t2, "world_hand_landmarks"), us(t2, "handedness");
      const e2 = new Qi();
      xr(e2, lo, this.j);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.gesture_recognizer.GestureRecognizerGraph"), ns(n2, "IMAGE:image_in"), ns(n2, "NORM_RECT:norm_rect"), rs(n2, "HAND_GESTURES:hand_gestures"), rs(n2, "LANDMARKS:hand_landmarks"), rs(n2, "WORLD_LANDMARKS:world_hand_landmarks"), rs(n2, "HANDEDNESS:handedness"), n2.o(e2), cs(t2, n2), this.g.attachProtoVectorListener("hand_landmarks", ((t3, e3) => {
        for (const e4 of t3) {
          t3 = ks(e4);
          const n3 = [];
          for (const e5 of vn(t3, bs, 1)) n3.push({ x: Sn(e5, 1) ?? 0, y: Sn(e5, 2) ?? 0, z: Sn(e5, 3) ?? 0, visibility: Sn(e5, 4) ?? 0 });
          this.landmarks.push(n3);
        }
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("hand_landmarks", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoVectorListener("world_hand_landmarks", ((t3, e3) => {
        for (const e4 of t3) {
          t3 = As(e4);
          const n3 = [];
          for (const e5 of vn(t3, Ts, 1)) n3.push({ x: Sn(e5, 1) ?? 0, y: Sn(e5, 2) ?? 0, z: Sn(e5, 3) ?? 0, visibility: Sn(e5, 4) ?? 0 });
          this.worldLandmarks.push(n3);
        }
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("world_hand_landmarks", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoVectorListener("hand_gestures", ((t3, e3) => {
        this.gestures.push(...Ic(t3, false)), ua(this, e3);
      })), this.g.attachEmptyPacketListener("hand_gestures", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoVectorListener("handedness", ((t3, e3) => {
        this.handedness.push(...Ic(t3)), ua(this, e3);
      })), this.g.attachEmptyPacketListener("handedness", ((t3) => {
        ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  function Mc(t2) {
    return { landmarks: t2.landmarks, worldLandmarks: t2.worldLandmarks, handednesses: t2.handedness, handedness: t2.handedness };
  }
  Fc.prototype.recognizeForVideo = Fc.prototype.Ia, Fc.prototype.recognize = Fc.prototype.Ha, Fc.prototype.setOptions = Fc.prototype.o, Fc.createFromModelPath = function(t2, e2) {
    return cc(Fc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Fc.createFromModelBuffer = function(t2, e2) {
    return cc(Fc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Fc.createFromOptions = function(t2, e2) {
    return cc(Fc, t2, e2);
  }, Fc.HAND_CONNECTIONS = xc;
  var Pc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "image_in", "norm_rect", false), this.landmarks = [], this.worldLandmarks = [], this.handedness = [], wn(t2 = this.h = new so(), 0, 1, e2 = new Xs()), this.u = new io(), wn(this.h, 0, 3, this.u), this.j = new ro(), wn(this.h, 0, 2, this.j), xn(this.j, 3, 1), Ln(this.j, 2, 0.5), Ln(this.u, 2, 0.5), Ln(this.h, 4, 0.5);
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      return "numHands" in t2 && xn(this.j, 3, t2.numHands ?? 1), "minHandDetectionConfidence" in t2 && Ln(this.j, 2, t2.minHandDetectionConfidence ?? 0.5), "minTrackingConfidence" in t2 && Ln(this.h, 4, t2.minTrackingConfidence ?? 0.5), "minHandPresenceConfidence" in t2 && Ln(this.u, 2, t2.minHandPresenceConfidence ?? 0.5), this.l(t2);
    }
    F(t2, e2) {
      return this.landmarks = [], this.worldLandmarks = [], this.handedness = [], uc(this, t2, e2), Mc(this);
    }
    G(t2, e2, n2) {
      return this.landmarks = [], this.worldLandmarks = [], this.handedness = [], lc(this, t2, n2, e2), Mc(this);
    }
    m() {
      var t2 = new ls();
      hs(t2, "image_in"), hs(t2, "norm_rect"), us(t2, "hand_landmarks"), us(t2, "world_hand_landmarks"), us(t2, "handedness");
      const e2 = new Qi();
      xr(e2, fo, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.hand_landmarker.HandLandmarkerGraph"), ns(n2, "IMAGE:image_in"), ns(n2, "NORM_RECT:norm_rect"), rs(n2, "LANDMARKS:hand_landmarks"), rs(n2, "WORLD_LANDMARKS:world_hand_landmarks"), rs(n2, "HANDEDNESS:handedness"), n2.o(e2), cs(t2, n2), this.g.attachProtoVectorListener("hand_landmarks", ((t3, e3) => {
        for (const e4 of t3) t3 = ks(e4), this.landmarks.push(Ho(t3));
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("hand_landmarks", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoVectorListener("world_hand_landmarks", ((t3, e3) => {
        for (const e4 of t3) t3 = As(e4), this.worldLandmarks.push(Wo(t3));
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("world_hand_landmarks", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoVectorListener("handedness", ((t3, e3) => {
        var n3 = this.handedness, r2 = n3.push;
        const i2 = [];
        for (const e4 of t3) {
          t3 = ys(e4);
          const n4 = [];
          for (const e5 of t3.g()) n4.push({ score: Sn(e5, 2) ?? 0, index: kn(e5, 1) ?? 0 ?? -1, categoryName: le($e(e5, 3)) ?? "" ?? "", displayName: le($e(e5, 4)) ?? "" ?? "" });
          i2.push(n4);
        }
        r2.call(n3, ...i2), ua(this, e3);
      })), this.g.attachEmptyPacketListener("handedness", ((t3) => {
        ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Pc.prototype.detectForVideo = Pc.prototype.G, Pc.prototype.detect = Pc.prototype.F, Pc.prototype.setOptions = Pc.prototype.o, Pc.createFromModelPath = function(t2, e2) {
    return cc(Pc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Pc.createFromModelBuffer = function(t2, e2) {
    return cc(Pc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Pc.createFromOptions = function(t2, e2) {
    return cc(Pc, t2, e2);
  }, Pc.HAND_CONNECTIONS = xc;
  var Cc = ic([0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32]);
  function Oc(t2) {
    t2.h = { faceLandmarks: [], faceBlendshapes: [], poseLandmarks: [], poseWorldLandmarks: [], poseSegmentationMasks: [], leftHandLandmarks: [], leftHandWorldLandmarks: [], rightHandLandmarks: [], rightHandWorldLandmarks: [] };
  }
  function Nc(t2) {
    try {
      if (!t2.D) return t2.h;
      t2.D(t2.h);
    } finally {
      da(t2);
    }
  }
  function Uc(t2, e2) {
    t2 = ks(t2), e2.push(Ho(t2));
  }
  var Dc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "input_frames_image", null, false), this.h = { faceLandmarks: [], faceBlendshapes: [], poseLandmarks: [], poseWorldLandmarks: [], poseSegmentationMasks: [], leftHandLandmarks: [], leftHandWorldLandmarks: [], rightHandLandmarks: [], rightHandWorldLandmarks: [] }, this.outputPoseSegmentationMasks = this.outputFaceBlendshapes = false, wn(t2 = this.j = new yo(), 0, 1, e2 = new Xs()), this.I = new io(), wn(this.j, 0, 2, this.I), this.W = new po(), wn(this.j, 0, 3, this.W), this.u = new zs(), wn(this.j, 0, 4, this.u), this.O = new $s(), wn(this.j, 0, 5, this.O), this.A = new go(), wn(this.j, 0, 6, this.A), this.M = new mo(), wn(this.j, 0, 7, this.M), Ln(this.u, 2, 0.5), Ln(this.u, 3, 0.3), Ln(this.O, 2, 0.5), Ln(this.A, 2, 0.5), Ln(this.A, 3, 0.3), Ln(this.M, 2, 0.5), Ln(this.I, 2, 0.5);
    }
    get baseOptions() {
      return yn(this.j, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.j, 0, 1, t2);
    }
    o(t2) {
      return "minFaceDetectionConfidence" in t2 && Ln(this.u, 2, t2.minFaceDetectionConfidence ?? 0.5), "minFaceSuppressionThreshold" in t2 && Ln(this.u, 3, t2.minFaceSuppressionThreshold ?? 0.3), "minFacePresenceConfidence" in t2 && Ln(this.O, 2, t2.minFacePresenceConfidence ?? 0.5), "outputFaceBlendshapes" in t2 && (this.outputFaceBlendshapes = !!t2.outputFaceBlendshapes), "minPoseDetectionConfidence" in t2 && Ln(this.A, 2, t2.minPoseDetectionConfidence ?? 0.5), "minPoseSuppressionThreshold" in t2 && Ln(this.A, 3, t2.minPoseSuppressionThreshold ?? 0.3), "minPosePresenceConfidence" in t2 && Ln(this.M, 2, t2.minPosePresenceConfidence ?? 0.5), "outputPoseSegmentationMasks" in t2 && (this.outputPoseSegmentationMasks = !!t2.outputPoseSegmentationMasks), "minHandLandmarksConfidence" in t2 && Ln(this.I, 2, t2.minHandLandmarksConfidence ?? 0.5), this.l(t2);
    }
    F(t2, e2, n2) {
      const r2 = "function" != typeof e2 ? e2 : {};
      return this.D = "function" == typeof e2 ? e2 : n2, Oc(this), uc(this, t2, r2), Nc(this);
    }
    G(t2, e2, n2, r2) {
      const i2 = "function" != typeof n2 ? n2 : {};
      return this.D = "function" == typeof n2 ? n2 : r2, Oc(this), lc(this, t2, i2, e2), Nc(this);
    }
    m() {
      var t2 = new ls();
      hs(t2, "input_frames_image"), us(t2, "pose_landmarks"), us(t2, "pose_world_landmarks"), us(t2, "face_landmarks"), us(t2, "left_hand_landmarks"), us(t2, "left_hand_world_landmarks"), us(t2, "right_hand_landmarks"), us(t2, "right_hand_world_landmarks");
      const e2 = new Qi(), n2 = new Bi();
      Rn(n2, 1, "type.googleapis.com/mediapipe.tasks.vision.holistic_landmarker.proto.HolisticLandmarkerGraphOptions"), (function(t3, e3) {
        if (null != e3) if (Array.isArray(e3)) Ze(t3, 2, Ie(e3, 0, Me));
        else {
          if (!("string" == typeof e3 || e3 instanceof F || x(e3))) throw Error("invalid value in Any.value field: " + e3 + " expected a ByteString, a base64 encoded string, a Uint8Array or a jspb array");
          hn(t3, 2, ht(e3, false), R());
        }
      })(n2, this.j.g());
      const r2 = new is();
      Rn(r2, 2, "mediapipe.tasks.vision.holistic_landmarker.HolisticLandmarkerGraph"), bn(r2, 8, Bi, n2), ns(r2, "IMAGE:input_frames_image"), rs(r2, "POSE_LANDMARKS:pose_landmarks"), rs(r2, "POSE_WORLD_LANDMARKS:pose_world_landmarks"), rs(r2, "FACE_LANDMARKS:face_landmarks"), rs(r2, "LEFT_HAND_LANDMARKS:left_hand_landmarks"), rs(r2, "LEFT_HAND_WORLD_LANDMARKS:left_hand_world_landmarks"), rs(r2, "RIGHT_HAND_LANDMARKS:right_hand_landmarks"), rs(r2, "RIGHT_HAND_WORLD_LANDMARKS:right_hand_world_landmarks"), r2.o(e2), cs(t2, r2), la(this, t2), this.g.attachProtoListener("pose_landmarks", ((t3, e3) => {
        Uc(t3, this.h.poseLandmarks), ua(this, e3);
      })), this.g.attachEmptyPacketListener("pose_landmarks", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoListener("pose_world_landmarks", ((t3, e3) => {
        var n3 = this.h.poseWorldLandmarks;
        t3 = As(t3), n3.push(Wo(t3)), ua(this, e3);
      })), this.g.attachEmptyPacketListener("pose_world_landmarks", ((t3) => {
        ua(this, t3);
      })), this.outputPoseSegmentationMasks && (rs(r2, "POSE_SEGMENTATION_MASK:pose_segmentation_mask"), fa(this, "pose_segmentation_mask"), this.g.Z("pose_segmentation_mask", ((t3, e3) => {
        this.h.poseSegmentationMasks = [fc(this, t3, true, !this.D)], ua(this, e3);
      })), this.g.attachEmptyPacketListener("pose_segmentation_mask", ((t3) => {
        this.h.poseSegmentationMasks = [], ua(this, t3);
      }))), this.g.attachProtoListener("face_landmarks", ((t3, e3) => {
        Uc(t3, this.h.faceLandmarks), ua(this, e3);
      })), this.g.attachEmptyPacketListener("face_landmarks", ((t3) => {
        ua(this, t3);
      })), this.outputFaceBlendshapes && (us(t2, "extra_blendshapes"), rs(r2, "FACE_BLENDSHAPES:extra_blendshapes"), this.g.attachProtoListener("extra_blendshapes", ((t3, e3) => {
        var n3 = this.h.faceBlendshapes;
        this.outputFaceBlendshapes && (t3 = ys(t3), n3.push(jo(t3.g() ?? []))), ua(this, e3);
      })), this.g.attachEmptyPacketListener("extra_blendshapes", ((t3) => {
        ua(this, t3);
      }))), this.g.attachProtoListener("left_hand_landmarks", ((t3, e3) => {
        Uc(t3, this.h.leftHandLandmarks), ua(this, e3);
      })), this.g.attachEmptyPacketListener("left_hand_landmarks", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoListener("left_hand_world_landmarks", ((t3, e3) => {
        var n3 = this.h.leftHandWorldLandmarks;
        t3 = As(t3), n3.push(Wo(t3)), ua(this, e3);
      })), this.g.attachEmptyPacketListener("left_hand_world_landmarks", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoListener("right_hand_landmarks", ((t3, e3) => {
        Uc(t3, this.h.rightHandLandmarks), ua(this, e3);
      })), this.g.attachEmptyPacketListener("right_hand_landmarks", ((t3) => {
        ua(this, t3);
      })), this.g.attachProtoListener("right_hand_world_landmarks", ((t3, e3) => {
        var n3 = this.h.rightHandWorldLandmarks;
        t3 = As(t3), n3.push(Wo(t3)), ua(this, e3);
      })), this.g.attachEmptyPacketListener("right_hand_world_landmarks", ((t3) => {
        ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Dc.prototype.detectForVideo = Dc.prototype.G, Dc.prototype.detect = Dc.prototype.F, Dc.prototype.setOptions = Dc.prototype.o, Dc.createFromModelPath = function(t2, e2) {
    return cc(Dc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Dc.createFromModelBuffer = function(t2, e2) {
    return cc(Dc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Dc.createFromOptions = function(t2, e2) {
    return cc(Dc, t2, e2);
  }, Dc.HAND_CONNECTIONS = xc, Dc.POSE_CONNECTIONS = Cc, Dc.FACE_LANDMARKS_LIPS = gc, Dc.FACE_LANDMARKS_LEFT_EYE = mc, Dc.FACE_LANDMARKS_LEFT_EYEBROW = yc, Dc.FACE_LANDMARKS_LEFT_IRIS = _c, Dc.FACE_LANDMARKS_RIGHT_EYE = vc, Dc.FACE_LANDMARKS_RIGHT_EYEBROW = Ec, Dc.FACE_LANDMARKS_RIGHT_IRIS = wc, Dc.FACE_LANDMARKS_FACE_OVAL = Tc, Dc.FACE_LANDMARKS_CONTOURS = Ac, Dc.FACE_LANDMARKS_TESSELATION = bc;
  var Bc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "input_image", "norm_rect", true), this.j = { classifications: [] }, wn(t2 = this.h = new Eo(), 0, 1, e2 = new Xs());
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      return wn(this.h, 0, 2, Bo(t2, yn(this.h, Ns, 2))), this.l(t2);
    }
    sa(t2, e2) {
      return this.j = { classifications: [] }, uc(this, t2, e2), this.j;
    }
    ta(t2, e2, n2) {
      return this.j = { classifications: [] }, lc(this, t2, n2, e2), this.j;
    }
    m() {
      var t2 = new ls();
      hs(t2, "input_image"), hs(t2, "norm_rect"), us(t2, "classifications");
      const e2 = new Qi();
      xr(e2, wo, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.image_classifier.ImageClassifierGraph"), ns(n2, "IMAGE:input_image"), ns(n2, "NORM_RECT:norm_rect"), rs(n2, "CLASSIFICATIONS:classifications"), n2.o(e2), cs(t2, n2), this.g.attachProtoListener("classifications", ((t3, e3) => {
        this.j = Vo(Is(t3)), ua(this, e3);
      })), this.g.attachEmptyPacketListener("classifications", ((t3) => {
        ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Bc.prototype.classifyForVideo = Bc.prototype.ta, Bc.prototype.classify = Bc.prototype.sa, Bc.prototype.setOptions = Bc.prototype.o, Bc.createFromModelPath = function(t2, e2) {
    return cc(Bc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Bc.createFromModelBuffer = function(t2, e2) {
    return cc(Bc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Bc.createFromOptions = function(t2, e2) {
    return cc(Bc, t2, e2);
  };
  var Gc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "image_in", "norm_rect", true), this.h = new To(), this.embeddings = { embeddings: [] }, wn(t2 = this.h, 0, 1, e2 = new Xs());
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      var e2 = this.h, n2 = yn(this.h, Ds, 2);
      return n2 = n2 ? n2.clone() : new Ds(), void 0 !== t2.l2Normalize ? Ze(n2, 1, Jt(t2.l2Normalize)) : "l2Normalize" in t2 && Ze(n2, 1), void 0 !== t2.quantize ? Ze(n2, 2, Jt(t2.quantize)) : "quantize" in t2 && Ze(n2, 2), wn(e2, 0, 2, n2), this.l(t2);
    }
    za(t2, e2) {
      return uc(this, t2, e2), this.embeddings;
    }
    Aa(t2, e2, n2) {
      return lc(this, t2, n2, e2), this.embeddings;
    }
    m() {
      var t2 = new ls();
      hs(t2, "image_in"), hs(t2, "norm_rect"), us(t2, "embeddings_out");
      const e2 = new Qi();
      xr(e2, Ao, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.image_embedder.ImageEmbedderGraph"), ns(n2, "IMAGE:image_in"), ns(n2, "NORM_RECT:norm_rect"), rs(n2, "EMBEDDINGS:embeddings_out"), n2.o(e2), cs(t2, n2), this.g.attachProtoListener("embeddings_out", ((t3, e3) => {
        t3 = Os(t3), this.embeddings = (function(t4) {
          return { embeddings: vn(t4, Ps, 1).map(((t5) => {
            const e4 = { headIndex: kn(t5, 3) ?? 0 ?? -1, headName: le($e(t5, 4)) ?? "" ?? "" };
            var n3 = t5.v;
            return void 0 !== mn(n3, 0 | n3[Q], Fs, ln(t5, 1)) ? (t5 = en(t5 = yn(t5, Fs, ln(t5, 1), void 0), 1, $t, tn()), e4.floatEmbedding = t5.slice()) : (n3 = new Uint8Array(0), e4.quantizedEmbedding = yn(t5, Ms, ln(t5, 2), void 0)?.na()?.h() ?? n3), e4;
          })), timestampMs: Go($e(t4, 2, void 0, void 0, ce) ?? Ye) };
        })(t3), ua(this, e3);
      })), this.g.attachEmptyPacketListener("embeddings_out", ((t3) => {
        ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Gc.cosineSimilarity = function(t2, e2) {
    if (t2.floatEmbedding && e2.floatEmbedding) t2 = Ko(t2.floatEmbedding, e2.floatEmbedding);
    else {
      if (!t2.quantizedEmbedding || !e2.quantizedEmbedding) throw Error("Cannot compute cosine similarity between quantized and float embeddings.");
      t2 = Ko(zo(t2.quantizedEmbedding), zo(e2.quantizedEmbedding));
    }
    return t2;
  }, Gc.prototype.embedForVideo = Gc.prototype.Aa, Gc.prototype.embed = Gc.prototype.za, Gc.prototype.setOptions = Gc.prototype.o, Gc.createFromModelPath = function(t2, e2) {
    return cc(Gc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Gc.createFromModelBuffer = function(t2, e2) {
    return cc(Gc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Gc.createFromOptions = function(t2, e2) {
    return cc(Gc, t2, e2);
  };
  var jc = class {
    constructor(t2, e2, n2) {
      this.confidenceMasks = t2, this.categoryMask = e2, this.qualityScores = n2;
    }
    close() {
      this.confidenceMasks?.forEach(((t2) => {
        t2.close();
      })), this.categoryMask?.close();
    }
  };
  function Vc(t2) {
    const e2 = (function(t3) {
      return vn(t3, is, 1);
    })(t2.ca()).filter(((t3) => (le($e(t3, 1)) ?? "").includes("mediapipe.tasks.TensorsToSegmentationCalculator")));
    if (t2.u = [], e2.length > 1) throw Error("The graph has more than one mediapipe.tasks.TensorsToSegmentationCalculator.");
    1 === e2.length && (yn(e2[0], Qi, 7)?.j()?.g() ?? /* @__PURE__ */ new Map()).forEach(((e3, n2) => {
      t2.u[Number(n2)] = le($e(e3, 1)) ?? "";
    }));
  }
  function Xc(t2) {
    t2.categoryMask = void 0, t2.confidenceMasks = void 0, t2.qualityScores = void 0;
  }
  function Hc(t2) {
    try {
      const e2 = new jc(t2.confidenceMasks, t2.categoryMask, t2.qualityScores);
      if (!t2.j) return e2;
      t2.j(e2);
    } finally {
      da(t2);
    }
  }
  jc.prototype.close = jc.prototype.close;
  var Wc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "image_in", "norm_rect", false), this.u = [], this.outputCategoryMask = false, this.outputConfidenceMasks = true, this.h = new Lo(), this.A = new bo(), wn(this.h, 0, 3, this.A), wn(t2 = this.h, 0, 1, e2 = new Xs());
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      return void 0 !== t2.displayNamesLocale ? Ze(this.h, 2, ue(t2.displayNamesLocale)) : "displayNamesLocale" in t2 && Ze(this.h, 2), "outputCategoryMask" in t2 && (this.outputCategoryMask = t2.outputCategoryMask ?? false), "outputConfidenceMasks" in t2 && (this.outputConfidenceMasks = t2.outputConfidenceMasks ?? true), super.l(t2);
    }
    L() {
      Vc(this);
    }
    segment(t2, e2, n2) {
      const r2 = "function" != typeof e2 ? e2 : {};
      return this.j = "function" == typeof e2 ? e2 : n2, Xc(this), uc(this, t2, r2), Hc(this);
    }
    La(t2, e2, n2, r2) {
      const i2 = "function" != typeof n2 ? n2 : {};
      return this.j = "function" == typeof n2 ? n2 : r2, Xc(this), lc(this, t2, i2, e2), Hc(this);
    }
    Da() {
      return this.u;
    }
    m() {
      var t2 = new ls();
      hs(t2, "image_in"), hs(t2, "norm_rect");
      const e2 = new Qi();
      xr(e2, Ro, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.image_segmenter.ImageSegmenterGraph"), ns(n2, "IMAGE:image_in"), ns(n2, "NORM_RECT:norm_rect"), n2.o(e2), cs(t2, n2), la(this, t2), this.outputConfidenceMasks && (us(t2, "confidence_masks"), rs(n2, "CONFIDENCE_MASKS:confidence_masks"), fa(this, "confidence_masks"), this.g.aa("confidence_masks", ((t3, e3) => {
        this.confidenceMasks = t3.map(((t4) => fc(this, t4, true, !this.j))), ua(this, e3);
      })), this.g.attachEmptyPacketListener("confidence_masks", ((t3) => {
        this.confidenceMasks = [], ua(this, t3);
      }))), this.outputCategoryMask && (us(t2, "category_mask"), rs(n2, "CATEGORY_MASK:category_mask"), fa(this, "category_mask"), this.g.Z("category_mask", ((t3, e3) => {
        this.categoryMask = fc(this, t3, false, !this.j), ua(this, e3);
      })), this.g.attachEmptyPacketListener("category_mask", ((t3) => {
        this.categoryMask = void 0, ua(this, t3);
      }))), us(t2, "quality_scores"), rs(n2, "QUALITY_SCORES:quality_scores"), this.g.attachFloatVectorListener("quality_scores", ((t3, e3) => {
        this.qualityScores = t3, ua(this, e3);
      })), this.g.attachEmptyPacketListener("quality_scores", ((t3) => {
        this.categoryMask = void 0, ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Wc.prototype.getLabels = Wc.prototype.Da, Wc.prototype.segmentForVideo = Wc.prototype.La, Wc.prototype.segment = Wc.prototype.segment, Wc.prototype.setOptions = Wc.prototype.o, Wc.createFromModelPath = function(t2, e2) {
    return cc(Wc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Wc.createFromModelBuffer = function(t2, e2) {
    return cc(Wc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Wc.createFromOptions = function(t2, e2) {
    return cc(Wc, t2, e2);
  };
  var zc = class {
    constructor(t2, e2, n2) {
      this.confidenceMasks = t2, this.categoryMask = e2, this.qualityScores = n2;
    }
    close() {
      this.confidenceMasks?.forEach(((t2) => {
        t2.close();
      })), this.categoryMask?.close();
    }
  };
  zc.prototype.close = zc.prototype.close;
  var Kc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "image_in", "norm_rect_in", false), this.outputCategoryMask = false, this.outputConfidenceMasks = true, this.h = new Lo(), this.u = new bo(), wn(this.h, 0, 3, this.u), wn(t2 = this.h, 0, 1, e2 = new Xs());
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      return "outputCategoryMask" in t2 && (this.outputCategoryMask = t2.outputCategoryMask ?? false), "outputConfidenceMasks" in t2 && (this.outputConfidenceMasks = t2.outputConfidenceMasks ?? true), super.l(t2);
    }
    segment(t2, e2, n2, r2) {
      const i2 = "function" != typeof n2 ? n2 : {};
      if (this.j = "function" == typeof n2 ? n2 : r2, this.qualityScores = this.categoryMask = this.confidenceMasks = void 0, n2 = this.C + 1, r2 = new Po(), e2.keypoint && e2.scribble) throw Error("Cannot provide both keypoint and scribble.");
      if (e2.keypoint) {
        var s2 = new Io();
        hn(s2, 3, Jt(true), false), hn(s2, 1, qt(e2.keypoint.x), 0), hn(s2, 2, qt(e2.keypoint.y), 0), Tn(r2, 1, Co, s2);
      } else {
        if (!e2.scribble) throw Error("Must provide either a keypoint or a scribble.");
        {
          const t3 = new Mo();
          for (s2 of e2.scribble) hn(e2 = new Io(), 3, Jt(true), false), hn(e2, 1, qt(s2.x), 0), hn(e2, 2, qt(s2.y), 0), bn(t3, 1, Io, e2);
          Tn(r2, 2, Co, t3);
        }
      }
      this.g.addProtoToStream(r2.g(), "mediapipe.tasks.vision.interactive_segmenter.proto.RegionOfInterest", "roi_in", n2), uc(this, t2, i2);
      t: {
        try {
          const t3 = new zc(this.confidenceMasks, this.categoryMask, this.qualityScores);
          if (!this.j) {
            var o2 = t3;
            break t;
          }
          this.j(t3);
        } finally {
          da(this);
        }
        o2 = void 0;
      }
      return o2;
    }
    m() {
      var t2 = new ls();
      hs(t2, "image_in"), hs(t2, "roi_in"), hs(t2, "norm_rect_in");
      const e2 = new Qi();
      xr(e2, Ro, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.interactive_segmenter.InteractiveSegmenterGraphV2"), ns(n2, "IMAGE:image_in"), ns(n2, "ROI:roi_in"), ns(n2, "NORM_RECT:norm_rect_in"), n2.o(e2), cs(t2, n2), la(this, t2), this.outputConfidenceMasks && (us(t2, "confidence_masks"), rs(n2, "CONFIDENCE_MASKS:confidence_masks"), fa(this, "confidence_masks"), this.g.aa("confidence_masks", ((t3, e3) => {
        this.confidenceMasks = t3.map(((t4) => fc(this, t4, true, !this.j))), ua(this, e3);
      })), this.g.attachEmptyPacketListener("confidence_masks", ((t3) => {
        this.confidenceMasks = [], ua(this, t3);
      }))), this.outputCategoryMask && (us(t2, "category_mask"), rs(n2, "CATEGORY_MASK:category_mask"), fa(this, "category_mask"), this.g.Z("category_mask", ((t3, e3) => {
        this.categoryMask = fc(this, t3, false, !this.j), ua(this, e3);
      })), this.g.attachEmptyPacketListener("category_mask", ((t3) => {
        this.categoryMask = void 0, ua(this, t3);
      }))), us(t2, "quality_scores"), rs(n2, "QUALITY_SCORES:quality_scores"), this.g.attachFloatVectorListener("quality_scores", ((t3, e3) => {
        this.qualityScores = t3, ua(this, e3);
      })), this.g.attachEmptyPacketListener("quality_scores", ((t3) => {
        this.categoryMask = void 0, ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Kc.prototype.segment = Kc.prototype.segment, Kc.prototype.setOptions = Kc.prototype.o, Kc.createFromModelPath = function(t2, e2) {
    return cc(Kc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Kc.createFromModelBuffer = function(t2, e2) {
    return cc(Kc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Kc.createFromOptions = function(t2, e2) {
    return cc(Kc, t2, e2);
  };
  var Yc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "input_frame_gpu", "norm_rect", false), this.j = { detections: [] }, wn(t2 = this.h = new Oo(), 0, 1, e2 = new Xs());
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      return void 0 !== t2.displayNamesLocale ? Ze(this.h, 2, ue(t2.displayNamesLocale)) : "displayNamesLocale" in t2 && Ze(this.h, 2), void 0 !== t2.maxResults ? xn(this.h, 3, t2.maxResults) : "maxResults" in t2 && Ze(this.h, 3), void 0 !== t2.scoreThreshold ? Ln(this.h, 4, t2.scoreThreshold) : "scoreThreshold" in t2 && Ze(this.h, 4), void 0 !== t2.categoryAllowlist ? In(this.h, 5, t2.categoryAllowlist) : "categoryAllowlist" in t2 && Ze(this.h, 5), void 0 !== t2.categoryDenylist ? In(this.h, 6, t2.categoryDenylist) : "categoryDenylist" in t2 && Ze(this.h, 6), this.l(t2);
    }
    F(t2, e2) {
      return this.j = { detections: [] }, uc(this, t2, e2), this.j;
    }
    G(t2, e2, n2) {
      return this.j = { detections: [] }, lc(this, t2, n2, e2), this.j;
    }
    m() {
      var t2 = new ls();
      hs(t2, "input_frame_gpu"), hs(t2, "norm_rect"), us(t2, "detections");
      const e2 = new Qi();
      xr(e2, No, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.ObjectDetectorGraph"), ns(n2, "IMAGE:input_frame_gpu"), ns(n2, "NORM_RECT:norm_rect"), rs(n2, "DETECTIONS:detections"), n2.o(e2), cs(t2, n2), this.g.attachProtoVectorListener("detections", ((t3, e3) => {
        for (const e4 of t3) t3 = ws(e4), this.j.detections.push(Xo(t3));
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("detections", ((t3) => {
        ua(this, t3);
      })), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Yc.prototype.detectForVideo = Yc.prototype.G, Yc.prototype.detect = Yc.prototype.F, Yc.prototype.setOptions = Yc.prototype.o, Yc.createFromModelPath = async function(t2, e2) {
    return cc(Yc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Yc.createFromModelBuffer = function(t2, e2) {
    return cc(Yc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Yc.createFromOptions = function(t2, e2) {
    return cc(Yc, t2, e2);
  };
  var qc = class {
    constructor(t2, e2, n2) {
      this.landmarks = t2, this.worldLandmarks = e2, this.segmentationMasks = n2;
    }
    close() {
      this.segmentationMasks?.forEach(((t2) => {
        t2.close();
      }));
    }
  };
  function $c(t2) {
    t2.landmarks = [], t2.worldLandmarks = [], t2.segmentationMasks = void 0;
  }
  function Jc(t2) {
    try {
      const e2 = new qc(t2.landmarks, t2.worldLandmarks, t2.segmentationMasks);
      if (!t2.u) return e2;
      t2.u(e2);
    } finally {
      da(t2);
    }
  }
  qc.prototype.close = qc.prototype.close;
  var Zc = class extends dc {
    constructor(t2, e2) {
      super(new ac(t2, e2), "image_in", "norm_rect", false), this.landmarks = [], this.worldLandmarks = [], this.outputSegmentationMasks = false, wn(t2 = this.h = new Uo(), 0, 1, e2 = new Xs()), this.A = new mo(), wn(this.h, 0, 3, this.A), this.j = new go(), wn(this.h, 0, 2, this.j), xn(this.j, 4, 1), Ln(this.j, 2, 0.5), Ln(this.A, 2, 0.5), Ln(this.h, 4, 0.5);
    }
    get baseOptions() {
      return yn(this.h, Xs, 1);
    }
    set baseOptions(t2) {
      wn(this.h, 0, 1, t2);
    }
    o(t2) {
      return "numPoses" in t2 && xn(this.j, 4, t2.numPoses ?? 1), "minPoseDetectionConfidence" in t2 && Ln(this.j, 2, t2.minPoseDetectionConfidence ?? 0.5), "minTrackingConfidence" in t2 && Ln(this.h, 4, t2.minTrackingConfidence ?? 0.5), "minPosePresenceConfidence" in t2 && Ln(this.A, 2, t2.minPosePresenceConfidence ?? 0.5), "outputSegmentationMasks" in t2 && (this.outputSegmentationMasks = t2.outputSegmentationMasks ?? false), this.l(t2);
    }
    F(t2, e2, n2) {
      const r2 = "function" != typeof e2 ? e2 : {};
      return this.u = "function" == typeof e2 ? e2 : n2, $c(this), uc(this, t2, r2), Jc(this);
    }
    G(t2, e2, n2, r2) {
      const i2 = "function" != typeof n2 ? n2 : {};
      return this.u = "function" == typeof n2 ? n2 : r2, $c(this), lc(this, t2, i2, e2), Jc(this);
    }
    m() {
      var t2 = new ls();
      hs(t2, "image_in"), hs(t2, "norm_rect"), us(t2, "normalized_landmarks"), us(t2, "world_landmarks"), us(t2, "segmentation_masks");
      const e2 = new Qi();
      xr(e2, Do, this.h);
      const n2 = new is();
      Rn(n2, 2, "mediapipe.tasks.vision.pose_landmarker.PoseLandmarkerGraph"), ns(n2, "IMAGE:image_in"), ns(n2, "NORM_RECT:norm_rect"), rs(n2, "NORM_LANDMARKS:normalized_landmarks"), rs(n2, "WORLD_LANDMARKS:world_landmarks"), n2.o(e2), cs(t2, n2), la(this, t2), this.g.attachProtoVectorListener("normalized_landmarks", ((t3, e3) => {
        this.landmarks = [];
        for (const e4 of t3) t3 = ks(e4), this.landmarks.push(Ho(t3));
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("normalized_landmarks", ((t3) => {
        this.landmarks = [], ua(this, t3);
      })), this.g.attachProtoVectorListener("world_landmarks", ((t3, e3) => {
        this.worldLandmarks = [];
        for (const e4 of t3) t3 = As(e4), this.worldLandmarks.push(Wo(t3));
        ua(this, e3);
      })), this.g.attachEmptyPacketListener("world_landmarks", ((t3) => {
        this.worldLandmarks = [], ua(this, t3);
      })), this.outputSegmentationMasks && (rs(n2, "SEGMENTATION_MASK:segmentation_masks"), fa(this, "segmentation_masks"), this.g.aa("segmentation_masks", ((t3, e3) => {
        this.segmentationMasks = t3.map(((t4) => fc(this, t4, true, !this.u))), ua(this, e3);
      })), this.g.attachEmptyPacketListener("segmentation_masks", ((t3) => {
        this.segmentationMasks = [], ua(this, t3);
      }))), t2 = t2.g(), this.setGraph(new Uint8Array(t2), true);
    }
  };
  Zc.prototype.detectForVideo = Zc.prototype.G, Zc.prototype.detect = Zc.prototype.F, Zc.prototype.setOptions = Zc.prototype.o, Zc.createFromModelPath = function(t2, e2) {
    return cc(Zc, t2, { baseOptions: { modelAssetPath: e2 } });
  }, Zc.createFromModelBuffer = function(t2, e2) {
    return cc(Zc, t2, { baseOptions: { modelAssetBuffer: e2 } });
  }, Zc.createFromOptions = function(t2, e2) {
    return cc(Zc, t2, e2);
  }, Zc.POSE_CONNECTIONS = Cc;

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/face/FaceLandmarkerAdapter.js
  var DEFAULT_MODEL_PATH = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
  var DEFAULT_WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
  var DEFAULT_MIN_CONFIDENCE = 0.5;
  var normalizeWasmPath = (wasmPath) => wasmPath.endsWith("/") ? wasmPath.slice(0, -1) : wasmPath;
  var shouldUseStaticVisionFileset = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("webcamEtLightE2E")) {
        return true;
      }
    }
    return typeof navigator !== "undefined" && navigator.userAgent.includes("HeadlessChrome");
  };
  var createStaticVisionFileset = (wasmPath) => {
    const basePath = normalizeWasmPath(wasmPath);
    return {
      wasmLoaderPath: `${basePath}/vision_wasm_nosimd_internal.js`,
      wasmBinaryPath: `${basePath}/vision_wasm_nosimd_internal.wasm`
    };
  };
  var LANDMARK_INDICES = {
    // Iris centers (most precise for eye tracking)
    LEFT_IRIS_CENTER: 468,
    RIGHT_IRIS_CENTER: 473,
    // Eye corners (for calculating eye bounding box)
    LEFT_EYE_OUTER: 33,
    LEFT_EYE_INNER: 133,
    RIGHT_EYE_INNER: 362,
    RIGHT_EYE_OUTER: 263,
    // Eye upper/lower for eye height
    LEFT_EYE_UPPER: 159,
    LEFT_EYE_LOWER: 145,
    RIGHT_EYE_UPPER: 386,
    RIGHT_EYE_LOWER: 374,
    // Face structure
    NOSE_TIP: 1,
    UPPER_LIP_CENTER: 13,
    LOWER_LIP_CENTER: 14,
    CHIN: 152,
    // Face boundary (for bounding box calculation)
    FOREHEAD_TOP: 10,
    LEFT_CHEEK: 234,
    RIGHT_CHEEK: 454,
    // Silhouette points for face boundary
    FACE_TOP: 10,
    FACE_BOTTOM: 152,
    FACE_LEFT: 234,
    FACE_RIGHT: 454
  };
  var REALEYE_EYE_INDICES = {
    // Left eye: use multiple landmarks to find tight bounding box
    LEFT_MIN_X: [247, 130, 25],
    // Landmarks for leftmost X
    LEFT_MIN_Y: [222, 223, 224],
    // Landmarks for topmost Y
    LEFT_MAX_X: [190, 243, 233],
    // Landmarks for rightmost X
    LEFT_MAX_Y: [25, 23, 112],
    // Landmarks for bottommost Y
    // Right eye: use multiple landmarks to find tight bounding box
    RIGHT_MIN_X: [414, 463, 453],
    // Landmarks for leftmost X
    RIGHT_MIN_Y: [442, 443, 444],
    // Landmarks for topmost Y
    RIGHT_MAX_X: [467, 359, 255],
    // Landmarks for rightmost X
    RIGHT_MAX_Y: [341, 253, 255]
    // Landmarks for bottommost Y
  };
  var EYE_INPUT_WIDTH = 40;
  var EYE_INPUT_HEIGHT = 20;
  var FaceLandmarkerAdapter = class {
    landmarker = null;
    config;
    lastTimestamp = 0;
    hasLoggedHeadPose = false;
    hasLoggedNoMatrix = false;
    constructor(config = {}) {
      this.config = {
        modelPath: config.modelPath ?? DEFAULT_MODEL_PATH,
        wasmPath: config.wasmPath ?? DEFAULT_WASM_PATH,
        minDetectionConfidence: config.minDetectionConfidence ?? DEFAULT_MIN_CONFIDENCE,
        numFaces: config.numFaces ?? 1,
        delegate: config.delegate ?? "CPU",
        runningMode: config.runningMode ?? "VIDEO"
      };
    }
    /**
     * Initialize the face landmarker by loading the model.
     * Uses VIDEO mode for optimal webcam performance with temporal tracking.
     * Uses configurable delegate (GPU by default for WebGL acceleration).
     * Must be called before detect().
     */
    async initialize() {
      const vision = shouldUseStaticVisionFileset() ? createStaticVisionFileset(this.config.wasmPath) : await Zo.forVisionTasks(this.config.wasmPath);
      this.landmarker = await Sc.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: this.config.modelPath,
          delegate: this.config.delegate
        },
        runningMode: this.config.runningMode,
        numFaces: this.config.numFaces,
        minFaceDetectionConfidence: this.config.minDetectionConfidence,
        minTrackingConfidence: this.config.minDetectionConfidence,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
        // Enable head pose matrices
      });
    }
    /**
     * Check if the landmarker is initialized and ready to use.
     */
    isReady() {
      return this.landmarker !== null;
    }
    /**
     * Detect face landmarks in a video frame.
     * Uses detectForVideo with monotonically increasing timestamps for VIDEO mode.
     *
     * @param image - The video frame to detect faces in
     * @returns The first detected face with landmarks, or null if no face is found
     */
    detect(image) {
      if (!this.landmarker) {
        console.warn("[FaceLandmarkerAdapter] detect() called before initialize() or after close(). Returning null.");
        return null;
      }
      let imageWidth;
      let imageHeight;
      if (image instanceof ImageData) {
        imageWidth = image.width;
        imageHeight = image.height;
      } else if (image instanceof HTMLVideoElement) {
        imageWidth = image.videoWidth || image.width;
        imageHeight = image.videoHeight || image.height;
      } else {
        imageWidth = image.width;
        imageHeight = image.height;
      }
      let result;
      if (this.config.runningMode === "IMAGE") {
        result = this.landmarker.detect(image);
      } else {
        const now = performance.now();
        const timestamp = Math.max(now, this.lastTimestamp + 1);
        this.lastTimestamp = timestamp;
        result = this.landmarker.detectForVideo(image, timestamp);
      }
      if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
        return null;
      }
      const landmarks = result.faceLandmarks[0];
      const boundingBox = this.calculateBoundingBox(landmarks, imageWidth, imageHeight);
      const keypoints = this.extractKeypoints(landmarks, imageWidth, imageHeight);
      const confidence = 0.95;
      const blendshapes = this.extractBlendshapes(result.faceBlendshapes?.[0]);
      let transformationMatrix;
      let headPose;
      if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
        const matrix2 = result.facialTransformationMatrixes[0];
        if (matrix2 && matrix2.data) {
          transformationMatrix = [
            [matrix2.data[0], matrix2.data[1], matrix2.data[2], matrix2.data[3]],
            [matrix2.data[4], matrix2.data[5], matrix2.data[6], matrix2.data[7]],
            [matrix2.data[8], matrix2.data[9], matrix2.data[10], matrix2.data[11]],
            [matrix2.data[12], matrix2.data[13], matrix2.data[14], matrix2.data[15]]
          ];
          headPose = this.extractHeadPose(transformationMatrix);
          this.hasLoggedHeadPose = true;
        }
      } else {
        this.hasLoggedNoMatrix = true;
      }
      return {
        boundingBox,
        confidence,
        keypoints,
        allLandmarks: landmarks,
        blendshapes,
        transformationMatrix,
        headPose
      };
    }
    /**
     * Extract head pose (yaw, pitch, roll) from transformation matrix.
     * The matrix is a 4x4 affine transformation in row-major order.
     * Rotation is extracted from the 3x3 rotation submatrix.
     */
    extractHeadPose(matrix2) {
      const r00 = matrix2[0][0], r01 = matrix2[0][1];
      const r10 = matrix2[1][0], r11 = matrix2[1][1];
      const r20 = matrix2[2][0], r21 = matrix2[2][1], r22 = matrix2[2][2];
      let pitch, yaw, roll;
      if (Math.abs(r20) < 0.99999) {
        pitch = Math.asin(-r20);
        yaw = Math.atan2(r10, r00);
        roll = Math.atan2(r21, r22);
      } else {
        pitch = r20 < 0 ? Math.PI / 2 : -Math.PI / 2;
        yaw = Math.atan2(-r01, r11);
        roll = 0;
      }
      const translationX = matrix2[0][3];
      const translationY = matrix2[1][3];
      const translationZ = matrix2[2][3];
      return {
        yaw,
        pitch,
        roll,
        translationX,
        translationY,
        translationZ
      };
    }
    /**
     * Calculate face bounding box from landmarks.
     */
    calculateBoundingBox(landmarks, imageWidth, imageHeight) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const lm of landmarks) {
        const x2 = lm.x * imageWidth;
        const y2 = lm.y * imageHeight;
        if (x2 < minX)
          minX = x2;
        if (y2 < minY)
          minY = y2;
        if (x2 > maxX)
          maxX = x2;
        if (y2 > maxY)
          maxY = y2;
      }
      const width = maxX - minX;
      const height = maxY - minY;
      const paddingX = width * 0.05;
      const paddingY = height * 0.05;
      return {
        x: Math.max(0, minX - paddingX),
        y: Math.max(0, minY - paddingY),
        width: width + paddingX * 2,
        height: height + paddingY * 2
      };
    }
    /**
     * Extract key landmarks as FaceKeypoint objects.
     * Maps 478 landmarks to the 6 key points expected by the feature extractor,
     * using iris centers for precise eye positioning.
     */
    extractKeypoints(landmarks, imageWidth, imageHeight) {
      const toPixel = (lm) => ({
        x: lm.x * imageWidth,
        y: lm.y * imageHeight,
        z: lm.z
        // Keep z for potential future use
      });
      const keypoints = [];
      const rightIris = landmarks[LANDMARK_INDICES.RIGHT_IRIS_CENTER];
      if (rightIris) {
        const pos = toPixel(rightIris);
        keypoints.push({ x: pos.x, y: pos.y, name: "right_eye" });
      }
      const leftIris = landmarks[LANDMARK_INDICES.LEFT_IRIS_CENTER];
      if (leftIris) {
        const pos = toPixel(leftIris);
        keypoints.push({ x: pos.x, y: pos.y, name: "left_eye" });
      }
      const nose = landmarks[LANDMARK_INDICES.NOSE_TIP];
      if (nose) {
        const pos = toPixel(nose);
        keypoints.push({ x: pos.x, y: pos.y, name: "nose_tip" });
      }
      const rightCheek = landmarks[LANDMARK_INDICES.RIGHT_CHEEK];
      if (rightCheek) {
        const pos = toPixel(rightCheek);
        keypoints.push({ x: pos.x, y: pos.y, name: "right_ear_tragion" });
      }
      const leftCheek = landmarks[LANDMARK_INDICES.LEFT_CHEEK];
      if (leftCheek) {
        const pos = toPixel(leftCheek);
        keypoints.push({ x: pos.x, y: pos.y, name: "left_ear_tragion" });
      }
      return keypoints;
    }
    /**
     * Get eye bounding box from landmarks for more precise eye cropping.
     * Returns a box that encompasses the eye based on corner landmarks.
     *
     * @param landmarks - All face landmarks (normalized)
     * @param eye - 'left' or 'right'
     * @param imageWidth - Image width in pixels
     * @param imageHeight - Image height in pixels
     * @param padding - Extra padding as a fraction of eye size (default 0.3)
     * @returns Bounding box for the eye region
     */
    getEyeBoundingBox(landmarks, eye, imageWidth, imageHeight, padding = 0.3) {
      const indices = eye === "left" ? {
        outer: LANDMARK_INDICES.LEFT_EYE_OUTER,
        inner: LANDMARK_INDICES.LEFT_EYE_INNER,
        upper: LANDMARK_INDICES.LEFT_EYE_UPPER,
        lower: LANDMARK_INDICES.LEFT_EYE_LOWER
      } : {
        outer: LANDMARK_INDICES.RIGHT_EYE_OUTER,
        inner: LANDMARK_INDICES.RIGHT_EYE_INNER,
        upper: LANDMARK_INDICES.RIGHT_EYE_UPPER,
        lower: LANDMARK_INDICES.RIGHT_EYE_LOWER
      };
      const outer = landmarks[indices.outer];
      const inner = landmarks[indices.inner];
      const upper = landmarks[indices.upper];
      const lower = landmarks[indices.lower];
      const eyeWidth = Math.abs(inner.x - outer.x) * imageWidth;
      const eyeHeight = Math.abs(lower.y - upper.y) * imageHeight;
      const eyeCenterX = (outer.x + inner.x) / 2 * imageWidth;
      const eyeCenterY = (upper.y + lower.y) / 2 * imageHeight;
      const size = Math.max(eyeWidth, eyeHeight);
      const paddedSize = size * (1 + padding * 2);
      return {
        x: eyeCenterX - paddedSize / 2,
        y: eyeCenterY - paddedSize / 2,
        width: paddedSize,
        height: paddedSize
      };
    }
    /**
     * Get eye bounding box using RealEye's precise multi-landmark approach.
     * Uses multiple landmarks per boundary to find tight min/max coordinates
     * for non-square eye cropping (matches RealEye production WebGazer).
     *
     * @param landmarks - All face landmarks (normalized)
     * @param eye - 'left' or 'right'
     * @param imageWidth - Image width in pixels
     * @param imageHeight - Image height in pixels
     * @returns Bounding box for the eye region (non-square, tight fit)
     */
    getEyeBoundingBoxRealEye(landmarks, eye, imageWidth, imageHeight) {
      const indices = eye === "left" ? {
        minX: REALEYE_EYE_INDICES.LEFT_MIN_X,
        minY: REALEYE_EYE_INDICES.LEFT_MIN_Y,
        maxX: REALEYE_EYE_INDICES.LEFT_MAX_X,
        maxY: REALEYE_EYE_INDICES.LEFT_MAX_Y
      } : {
        minX: REALEYE_EYE_INDICES.RIGHT_MIN_X,
        minY: REALEYE_EYE_INDICES.RIGHT_MIN_Y,
        maxX: REALEYE_EYE_INDICES.RIGHT_MAX_X,
        maxY: REALEYE_EYE_INDICES.RIGHT_MAX_Y
      };
      const minX = Math.min(...indices.minX.map((i2) => landmarks[i2].x * imageWidth));
      const minY = Math.min(...indices.minY.map((i2) => landmarks[i2].y * imageHeight));
      const maxX = Math.max(...indices.maxX.map((i2) => landmarks[i2].x * imageWidth));
      const maxY = Math.max(...indices.maxY.map((i2) => landmarks[i2].y * imageHeight));
      return {
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.round(maxX - minX),
        height: Math.round(maxY - minY)
      };
    }
    /**
     * Extract blendshapes from MediaPipe classifications to our typed structure.
     * Returns only the 22 eye/brow/nose related blendshapes we need for gaze prediction.
     */
    extractBlendshapes(classifications) {
      if (!classifications || !classifications.categories) {
        return void 0;
      }
      const blendshapeMap = {};
      for (const cat of classifications.categories) {
        if (cat.categoryName) {
          blendshapeMap[cat.categoryName] = cat.score;
        }
      }
      return {
        browDownLeft: blendshapeMap["browDownLeft"] ?? 0,
        browDownRight: blendshapeMap["browDownRight"] ?? 0,
        browInnerUp: blendshapeMap["browInnerUp"] ?? 0,
        browOuterUpLeft: blendshapeMap["browOuterUpLeft"] ?? 0,
        browOuterUpRight: blendshapeMap["browOuterUpRight"] ?? 0,
        cheekPuff: blendshapeMap["cheekPuff"] ?? 0,
        eyeBlinkLeft: blendshapeMap["eyeBlinkLeft"] ?? 0,
        eyeBlinkRight: blendshapeMap["eyeBlinkRight"] ?? 0,
        eyeLookDownLeft: blendshapeMap["eyeLookDownLeft"] ?? 0,
        eyeLookDownRight: blendshapeMap["eyeLookDownRight"] ?? 0,
        eyeLookInLeft: blendshapeMap["eyeLookInLeft"] ?? 0,
        eyeLookInRight: blendshapeMap["eyeLookInRight"] ?? 0,
        eyeLookOutLeft: blendshapeMap["eyeLookOutLeft"] ?? 0,
        eyeLookOutRight: blendshapeMap["eyeLookOutRight"] ?? 0,
        eyeLookUpLeft: blendshapeMap["eyeLookUpLeft"] ?? 0,
        eyeLookUpRight: blendshapeMap["eyeLookUpRight"] ?? 0,
        eyeSquintLeft: blendshapeMap["eyeSquintLeft"] ?? 0,
        eyeSquintRight: blendshapeMap["eyeSquintRight"] ?? 0,
        eyeWideLeft: blendshapeMap["eyeWideLeft"] ?? 0,
        eyeWideRight: blendshapeMap["eyeWideRight"] ?? 0,
        noseSneerLeft: blendshapeMap["noseSneerLeft"] ?? 0,
        noseSneerRight: blendshapeMap["noseSneerRight"] ?? 0
      };
    }
    /**
     * Clean up resources.
     */
    close() {
      if (this.landmarker) {
        this.landmarker.close();
        this.landmarker = null;
      }
    }
  };

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/face/BlazeFaceAdapter.js
  var DEFAULT_MODEL_PATH2 = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
  var DEFAULT_WASM_PATH2 = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
  var DEFAULT_MIN_CONFIDENCE2 = 0.5;
  var normalizeWasmPath2 = (wasmPath) => wasmPath.endsWith("/") ? wasmPath.slice(0, -1) : wasmPath;
  var shouldUseStaticVisionFileset2 = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("webcamEtLightE2E")) {
        return true;
      }
    }
    return typeof navigator !== "undefined" && navigator.userAgent.includes("HeadlessChrome");
  };
  var createStaticVisionFileset2 = (wasmPath) => {
    const basePath = normalizeWasmPath2(wasmPath);
    return {
      wasmLoaderPath: `${basePath}/vision_wasm_nosimd_internal.js`,
      wasmBinaryPath: `${basePath}/vision_wasm_nosimd_internal.wasm`
    };
  };
  var KEYPOINT_NAMES = [
    "right_eye",
    "left_eye",
    "nose_tip",
    "mouth_center",
    "right_ear_tragion",
    "left_ear_tragion"
  ];
  var BlazeFaceAdapter = class {
    detector = null;
    config;
    constructor(config = {}) {
      this.config = {
        modelPath: config.modelPath ?? DEFAULT_MODEL_PATH2,
        wasmPath: config.wasmPath ?? DEFAULT_WASM_PATH2,
        minDetectionConfidence: config.minDetectionConfidence ?? DEFAULT_MIN_CONFIDENCE2
      };
    }
    /**
     * Initialize the face detector by loading the model.
     * Must be called before detect().
     */
    async initialize() {
      const vision = shouldUseStaticVisionFileset2() ? createStaticVisionFileset2(this.config.wasmPath) : await Zo.forVisionTasks(this.config.wasmPath);
      this.detector = await pc.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: this.config.modelPath
        },
        runningMode: "IMAGE",
        minDetectionConfidence: this.config.minDetectionConfidence
      });
    }
    /**
     * Check if the detector is initialized and ready to use.
     */
    isReady() {
      return this.detector !== null;
    }
    /**
     * Detect face in an image.
     *
     * @param image - The image to detect face in
     * @returns The first detected face, or null if no face is found
     */
    detect(image) {
      if (!this.detector) {
        console.warn("[BlazeFaceAdapter] detect() called before initialize() or after close(). Returning null.");
        return null;
      }
      const result = this.detector.detect(image);
      if (result.detections.length === 0) {
        return null;
      }
      let imageWidth;
      let imageHeight;
      if (image instanceof ImageData) {
        imageWidth = image.width;
        imageHeight = image.height;
      } else if (image instanceof HTMLVideoElement) {
        imageWidth = image.videoWidth || image.width;
        imageHeight = image.videoHeight || image.height;
      } else {
        imageWidth = image.width;
        imageHeight = image.height;
      }
      const detection = result.detections[0];
      const bbox = detection.boundingBox;
      if (!bbox) {
        return null;
      }
      const boundingBox = {
        x: bbox.originX,
        y: bbox.originY,
        width: bbox.width,
        height: bbox.height
      };
      const keypoints = (detection.keypoints ?? []).map((kp, index) => ({
        x: kp.x * imageWidth,
        y: kp.y * imageHeight,
        name: KEYPOINT_NAMES[index] || `keypoint_${index}`
      })).filter((kp) => kp.name !== "mouth_center");
      const confidence = detection.categories?.[0]?.score ?? 0;
      return {
        boundingBox,
        confidence,
        keypoints
      };
    }
    /**
     * Clean up resources.
     */
    close() {
      if (this.detector) {
        this.detector.close();
        this.detector = null;
      }
    }
  };

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/face/FaceDetector.js
  var DEFAULT_LANDMARKER_MODEL_PATH = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
  var DEFAULT_BLAZEFACE_MODEL_PATH = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
  var DEFAULT_WASM_PATH3 = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
  var DEFAULT_MIN_CONFIDENCE3 = 0.5;
  var FaceDetector = class {
    landmarkerAdapter = null;
    blazefaceAdapter = null;
    config;
    mode;
    constructor(config = {}) {
      this.mode = config.mode ?? "landmarker";
      const defaultModelPath = this.mode === "landmarker" ? DEFAULT_LANDMARKER_MODEL_PATH : DEFAULT_BLAZEFACE_MODEL_PATH;
      this.config = {
        modelPath: config.modelPath ?? defaultModelPath,
        wasmPath: config.wasmPath ?? DEFAULT_WASM_PATH3,
        minDetectionConfidence: config.minDetectionConfidence ?? DEFAULT_MIN_CONFIDENCE3,
        mode: this.mode,
        delegate: config.delegate ?? "GPU",
        runningMode: config.runningMode ?? "VIDEO"
      };
    }
    /**
     * Get the current detection mode.
     */
    getMode() {
      return this.mode;
    }
    /**
     * Initialize the face detector by loading the model.
     * Must be called before detect().
     */
    async initialize() {
      if (this.mode === "landmarker") {
        this.landmarkerAdapter = new FaceLandmarkerAdapter({
          modelPath: this.config.modelPath,
          wasmPath: this.config.wasmPath,
          minDetectionConfidence: this.config.minDetectionConfidence,
          delegate: this.config.delegate,
          runningMode: this.config.runningMode
        });
        await this.landmarkerAdapter.initialize();
      } else {
        this.blazefaceAdapter = new BlazeFaceAdapter({
          modelPath: this.config.modelPath,
          wasmPath: this.config.wasmPath,
          minDetectionConfidence: this.config.minDetectionConfidence
        });
        await this.blazefaceAdapter.initialize();
      }
    }
    /**
     * Check if the detector is initialized and ready to use.
     */
    isReady() {
      if (this.mode === "landmarker") {
        return this.landmarkerAdapter !== null && this.landmarkerAdapter.isReady();
      } else {
        return this.blazefaceAdapter !== null && this.blazefaceAdapter.isReady();
      }
    }
    /**
     * Detect faces in an image.
     *
     * @param image - The image to detect faces in (ImageData, HTMLImageElement, etc.)
     * @returns The first detected face, or null if no face is found.
     */
    detect(image) {
      if (this.mode === "landmarker") {
        if (!this.landmarkerAdapter) {
          console.warn("[FaceDetector] detect() called before initialize() or after close(). Returning null.");
          return null;
        }
        const result = this.landmarkerAdapter.detect(image);
        if (!result) {
          return null;
        }
        return {
          boundingBox: result.boundingBox,
          confidence: result.confidence,
          keypoints: result.keypoints
        };
      } else {
        if (!this.blazefaceAdapter) {
          console.warn("[FaceDetector] detect() called before initialize() or after close(). Returning null.");
          return null;
        }
        return this.blazefaceAdapter.detect(image);
      }
    }
    /**
     * Detect faces in an image and return full landmark data.
     * This provides access to all 478 landmarks for advanced processing.
     * Only available in 'landmarker' mode.
     *
     * @param image - The image to detect faces in
     * @returns The detected face with all landmarks, or null if no face is found.
     */
    detectWithLandmarks(image) {
      if (this.mode !== "landmarker") {
        console.warn("detectWithLandmarks() is only available in landmarker mode");
      }
      if (!this.landmarkerAdapter) {
        console.warn("[FaceDetector] detectWithLandmarks() called before initialize() or after close(). Returning null.");
        return null;
      }
      return this.landmarkerAdapter.detect(image);
    }
    /**
     * Clean up resources.
     */
    close() {
      if (this.landmarkerAdapter) {
        this.landmarkerAdapter.close();
        this.landmarkerAdapter = null;
      }
      if (this.blazefaceAdapter) {
        this.blazefaceAdapter.close();
        this.blazefaceAdapter = null;
      }
    }
  };

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/features/EyeBoxScale.js
  var EYE_BOX_SCALE = 1.2;

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/features/FeatureExtractor.js
  var DEFAULT_FACE_SIZE = 16;
  var EYE_CROP_PADDING = 4;
  var MIN_STD_DEV = 1e-6;
  function extractCombinedFeatures(imageData, boundingBox, keypoints, useLandmarks = true, fullLandmarks, imageWidth, imageHeight, eyeWidth = EYE_INPUT_WIDTH, eyeHeight = EYE_INPUT_HEIGHT, blendshapes, headPose) {
    if (useLandmarks) {
      return extractLandmarkPlusEyeFeatures(imageData, boundingBox, keypoints, fullLandmarks, imageWidth, imageHeight, eyeWidth, eyeHeight, blendshapes, headPose);
    }
    const faceFeatures = extractFaceFeatures(imageData, boundingBox, DEFAULT_FACE_SIZE);
    if (!keypoints || keypoints.length === 0) {
      faceFeatures.push(1);
      return faceFeatures;
    }
    const leftEye = keypoints.find((kp) => kp.name === "left_eye" || kp.name === "leftEye");
    const rightEye = keypoints.find((kp) => kp.name === "right_eye" || kp.name === "rightEye");
    if (leftEye && rightEye && fullLandmarks && fullLandmarks.length >= 478 && imageWidth && imageHeight) {
      const leftEyeFeatures = extractRealEyeEyeFeatures(imageData, fullLandmarks, "left", imageWidth, imageHeight, eyeWidth, eyeHeight);
      const rightEyeFeatures = extractRealEyeEyeFeatures(imageData, fullLandmarks, "right", imageWidth, imageHeight, eyeWidth, eyeHeight);
      return [...faceFeatures, ...leftEyeFeatures, ...rightEyeFeatures, 1];
    }
    faceFeatures.push(1);
    return faceFeatures;
  }
  var AUGMENTATION_OFFSETS_1PX = [
    [0, 0],
    // original (center)
    [-1, -1],
    // top-left
    [-1, 0],
    // left
    [-1, 1],
    // bottom-left
    [0, -1],
    // top
    [0, 1],
    // bottom
    [1, -1],
    // top-right
    [1, 0],
    // right
    [1, 1]
    // bottom-right
  ];
  var activeAugmentationOffsets = AUGMENTATION_OFFSETS_1PX;
  function extractAugmentedFeatures(imageData, boundingBox, keypoints, fullLandmarks, imageWidth, imageHeight, eyeWidth = EYE_INPUT_WIDTH, eyeHeight = EYE_INPUT_HEIGHT, blendshapes, headPose) {
    const results = [];
    for (const [offsetX, offsetY] of activeAugmentationOffsets) {
      const features = extractLandmarkPlusEyeFeaturesWithOffset(imageData, boundingBox, keypoints, fullLandmarks, imageWidth, imageHeight, eyeWidth, eyeHeight, blendshapes, offsetX, offsetY, headPose);
      results.push(features);
    }
    return results;
  }
  function extractLandmarkPlusEyeFeatures(imageData, boundingBox, keypoints, fullLandmarks, imageWidth, imageHeight, eyeWidth = EYE_INPUT_WIDTH, eyeHeight = EYE_INPUT_HEIGHT, blendshapes, headPose) {
    if (fullLandmarks && fullLandmarks.length >= 478 && imageWidth && imageHeight) {
      return extractEnhancedLandmarkFeatures(imageData, boundingBox, keypoints, fullLandmarks, imageWidth, imageHeight, eyeWidth, eyeHeight, blendshapes, headPose);
    }
    const features = [];
    const faceW = boundingBox.width;
    const faceH = boundingBox.height;
    const faceCenterX = boundingBox.x + faceW / 2;
    const faceCenterY = boundingBox.y + faceH / 2;
    const leftEye = keypoints.find((kp) => kp.name === "left_eye" || kp.name === "leftEye");
    const rightEye = keypoints.find((kp) => kp.name === "right_eye" || kp.name === "rightEye");
    const nose = keypoints.find((kp) => kp.name === "nose_tip" || kp.name === "noseTip");
    const leftEar = keypoints.find((kp) => kp.name === "left_ear_tragion" || kp.name === "leftEarTragion");
    const rightEar = keypoints.find((kp) => kp.name === "right_ear_tragion" || kp.name === "rightEarTragion");
    for (const kp of keypoints) {
      features.push((kp.x - faceCenterX) / faceW);
      features.push((kp.y - faceCenterY) / faceH);
    }
    if (leftEye && rightEye) {
      const eyeMidX = (leftEye.x + rightEye.x) / 2;
      const eyeMidY = (leftEye.y + rightEye.y) / 2;
      const eyeDist = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
      features.push(eyeDist / faceW);
      features.push((rightEye.y - leftEye.y) / faceH);
      features.push((eyeMidX - faceCenterX) / faceW);
      features.push((eyeMidY - faceCenterY) / faceH);
      if (nose) {
        features.push((nose.x - eyeMidX) / faceW);
        features.push((nose.y - eyeMidY) / faceH);
        features.push((nose.x - faceCenterX) / faceW);
        features.push((nose.y - faceCenterY) / faceH);
      }
      if (leftEar && rightEar) {
        const earDist = Math.sqrt(Math.pow(rightEar.x - leftEar.x, 2) + Math.pow(rightEar.y - leftEar.y, 2));
        features.push(earDist / faceW);
        features.push((rightEar.x - leftEar.x) / faceW);
        features.push((rightEar.y - leftEar.y) / faceH);
      }
    }
    const normalizedLandmarks = zScoreNormalize(features);
    normalizedLandmarks.push(1);
    return normalizedLandmarks;
  }
  function extractLandmarkPlusEyeFeaturesWithOffset(imageData, boundingBox, keypoints, fullLandmarks, imageWidth, imageHeight, eyeWidth = EYE_INPUT_WIDTH, eyeHeight = EYE_INPUT_HEIGHT, blendshapes, offsetX = 0, offsetY = 0, headPose) {
    return extractEnhancedLandmarkFeaturesWithOffset(imageData, boundingBox, keypoints, fullLandmarks, imageWidth, imageHeight, eyeWidth, eyeHeight, blendshapes, offsetX, offsetY, headPose);
  }
  function extractEnhancedLandmarkFeatures(imageData, boundingBox, _keypoints, landmarks, imageWidth, imageHeight, eyeWidth = EYE_INPUT_WIDTH, eyeHeight = EYE_INPUT_HEIGHT, _blendshapes, _headPose) {
    const features = [];
    const faceW = boundingBox.width;
    const faceH = boundingBox.height;
    const faceCenterX = boundingBox.x + faceW / 2;
    const faceCenterY = boundingBox.y + faceH / 2;
    const getLandmark = (index) => {
      const lm = landmarks[index];
      if (!lm)
        return null;
      const x2 = lm.x * imageWidth;
      const y2 = lm.y * imageHeight;
      return {
        nx: (x2 - faceCenterX) / faceW,
        ny: (y2 - faceCenterY) / faceH
      };
    };
    const landmarkPositions = [
      getLandmark(LANDMARK_INDICES.LEFT_IRIS_CENTER),
      getLandmark(LANDMARK_INDICES.RIGHT_IRIS_CENTER),
      getLandmark(LANDMARK_INDICES.LEFT_EYE_OUTER),
      getLandmark(LANDMARK_INDICES.LEFT_EYE_INNER),
      getLandmark(LANDMARK_INDICES.RIGHT_EYE_OUTER),
      getLandmark(LANDMARK_INDICES.RIGHT_EYE_INNER),
      getLandmark(LANDMARK_INDICES.LEFT_EYE_UPPER),
      getLandmark(LANDMARK_INDICES.LEFT_EYE_LOWER),
      getLandmark(LANDMARK_INDICES.RIGHT_EYE_UPPER),
      getLandmark(LANDMARK_INDICES.RIGHT_EYE_LOWER),
      getLandmark(LANDMARK_INDICES.NOSE_TIP),
      getLandmark(LANDMARK_INDICES.CHIN),
      getLandmark(LANDMARK_INDICES.FOREHEAD_TOP),
      getLandmark(LANDMARK_INDICES.LEFT_CHEEK),
      getLandmark(LANDMARK_INDICES.RIGHT_CHEEK)
    ];
    for (const lm of landmarkPositions) {
      if (lm) {
        features.push(lm.nx, lm.ny);
      } else {
        features.push(0, 0);
      }
    }
    const normalizedLandmarks = zScoreNormalize(features);
    const leftEyeFeatures = extractRealEyeEyeFeatures(imageData, landmarks, "left", imageWidth, imageHeight, eyeWidth, eyeHeight);
    const rightEyeFeatures = extractRealEyeEyeFeatures(imageData, landmarks, "right", imageWidth, imageHeight, eyeWidth, eyeHeight);
    return [...normalizedLandmarks, ...leftEyeFeatures, ...rightEyeFeatures, 1];
  }
  function extractEnhancedLandmarkFeaturesWithOffset(imageData, boundingBox, _keypoints, landmarks, imageWidth, imageHeight, eyeWidth = EYE_INPUT_WIDTH, eyeHeight = EYE_INPUT_HEIGHT, _blendshapes, offsetX = 0, offsetY = 0, _headPose) {
    const features = [];
    const faceW = boundingBox.width;
    const faceH = boundingBox.height;
    const faceCenterX = boundingBox.x + faceW / 2;
    const faceCenterY = boundingBox.y + faceH / 2;
    const getLandmark = (index) => {
      const lm = landmarks[index];
      if (!lm)
        return null;
      const x2 = lm.x * imageWidth;
      const y2 = lm.y * imageHeight;
      return {
        nx: (x2 - faceCenterX) / faceW,
        ny: (y2 - faceCenterY) / faceH
      };
    };
    const landmarkPositions = [
      getLandmark(LANDMARK_INDICES.LEFT_IRIS_CENTER),
      getLandmark(LANDMARK_INDICES.RIGHT_IRIS_CENTER),
      getLandmark(LANDMARK_INDICES.LEFT_EYE_OUTER),
      getLandmark(LANDMARK_INDICES.LEFT_EYE_INNER),
      getLandmark(LANDMARK_INDICES.RIGHT_EYE_OUTER),
      getLandmark(LANDMARK_INDICES.RIGHT_EYE_INNER),
      getLandmark(LANDMARK_INDICES.LEFT_EYE_UPPER),
      getLandmark(LANDMARK_INDICES.LEFT_EYE_LOWER),
      getLandmark(LANDMARK_INDICES.RIGHT_EYE_UPPER),
      getLandmark(LANDMARK_INDICES.RIGHT_EYE_LOWER),
      getLandmark(LANDMARK_INDICES.NOSE_TIP),
      getLandmark(LANDMARK_INDICES.CHIN),
      getLandmark(LANDMARK_INDICES.FOREHEAD_TOP),
      getLandmark(LANDMARK_INDICES.LEFT_CHEEK),
      getLandmark(LANDMARK_INDICES.RIGHT_CHEEK)
    ];
    for (const lm of landmarkPositions) {
      if (lm) {
        features.push(lm.nx, lm.ny);
      } else {
        features.push(0, 0);
      }
    }
    const normalizedLandmarks = zScoreNormalize(features);
    const leftEyeFeatures = extractRealEyeEyeFeatures(imageData, landmarks, "left", imageWidth, imageHeight, eyeWidth, eyeHeight, offsetX, offsetY);
    const rightEyeFeatures = extractRealEyeEyeFeatures(imageData, landmarks, "right", imageWidth, imageHeight, eyeWidth, eyeHeight, offsetX, offsetY);
    return [...normalizedLandmarks, ...leftEyeFeatures, ...rightEyeFeatures, 1];
  }
  var LANDMARK_FEATURE_COUNT = 21;
  var ENHANCED_LANDMARK_FEATURE_COUNT = 30;
  function extractFaceFeatures(imageData, boundingBox, faceSize) {
    const cropped = cropImage(imageData, boundingBox);
    const resized = resizeImage(cropped, faceSize, faceSize);
    const grayscale = toGrayscale(resized);
    return zScoreNormalize(grayscale);
  }
  function extractRealEyeEyeFeatures(imageData, landmarks, eye, imageWidth, imageHeight, targetWidth = EYE_INPUT_WIDTH, targetHeight = EYE_INPUT_HEIGHT, offsetX = 0, offsetY = 0) {
    const indices = eye === "left" ? {
      minX: REALEYE_EYE_INDICES.LEFT_MIN_X,
      minY: REALEYE_EYE_INDICES.LEFT_MIN_Y,
      maxX: REALEYE_EYE_INDICES.LEFT_MAX_X,
      maxY: REALEYE_EYE_INDICES.LEFT_MAX_Y
    } : {
      minX: REALEYE_EYE_INDICES.RIGHT_MIN_X,
      minY: REALEYE_EYE_INDICES.RIGHT_MIN_Y,
      maxX: REALEYE_EYE_INDICES.RIGHT_MAX_X,
      maxY: REALEYE_EYE_INDICES.RIGHT_MAX_Y
    };
    const rawMinX = Math.min(...indices.minX.map((i2) => landmarks[i2].x * imageWidth));
    const rawMinY = Math.min(...indices.minY.map((i2) => landmarks[i2].y * imageHeight));
    const rawMaxX = Math.max(...indices.maxX.map((i2) => landmarks[i2].x * imageWidth));
    const rawMaxY = Math.max(...indices.maxY.map((i2) => landmarks[i2].y * imageHeight));
    const boxWidth = rawMaxX - rawMinX;
    const boxHeight = rawMaxY - rawMinY;
    const centerX = (rawMinX + rawMaxX) / 2;
    const centerY = (rawMinY + rawMaxY) / 2;
    const scaledWidth = boxWidth * EYE_BOX_SCALE;
    const scaledHeight = boxHeight * EYE_BOX_SCALE;
    const minX = centerX - scaledWidth / 2;
    const minY = centerY - scaledHeight / 2;
    const padding = EYE_CROP_PADDING;
    const paddedBox = {
      x: Math.round(minX) - padding,
      y: Math.round(minY) - padding,
      width: Math.round(scaledWidth) + 2 * padding,
      height: Math.round(scaledHeight) + 2 * padding
    };
    const cropped = cropImage(imageData, paddedBox);
    const intermediateWidth = targetWidth + 2 * padding;
    const intermediateHeight = targetHeight + 2 * padding;
    const resizedIntermediate = resizeImage(cropped, intermediateWidth, intermediateHeight);
    const resized = offsetCrop(resizedIntermediate, targetWidth, targetHeight, offsetX, offsetY, padding);
    const grayscale = toGrayscale(resized);
    return zScoreNormalize(grayscale);
  }
  function offsetCrop(imageData, targetWidth, targetHeight, offsetX, offsetY, padding) {
    const { width: srcWidth, height: srcHeight, data: srcData } = imageData;
    const startX = padding + offsetX;
    const startY = padding + offsetY;
    const safeStartX = Math.max(0, Math.min(startX, srcWidth - targetWidth));
    const safeStartY = Math.max(0, Math.min(startY, srcHeight - targetHeight));
    const actualWidth = Math.min(targetWidth, srcWidth - safeStartX);
    const actualHeight = Math.min(targetHeight, srcHeight - safeStartY);
    const cropped = new Uint8ClampedArray(actualWidth * actualHeight * 4);
    for (let row = 0; row < actualHeight; row++) {
      for (let col = 0; col < actualWidth; col++) {
        const srcIdx = ((safeStartY + row) * srcWidth + (safeStartX + col)) * 4;
        const dstIdx = (row * actualWidth + col) * 4;
        cropped[dstIdx] = srcData[srcIdx];
        cropped[dstIdx + 1] = srcData[srcIdx + 1];
        cropped[dstIdx + 2] = srcData[srcIdx + 2];
        cropped[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }
    return new ImageData(cropped, actualWidth, actualHeight);
  }
  function cropImage(imageData, box) {
    const x2 = Math.max(0, Math.floor(box.x));
    const y2 = Math.max(0, Math.floor(box.y));
    const width = Math.min(Math.floor(box.width), imageData.width - x2);
    const height = Math.min(Math.floor(box.height), imageData.height - y2);
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid bounding box: results in zero or negative dimensions");
    }
    const cropped = new Uint8ClampedArray(width * height * 4);
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const srcIdx = ((y2 + row) * imageData.width + (x2 + col)) * 4;
        const dstIdx = (row * width + col) * 4;
        cropped[dstIdx] = imageData.data[srcIdx];
        cropped[dstIdx + 1] = imageData.data[srcIdx + 1];
        cropped[dstIdx + 2] = imageData.data[srcIdx + 2];
        cropped[dstIdx + 3] = imageData.data[srcIdx + 3];
      }
    }
    return new ImageData(cropped, width, height);
  }
  function resizeImage(imageData, newWidth, newHeight) {
    const { width: srcWidth, height: srcHeight, data: srcData } = imageData;
    const dstData = new Uint8ClampedArray(newWidth * newHeight * 4);
    const xRatio = srcWidth / newWidth;
    const yRatio = srcHeight / newHeight;
    for (let dstY = 0; dstY < newHeight; dstY++) {
      for (let dstX = 0; dstX < newWidth; dstX++) {
        const srcX = dstX * xRatio;
        const srcY = dstY * yRatio;
        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = Math.min(x0 + 1, srcWidth - 1);
        const y1 = Math.min(y0 + 1, srcHeight - 1);
        const xWeight = srcX - x0;
        const yWeight = srcY - y0;
        for (let c2 = 0; c2 < 4; c2++) {
          const topLeft = srcData[(y0 * srcWidth + x0) * 4 + c2];
          const topRight = srcData[(y0 * srcWidth + x1) * 4 + c2];
          const bottomLeft = srcData[(y1 * srcWidth + x0) * 4 + c2];
          const bottomRight = srcData[(y1 * srcWidth + x1) * 4 + c2];
          const top = topLeft * (1 - xWeight) + topRight * xWeight;
          const bottom = bottomLeft * (1 - xWeight) + bottomRight * xWeight;
          const value = top * (1 - yWeight) + bottom * yWeight;
          dstData[(dstY * newWidth + dstX) * 4 + c2] = Math.round(value);
        }
      }
    }
    return new ImageData(dstData, newWidth, newHeight);
  }
  function toGrayscale(imageData) {
    const { width, height, data } = imageData;
    const grayscale = [];
    for (let i2 = 0; i2 < width * height; i2++) {
      const r2 = data[i2 * 4];
      const g2 = data[i2 * 4 + 1];
      const b2 = data[i2 * 4 + 2];
      const gray = (r2 + g2 + b2) / 3 / 255;
      grayscale.push(gray);
    }
    return grayscale;
  }
  function zScoreNormalize(values) {
    const n2 = values.length;
    if (n2 === 0)
      return [];
    let sum = 0;
    for (let i2 = 0; i2 < n2; i2++) {
      sum += values[i2];
    }
    const mean = sum / n2;
    let sumSqDiff = 0;
    for (let i2 = 0; i2 < n2; i2++) {
      const diff = values[i2] - mean;
      sumSqDiff += diff * diff;
    }
    const std = Math.sqrt(sumSqDiff / n2);
    const effectiveStd = Math.max(std, MIN_STD_DEV);
    const normalized = new Array(n2);
    for (let i2 = 0; i2 < n2; i2++) {
      normalized[i2] = (values[i2] - mean) / effectiveStd;
    }
    return normalized;
  }
  function getCombinedFeatureCount(useLandmarks = true, useEnhancedLandmarks = false, eyeWidth = EYE_INPUT_WIDTH, eyeHeight = EYE_INPUT_HEIGHT) {
    const eyeFeatureCount = 2 * eyeWidth * eyeHeight;
    if (useLandmarks) {
      const landmarkCount = useEnhancedLandmarks ? ENHANCED_LANDMARK_FEATURE_COUNT : LANDMARK_FEATURE_COUNT;
      return landmarkCount + eyeFeatureCount + 1;
    }
    return DEFAULT_FACE_SIZE * DEFAULT_FACE_SIZE + eyeFeatureCount + 1;
  }

  // node_modules/ml-matrix/matrix.mjs
  var matrix = __toESM(require_matrix(), 1);
  var CholeskyDecomposition2 = matrix.CholeskyDecomposition;
  var Matrix2 = matrix.Matrix;
  var matrix_default = matrix.default.Matrix ? matrix.default.Matrix : matrix.Matrix;
  var solve2 = matrix.solve;

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/math/matrix-optimized.js
  function ridgeOptimized(X2, y2, lambda = 1e-5) {
    const n2 = X2.length;
    const p2 = X2[0].length;
    if (y2.length !== n2) {
      throw new Error(`Number of samples in X (${n2}) must match length of y (${y2.length})`);
    }
    const Xm = new Matrix2(X2);
    const ym = Matrix2.columnVector(y2);
    const Xt2 = Xm.transpose();
    const XtX = Xt2.mmul(Xm);
    for (let i2 = 0; i2 < p2; i2++) {
      XtX.set(i2, i2, XtX.get(i2, i2) + lambda);
    }
    const Xty = Xt2.mmul(ym);
    try {
      const cholesky = new CholeskyDecomposition2(XtX);
      const beta = cholesky.solve(Xty);
      return beta.getColumn(0);
    } catch {
      const beta = solve2(XtX, Xty);
      return beta.getColumn(0);
    }
  }
  function dotOptimized(a2, b2) {
    if (a2.length !== b2.length) {
      throw new Error("Vectors must have same length for dot product");
    }
    let sum = 0;
    for (let i2 = 0; i2 < a2.length; i2++) {
      sum += a2[i2] * b2[i2];
    }
    return sum;
  }

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/types.js
  var TrackerState;
  (function(TrackerState2) {
    TrackerState2["Uninitialized"] = "uninitialized";
    TrackerState2["Ready"] = "ready";
    TrackerState2["Calibrated"] = "calibrated";
    TrackerState2["Error"] = "error";
  })(TrackerState || (TrackerState = {}));
  var CalibrationError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "CalibrationError";
    }
  };
  var TrackerNotInitializedError = class extends Error {
    constructor(message = "Tracker must be initialized before use") {
      super(message);
      this.name = "TrackerNotInitializedError";
    }
  };
  var NotCalibratedError = class extends Error {
    constructor(message = "Tracker must be calibrated before prediction") {
      super(message);
      this.name = "NotCalibratedError";
    }
  };

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/WebcamETLight.js
  var MEDIAPIPE_WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
  var FACE_LANDMARKER_CDN = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
  var BLAZE_FACE_CDN = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
  var DEFAULT_CONFIG = {
    modelPath: FACE_LANDMARKER_CDN,
    wasmPath: MEDIAPIPE_WASM_CDN,
    faceDetectorMode: "landmarker",
    // Use Face Landmarker with iris tracking
    useLandmarks: true,
    // Use landmarks + eye images
    eyeWidth: EYE_INPUT_WIDTH,
    // Eye crop width from constants
    eyeHeight: EYE_INPUT_HEIGHT,
    // Eye crop height from constants
    ridgeLambda: 1e-5,
    // Default regularization (insensitive - see experiments)
    minDetectionConfidence: 0.5,
    delegate: "GPU",
    // WebGL for performance (note: non-deterministic)
    runningMode: "VIDEO"
    // VIDEO mode for smooth webcam tracking (non-deterministic)
  };
  var MIN_CALIBRATION_SAMPLES = 5;
  var WebcamETLight = class {
    config;
    faceDetector;
    state = TrackerState.Uninitialized;
    // Ridge regression coefficients
    coefficientsX = null;
    coefficientsY = null;
    // Last calibration training time in milliseconds
    lastTrainingTimeMs = 0;
    // Mean head pose from calibration (for head pose compensation)
    calibrationMeanHeadPose = null;
    // Head pose compensation factors (pixels per radian of rotation)
    // These are learned from empirical testing
    HEAD_POSE_YAW_FACTOR = 500;
    // pixels per radian of yaw
    HEAD_POSE_PITCH_FACTOR = 400;
    // pixels per radian of pitch
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      let modelPath = this.config.modelPath;
      if (!config.modelPath) {
        modelPath = this.config.faceDetectorMode === "blazeface" ? BLAZE_FACE_CDN : FACE_LANDMARKER_CDN;
      }
      console.log("[WebcamETLight] Config:", {
        modelPath,
        wasmPath: this.config.wasmPath,
        mode: this.config.faceDetectorMode
      });
      this.faceDetector = new FaceDetector({
        modelPath,
        wasmPath: this.config.wasmPath,
        minDetectionConfidence: this.config.minDetectionConfidence,
        mode: this.config.faceDetectorMode,
        delegate: this.config.delegate,
        runningMode: this.config.runningMode
      });
    }
    /**
     * Initialize the tracker by loading the face detection model.
     * Must be called before calibrate() or predict().
     */
    async initialize() {
      try {
        await this.faceDetector.initialize();
        this.state = TrackerState.Ready;
      } catch (error) {
        this.state = TrackerState.Error;
        throw error;
      }
    }
    /**
     * Get the current state of the tracker.
     */
    getState() {
      return this.state;
    }
    /**
     * Check if the tracker is initialized and ready.
     */
    isReady() {
      return this.state !== TrackerState.Uninitialized && this.state !== TrackerState.Error;
    }
    /**
     * Check if the tracker is calibrated.
     */
    isCalibrated() {
      return this.state === TrackerState.Calibrated;
    }
    /**
     * Detect face in an image and return the detection result.
     * Useful for visualization or debugging.
     * In landmarker mode, returns full landmarks for enhanced feature extraction.
     *
     * @param image - The image to detect face in
     * @returns The face detection result, or null if no face is found
     */
    detectFace(image) {
      if (this.state === TrackerState.Uninitialized) {
        throw new TrackerNotInitializedError();
      }
      if (this.config.faceDetectorMode === "landmarker") {
        return this.faceDetector.detectWithLandmarks(image);
      }
      return this.faceDetector.detect(image);
    }
    /**
     * Calibrate the tracker using calibration samples.
     *
     * Requires at least 5 samples (ideally: 4 corners + center).
     * Each sample should have a webcam image and the gaze target coordinates.
     *
     * @param samples - Array of calibration samples with images and gaze coordinates
     * @throws CalibrationError if calibration fails
     */
    calibrate(samples) {
      console.log("[Tracker] calibrate() called with", samples.length, "samples");
      if (this.state === TrackerState.Uninitialized) {
        throw new TrackerNotInitializedError();
      }
      if (samples.length < MIN_CALIBRATION_SAMPLES) {
        throw new CalibrationError(`At least ${MIN_CALIBRATION_SAMPLES} calibration samples required, got ${samples.length}`);
      }
      const useEnhancedLandmarks = this.config.faceDetectorMode === "landmarker";
      const featureCount = getCombinedFeatureCount(this.config.useLandmarks, useEnhancedLandmarks, this.config.eyeWidth, this.config.eyeHeight);
      const eyeMode = `eye=${this.config.eyeWidth}x${this.config.eyeHeight}`;
      const featureMode = this.config.useLandmarks ? useEnhancedLandmarks ? "enhanced-landmarks" : "landmarks" : "face-image";
      console.log("[Tracker] Feature count:", featureCount, `(${featureMode}, ${eyeMode})`);
      const X2 = [];
      const yX = [];
      const yY = [];
      const failedSamples = [];
      const calibrationHeadPoses = [];
      console.log("[Tracker] Processing samples...");
      for (let i2 = 0; i2 < samples.length; i2++) {
        const sample = samples[i2];
        console.log(`[Tracker] Sample ${i2}: detecting face...`);
        let detection = null;
        if (this.config.faceDetectorMode === "landmarker") {
          detection = this.faceDetector.detectWithLandmarks(sample.image);
        } else {
          detection = this.faceDetector.detect(sample.image);
        }
        if (!detection) {
          console.log(`[Tracker] Sample ${i2}: NO FACE DETECTED`);
          failedSamples.push(i2);
          continue;
        }
        if (detection.headPose) {
          calibrationHeadPoses.push(detection.headPose);
        }
        const imageWidth = sample.image.width;
        const imageHeight = sample.image.height;
        if (detection.allLandmarks && detection.allLandmarks.length >= 478) {
          const spatiallyAugmentedFeatures = extractAugmentedFeatures(sample.image, detection.boundingBox, detection.keypoints, detection.allLandmarks, imageWidth, imageHeight, this.config.eyeWidth, this.config.eyeHeight, detection.blendshapes, detection.headPose);
          for (const features of spatiallyAugmentedFeatures) {
            if (features.length !== featureCount) {
              throw new CalibrationError(`Feature count mismatch: expected ${featureCount}, got ${features.length}`);
            }
            X2.push(features);
            yX.push(sample.gazeX);
            yY.push(sample.gazeY);
          }
          console.log(`[Tracker] Sample ${i2}: ${spatiallyAugmentedFeatures.length} augmented features extracted`);
        } else {
          const features = extractCombinedFeatures(sample.image, detection.boundingBox, detection.keypoints, this.config.useLandmarks, detection.allLandmarks, imageWidth, imageHeight, this.config.eyeWidth, this.config.eyeHeight, detection.blendshapes, detection.headPose);
          if (features.length !== featureCount) {
            throw new CalibrationError(`Feature count mismatch: expected ${featureCount}, got ${features.length}`);
          }
          X2.push(features);
          yX.push(sample.gazeX);
          yY.push(sample.gazeY);
          console.log(`[Tracker] Sample ${i2}: features extracted (${featureCount} features)`);
        }
      }
      if (failedSamples.length > 0) {
        throw new CalibrationError(`Face not detected in ${failedSamples.length} calibration sample(s): indices ${failedSamples.join(", ")}`);
      }
      if (X2.length < MIN_CALIBRATION_SAMPLES) {
        throw new CalibrationError(`Not enough valid samples after face detection. Need ${MIN_CALIBRATION_SAMPLES}, got ${X2.length}`);
      }
      console.log("[Tracker] Training ridge regression...");
      try {
        const startTime = performance.now();
        this.coefficientsX = ridgeOptimized(X2, yX, this.config.ridgeLambda);
        console.log("[Tracker] X coefficients computed");
        this.coefficientsY = ridgeOptimized(X2, yY, this.config.ridgeLambda);
        this.lastTrainingTimeMs = performance.now() - startTime;
        console.log(`[Tracker] Y coefficients computed (training took ${this.lastTrainingTimeMs.toFixed(2)}ms)`);
        if (calibrationHeadPoses.length > 0) {
          this.calibrationMeanHeadPose = this.computeMeanHeadPose(calibrationHeadPoses);
          const yaws = calibrationHeadPoses.map((p2) => p2.yaw * 180 / Math.PI);
          const pitches = calibrationHeadPoses.map((p2) => p2.pitch * 180 / Math.PI);
          const yawRange = Math.max(...yaws) - Math.min(...yaws);
          const pitchRange = Math.max(...pitches) - Math.min(...pitches);
          console.log("[Tracker] Mean head pose computed:", {
            yaw: (this.calibrationMeanHeadPose.yaw * 180 / Math.PI).toFixed(1) + "\xB0",
            pitch: (this.calibrationMeanHeadPose.pitch * 180 / Math.PI).toFixed(1) + "\xB0",
            roll: (this.calibrationMeanHeadPose.roll * 180 / Math.PI).toFixed(1) + "\xB0"
          });
          console.log("[Tracker] Head pose range during calibration:", {
            yawRange: yawRange.toFixed(1) + "\xB0",
            pitchRange: pitchRange.toFixed(1) + "\xB0",
            samples: calibrationHeadPoses.length
          });
        } else {
          console.log("[Tracker] No head pose data available for compensation");
          this.calibrationMeanHeadPose = null;
        }
        this.state = TrackerState.Calibrated;
        console.log("[Tracker] Calibration COMPLETE! State:", this.state);
      } catch (error) {
        this.state = TrackerState.Error;
        throw new CalibrationError(`Ridge regression failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
    /**
     * Predict gaze coordinates for a webcam image.
     *
     * @param image - The webcam image to predict gaze for
     * @returns The predicted gaze point, or null if no face is detected
     * @throws NotCalibratedError if tracker is not calibrated
     * @throws TrackerNotInitializedError if tracker is not initialized
     */
    predict(image) {
      if (this.state === TrackerState.Uninitialized) {
        throw new TrackerNotInitializedError();
      }
      if (this.state !== TrackerState.Calibrated) {
        throw new NotCalibratedError();
      }
      if (!this.coefficientsX || !this.coefficientsY) {
        throw new NotCalibratedError("Coefficients not available");
      }
      let detection = null;
      if (this.config.faceDetectorMode === "landmarker") {
        detection = this.faceDetector.detectWithLandmarks(image);
      } else {
        detection = this.faceDetector.detect(image);
      }
      if (!detection) {
        return null;
      }
      return this.predictWithDetection(image, detection);
    }
    /**
     * Predict gaze coordinates using a pre-computed face detection.
     * This avoids redundant face detection when the caller already has the detection result.
     *
     * @param image - The webcam image to predict gaze for
     * @param detection - The face detection result from detectFace()
     * @returns The predicted gaze point
     * @throws NotCalibratedError if tracker is not calibrated
     * @throws TrackerNotInitializedError if tracker is not initialized
     */
    predictWithDetection(image, detection) {
      if (this.state === TrackerState.Uninitialized) {
        throw new TrackerNotInitializedError();
      }
      if (this.state !== TrackerState.Calibrated) {
        throw new NotCalibratedError();
      }
      if (!this.coefficientsX || !this.coefficientsY) {
        throw new NotCalibratedError("Coefficients not available");
      }
      const imageData = this.toImageData(image);
      const fullLandmarks = "allLandmarks" in detection ? detection.allLandmarks : void 0;
      const blendshapes = "blendshapes" in detection ? detection.blendshapes : void 0;
      const headPose = "headPose" in detection ? detection.headPose : void 0;
      const features = extractCombinedFeatures(imageData, detection.boundingBox, detection.keypoints, this.config.useLandmarks, fullLandmarks, imageData.width, imageData.height, this.config.eyeWidth, this.config.eyeHeight, blendshapes, headPose);
      const rawX = dotOptimized(features, this.coefficientsX);
      const rawY = dotOptimized(features, this.coefficientsY);
      const { x: x2, y: y2 } = this.applyHeadPoseCompensation(rawX, rawY, headPose);
      return { x: x2, y: y2 };
    }
    /**
     * Convert various image types to ImageData.
     */
    toImageData(image) {
      if (image instanceof ImageData) {
        return image;
      }
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to create canvas context");
      }
      if (image instanceof HTMLVideoElement) {
        canvas.width = image.videoWidth;
        canvas.height = image.videoHeight;
      } else {
        canvas.width = image.width;
        canvas.height = image.height;
      }
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    /**
     * Get the training time from the last calibration in milliseconds.
     * Returns 0 if tracker hasn't been calibrated.
     */
    getLastTrainingTimeMs() {
      return this.lastTrainingTimeMs;
    }
    /**
     * Get the current configuration.
     */
    getConfig() {
      return { ...this.config };
    }
    /**
     * Reset the tracker to pre-calibration state.
     */
    reset() {
      this.coefficientsX = null;
      this.coefficientsY = null;
      this.lastTrainingTimeMs = 0;
      this.calibrationMeanHeadPose = null;
      if (this.state === TrackerState.Calibrated) {
        this.state = TrackerState.Ready;
      }
    }
    /**
     * Clean up resources.
     */
    dispose() {
      this.faceDetector.close();
      this.coefficientsX = null;
      this.coefficientsY = null;
      this.lastTrainingTimeMs = 0;
      this.calibrationMeanHeadPose = null;
      this.state = TrackerState.Uninitialized;
    }
    /**
     * Compute mean head pose from an array of head poses.
     */
    computeMeanHeadPose(poses) {
      const n2 = poses.length;
      return {
        yaw: poses.reduce((sum, p2) => sum + p2.yaw, 0) / n2,
        pitch: poses.reduce((sum, p2) => sum + p2.pitch, 0) / n2,
        roll: poses.reduce((sum, p2) => sum + p2.roll, 0) / n2,
        translationX: poses.reduce((sum, p2) => sum + p2.translationX, 0) / n2,
        translationY: poses.reduce((sum, p2) => sum + p2.translationY, 0) / n2,
        translationZ: poses.reduce((sum, p2) => sum + p2.translationZ, 0) / n2
      };
    }
    /**
     * Apply head pose compensation to a gaze prediction.
     * Adjusts gaze based on the difference between current head pose and calibration mean.
     */
    applyHeadPoseCompensation(gazeX, gazeY, _currentHeadPose) {
      return { x: gazeX, y: gazeY };
    }
  };

  // node_modules/@realeye-io/webcam-eyetracker-light-open/dist/lib/calibration/CalibrationPatterns.js
  var CalibrationPattern;
  (function(CalibrationPattern2) {
    CalibrationPattern2["GRID_17"] = "grid-17";
  })(CalibrationPattern || (CalibrationPattern = {}));
  function generateGrid17Points() {
    const margin = 0.05;
    const step = (1 - 2 * margin) / 3;
    const points = [];
    for (let row = 0; row <= 3; row++) {
      for (let col = 0; col <= 3; col++) {
        const x2 = margin + col * step;
        const y2 = margin + row * step;
        points.push({ x: x2, y: y2 });
      }
    }
    const hasCenter = points.some((p2) => Math.abs(p2.x - 0.5) < 0.01 && Math.abs(p2.y - 0.5) < 0.01);
    if (!hasCenter) {
      points.push({ x: 0.5, y: 0.5 });
    }
    return points.slice(0, 17);
  }
  function getCalibrationPoints(pattern) {
    switch (pattern) {
      case CalibrationPattern.GRID_17:
      default:
        return generateGrid17Points();
    }
  }
  function getRecommendedPattern() {
    return CalibrationPattern.GRID_17;
  }
  var RECOMMENDED_SAMPLES_PER_POINT = 5;
  return __toCommonJS(realeye_entry_exports);
})();
