/**
 * Dlicom Nexus - Safe Deterministic Expression Evaluator
 * 
 * Evaluates transformation expressions without using eval() or new Function().
 * Fully sandboxed and deterministic.
 */

type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'NULL'
  | 'IDENTIFIER'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'QUESTION'
  | 'COLON'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

export class SafeExpressionError extends Error {
  public position?: number;

  constructor(message: string, position?: number) {
    super(message);
    this.name = 'SafeExpressionError';
    this.position = position;
  }
}

class Tokenizer {
  private pos = 0;
  private input: string;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];

      // Whitespace
      if (/\s/.test(ch)) {
        this.pos++;
        continue;
      }

      const startPos = this.pos;

      // Punctuation
      if (ch === '(') {
        tokens.push({ type: 'LPAREN', value: '(', pos: startPos });
        this.pos++;
        continue;
      }
      if (ch === ')') {
        tokens.push({ type: 'RPAREN', value: ')', pos: startPos });
        this.pos++;
        continue;
      }
      if (ch === '?') {
        tokens.push({ type: 'QUESTION', value: '?', pos: startPos });
        this.pos++;
        continue;
      }
      if (ch === ':') {
        tokens.push({ type: 'COLON', value: ':', pos: startPos });
        this.pos++;
        continue;
      }

      // Strings (single or double quotes)
      if (ch === '"' || ch === "'") {
        const quote = ch;
        this.pos++;
        let str = '';
        while (this.pos < this.input.length && this.input[this.pos] !== quote) {
          if (this.input[this.pos] === '\\' && this.pos + 1 < this.input.length) {
            this.pos++;
            str += this.input[this.pos];
          } else {
            str += this.input[this.pos];
          }
          this.pos++;
        }
        if (this.pos >= this.input.length) {
          throw new SafeExpressionError(`Unterminated string literal starting at position ${startPos}`, startPos);
        }
        this.pos++; // skip closing quote
        tokens.push({ type: 'STRING', value: str, pos: startPos });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(this.input[this.pos + 1] || ''))) {
        let numStr = '';
        while (this.pos < this.input.length && /[0-9.]/.test(this.input[this.pos])) {
          numStr += this.input[this.pos];
          this.pos++;
        }
        tokens.push({ type: 'NUMBER', value: numStr, pos: startPos });
        continue;
      }

      // Multi-character operators
      const twoChar = this.input.substring(this.pos, this.pos + 3);
      if (twoChar === '===' || twoChar === '!==') {
        tokens.push({ type: 'OPERATOR', value: twoChar, pos: startPos });
        this.pos += 3;
        continue;
      }

      const doubleChar = this.input.substring(this.pos, this.pos + 2);
      if (['==', '!=', '>=', '<=', '&&', '||'].includes(doubleChar)) {
        tokens.push({ type: 'OPERATOR', value: doubleChar, pos: startPos });
        this.pos += 2;
        continue;
      }

      // Single-character operators
      if (['+', '-', '*', '/', '%', '>', '<', '!'].includes(ch)) {
        tokens.push({ type: 'OPERATOR', value: ch, pos: startPos });
        this.pos++;
        continue;
      }

      // Identifiers / Keywords
      if (/[a-zA-Z_$]/.test(ch)) {
        let idStr = '';
        while (this.pos < this.input.length && /[a-zA-Z0-9_$.]/.test(this.input[this.pos])) {
          idStr += this.input[this.pos];
          this.pos++;
        }

        if (idStr === 'true' || idStr === 'false') {
          tokens.push({ type: 'BOOLEAN', value: idStr, pos: startPos });
        } else if (idStr === 'null') {
          tokens.push({ type: 'NULL', value: 'null', pos: startPos });
        } else {
          tokens.push({ type: 'IDENTIFIER', value: idStr, pos: startPos });
        }
        continue;
      }

      throw new SafeExpressionError(`Unexpected character '${ch}' at position ${this.pos}`, this.pos);
    }

    tokens.push({ type: 'EOF', value: '', pos: this.pos });
    return tokens;
  }
}

class Parser {
  private current = 0;
  private tokens: Token[];
  private context: Record<string, unknown>;

  constructor(tokens: Token[], context: Record<string, unknown>) {
    this.tokens = tokens;
    this.context = context;
  }

  private peek(): Token {
    return this.tokens[this.current] || { type: 'EOF', value: '', pos: -1 };
  }

  private match(...expected: string[]): boolean {
    const token = this.peek();
    if (expected.includes(token.value)) {
      this.current++;
      return true;
    }
    return false;
  }

  private consume(type: TokenType, errMsg: string): Token {
    const token = this.peek();
    if (token.type === type) {
      this.current++;
      return token;
    }
    throw new SafeExpressionError(`${errMsg}, got '${token.value}' at pos ${token.pos}`, token.pos);
  }

  public parse(): unknown {
    const result = this.parseTernary();
    if (this.peek().type !== 'EOF') {
      throw new SafeExpressionError(`Unexpected trailing token '${this.peek().value}' at pos ${this.peek().pos}`, this.peek().pos);
    }
    return result;
  }

  // Ternary: condition ? expr1 : expr2
  private parseTernary(): unknown {
    const condition = this.parseLogicalOr();

    if (this.peek().type === 'QUESTION') {
      this.current++;
      const trueVal = this.parseTernary();
      this.consume('COLON', "Expected ':' in ternary expression");
      const falseVal = this.parseTernary();
      return condition ? trueVal : falseVal;
    }

    return condition;
  }

  // Logical OR: a || b
  private parseLogicalOr(): unknown {
    let left = this.parseLogicalAnd();

    while (this.match('||')) {
      const right = this.parseLogicalAnd();
      left = Boolean(left) || Boolean(right);
    }

    return left;
  }

