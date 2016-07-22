import assert from 'assert';
import fs from 'fs-extra';
import path from 'path';
import ESDocCLI from '../../../src/ESDocCLI.js';
import {consoleLogSwitch} from '../util.js';

/** @test {ESDocCLI} */
describe('ESDocGlobTest:', ()=>{

  /**
   * @test {ESDocCLI#exec}
   * @test {ESDocCLI#_createConfigFromJSONFile}
   */
  it('can execute with config file.', ()=>{
    let cliPath = path.resolve('./src/cli.js');
    let configPath = path.resolve('./test/fixture/esdoc-glob.json');
    let argv = ['node', cliPath, '-c', configPath];
    let cli = new ESDocCLI(argv);
    consoleLogSwitch(false);
    cli.exec();
    consoleLogSwitch(true);
    assert(true);
  });
});
