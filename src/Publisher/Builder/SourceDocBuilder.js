import path from 'path';
import fs from 'fs';
import IceCap from 'ice-cap';
import DocBuilder from './DocBuilder.js';
import {dateForUTC} from './util.js';

/**
 * Source output html builder class.
 */
export default class SourceDocBuilder extends DocBuilder {
  /**
   * create instance.
   * @param {Taffy} data - doc object database.
   * @param {ESDocConfig} config - use config to build output.
   * @param {CoverageObject} coverage - use coverage to build output.
   */
  constructor(data, config, coverage) {
    super(data, config);
    this._coverage = coverage;
  }

  /**
   * execute building output html.
   * @param {function(html: string, filePath: string)} callback - is called with output html.
   */
  exec(callback) {
    let ice = this._buildLayoutDoc();
    let fileName = 'source.html';
    let baseUrl = this._getBaseUrl(fileName);
    let title = this._getTitle('Source');

    ice.attr('baseUrl', 'href', baseUrl);
    ice.load('content', this._buildSourceHTML());
    ice.text('title', title, IceCap.MODE_WRITE);

    callback(ice.html, fileName);
  }

  /**
   * build source list output html.
   * @returns {string} html of source list.
   * @private
   */
  _buildSourceHTML() {
    let ice = new IceCap(this._readTemplate('source.html'));
    let docs = this._find({kind: 'file'});
    let config = this._config;
    let useCoverage = this._config.coverage;
    let coverage;
    if (useCoverage) coverage = this._coverage.files;

    ice.drop('coverageBadge', !useCoverage);
    ice.attr('files', 'data-use-coverage', !!useCoverage);

    if (useCoverage) {
      let actual = this._coverage.actualCount;
      let expect = this._coverage.expectCount;
      let coverageCount = `${actual}/${expect}`;
      ice.text('totalCoverageCount', coverageCount);
    }

    ice.loop('file', docs, (i, doc, ice)=>{
      let sourceDirPath = path.resolve(this._config.sourceDirPath);
      let filePath = doc.longname;
      let absFilePath = path.resolve(path.dirname(sourceDirPath), filePath);
      let content = fs.readFileSync(absFilePath).toString();
      let lines = content.split('\n').length - 1;
      let stat = fs.statSync(absFilePath);
      let date = dateForUTC(stat.ctime);
      let coverageRatio;
      let coverageCount;
      let undocumentLines;
      if (useCoverage && coverage[filePath]) {
        let actual = coverage[filePath].actualCount;
        let expect = coverage[filePath].expectCount;
        coverageRatio = `${Math.floor(100 * actual / expect)} %`;
        coverageCount = `${actual}/${expect}`;
        undocumentLines = coverage[filePath].undocumentLines.sort().join(',');
      } else {
        coverageRatio = '-';
      }

      let identifierDocs = this._find({
        longname: {left: `${doc.longname}~`},
        kind: ['class', 'function', 'variable']});
      let identifiers = identifierDocs.map(doc =>{
        return this._buildDocLinkHTML(doc.longname);
      });

      if (undocumentLines) {
        const url = this._getURL(doc);
        const link = this._buildFileDocLinkHTML(doc).replace(/href=".*\.html"/, `href="${url}#errorLines=${undocumentLines}"`);
        ice.load('filePath', link);
      } else {
        ice.load('filePath', this._buildFileDocLinkHTML(doc));
      }
      ice.text('coverage', coverageRatio);
      ice.text('coverageCount', coverageCount);
      ice.text('lines', lines);
      ice.text('updated', date);
      ice.text('size', `${stat.size} byte`);
      ice.load('identifier', identifiers.join('\n') || '-');
    });
    return ice.html;
  }
}