  // Logical AND: a && b
  private parseLogicalAnd(): unknown {
    let left = this.parseEquality();

    while (this.match('&&')) {
      const right = this.parseEquality();
      left = Boolean(left) && Boolean(right);
    }

    return left;
  }

  // Equality: ===, !==, ==, !=
  private parseEquality(): unknown {
    let left = this.parseRelational();

    while (['===', '!==', '==', '!='].includes(this.peek().value)) {
      const op = this.peek().value;
      this.current++;
      const right = this.parseRelational();
      if (op === '===' || op === '==') {
        left = left === right;
      } else {
        left = left !== right;
      }
    }

    return left;
  }

  // Relational: <, <=, >, >=
  private parseRelational(): unknown {
    let left = this.parseAdditive();

    while (['<', '<=', '>', '>='].includes(this.peek().value)) {
      const op = this.peek().value;
      this.current++;
      const right = this.parseAdditive();
      const numLeft = Number(left);
      const numRight = Number(right);
      if (op === '<') left = numLeft < numRight;
      else if (op === '<=') left = numLeft <= numRight;
      else if (op === '>') left = numLeft > numRight;
      else if (op === '>=') left = numLeft >= numRight;
    }

    return left;
  }

  // Additive: +, -
  private parseAdditive(): unknown {
    let left = this.parseMultiplicative();

    while (['+', '-'].includes(this.peek().value)) {
      const op = this.peek().value;
      this.current++;
      const right = this.parseMultiplicative();
      if (op === '+') {
        if (typeof left === 'string' || typeof right === 'string') {
          left = String(left) + String(right);
        } else {
          left = Number(left) + Number(right);
        }
      } else {
        left = Number(left) - Number(right);
      }
    }

    return left;
  }

  // Multiplicative: *, /, %
  private parseMultiplicative(): unknown {
    let left = this.parseUnary();

    while (['*', '/', '%'].includes(this.peek().value)) {
      const op = this.peek().value;
      this.current++;
      const right = this.parseUnary();
      const numLeft = Number(left);
      const numRight = Number(right);
      if (op === '*') left = numLeft * numRight;
      else if (op === '/') left = numLeft / numRight;
      else if (op === '%') left = numLeft % numRight;
    }

    return left;
  }

  // Unary: !, -, +
  private parseUnary(): unknown {
    if (this.match('!')) {
      return !this.parseUnary();
    }
    if (this.match('-')) {
      return -Number(this.parseUnary());
    }
    if (this.match('+')) {
      return +Number(this.parseUnary());
    }
    return this.parsePrimary();
  }

  // Primary: literals, identifiers, (expr)
  private parsePrimary(): unknown {
    const token = this.peek();

    if (token.type === 'NUMBER') {
      this.current++;
      return parseFloat(token.value);
    }

    if (token.type === 'STRING') {
      this.current++;
      return token.value;
    }

    if (token.type === 'BOOLEAN') {
      this.current++;
      return token.value === 'true';
    }

    if (token.type === 'NULL') {
      this.current++;
      return null;
    }

    if (token.type === 'LPAREN') {
      this.current++;
      const expr = this.parseTernary();
      this.consume('RPAREN', "Expected ')' after parenthesized expression");
      return expr;
    }

    if (token.type === 'IDENTIFIER') {
      this.current++;
      return this.resolveIdentifier(token.value);
    }

    throw new SafeExpressionError(`Unexpected token '${token.value}' at pos ${token.pos}`, token.pos);
  }

  private resolveIdentifier(path: string): unknown {
    const parts = path.split('.');
    let current: unknown = this.context;

    // Check direct access first
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[part];
    }

    if (current !== undefined) return current;

    // Fallback: if user wrote "volumeUSD" and context has "payload.volumeUSD"
    if (this.context.payload && typeof this.context.payload === 'object') {
      let subCurrent: unknown = this.context.payload;
      for (const part of parts) {
        if (subCurrent === null || subCurrent === undefined || typeof subCurrent !== 'object') {
          subCurrent = undefined;
          break;
        }
        subCurrent = (subCurrent as Record<string, unknown>)[part];
      }
      if (subCurrent !== undefined) return subCurrent;
    }

    return undefined;
  }
}

/**
 * Deterministically and safely evaluates an expression with the given context.
 * Throws SafeExpressionError on syntax error or unhandled token.
 */
export function evaluateSafeExpression(expression: string, context: Record<string, unknown> = {}): unknown {
  const trimmed = expression.trim();
  if (!trimmed) return undefined;

  const tokenizer = new Tokenizer(trimmed);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens, context);
  return parser.parse();
}

/**
 * Interpolates parameterized template strings: e.g. "https://api.xyz/user/{{payload.username}}?role={{archetype}}"
 */
export function interpolateTemplateString(template: string, context: Record<string, unknown> = {}): string {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_$.]+)\s*\}\}/g, (_, path: string) => {
    const parts = path.split('.');
    let curr: unknown = context;
    for (const p of parts) {
      if (curr === null || curr === undefined || typeof curr !== 'object') {
        curr = undefined;
        break;
      }
      curr = (curr as Record<string, unknown>)[p];
    }
    if (curr !== undefined) return String(curr);

    // Try within context.payload
    if (context.payload && typeof context.payload === 'object') {
      let subCurr: unknown = context.payload;
      for (const p of parts) {
        if (subCurr === null || subCurr === undefined || typeof subCurr !== 'object') {
          subCurr = undefined;
          break;
        }
        subCurr = (subCurr as Record<string, unknown>)[p];
      }
      if (subCurr !== undefined) return String(subCurr);
    }
    return '';
  });
}
