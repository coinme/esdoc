import AbstractDoc from './AbstractDoc.js';
import ParamParser from '../Parser/ParamParser.js';
import NamingUtil from '../Util/NamingUtil.js';
import logger from 'color-logger';

/**
 * Doc Class from Function declaration AST node.
 */
export default class FunctionDoc extends AbstractDoc {
  /** specify ``function`` to kind. */
  ['@_kind']() {
    super['@_kind']();
    if (this._value.kind) return;
    this._value.kind = 'function';
  }

  /** take out self name from self node */
  ['@_name']() {
    super['@_name']();
    if (this._value.name) return;

    if (this._node.id) {
      switch (this._node.id.type) {
        case 'Identifier':
          this._value.name = this._node.id.name;
          break;

        case 'StringLiteral':
          this._value.name = this._node.id.value;
          break;

        case 'MemberExpression':
          this._value.name = `${this._node.id.object.name}.${this._node.id.property.name}`;
          break;

        default:
          logger.w(`can not resolve name.`);
          this._value.name = undefined;
      }
    } else {
      this._value.name = NamingUtil.filePathToName(this._pathResolver.filePath);
    }
  }

  /** take out self name from file path */
  ['@_memberof']() {
    super['@_memberof']();
    if (this._value.memberof) return;
    this._value.memberof = this._pathResolver.filePath;
  }

  /** check generator property in self node */
  ['@_generator']() {
    super['@_generator']();
    if ('generator' in this._value) return;

    this._value.generator = this._node.generator;
  }

  /** if @param is not exists, guess type of param by using self node. */
  ['@param']() {
    super['@param']();
    if (this._value.params) return;

    this._value.params = ParamParser.guessParams(this._node.params);
  }

  /** if @return is not exists, guess type of return by using self node. */
  ['@return']() {
    super['@return']();
    if (this._value.return) return;

    let result = ParamParser.guessReturnParam(this._node.body);
    if (result) {
      this._value.return = result;
    }
  }
}
