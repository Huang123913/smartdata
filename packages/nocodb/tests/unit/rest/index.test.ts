import 'mocha';

import attachmentTests from './tests/attachment.test';
import authTests from './tests/auth.test';
import baseTests from './tests/base.test';
import columnTypeSpecificTests from './tests/columnTypeSpecific.test';
import filterTest from './tests/filter.test';
import formulaTests from './tests/formula.test';
import groupByTest from './tests/groupby.test';
import newDataApisTest from './tests/newDataApis.test';
import orgTests from './tests/org.test';
import readOnlyTest from './tests/readOnlySource.test';
import tableTests from './tests/table.test';
import tableRowTests from './tests/tableRow.test';
import typeCastsTest from './tests/typeCasts.test';
import viewRowTests from './tests/viewRow.test';

let workspaceTest = () => {};
let ssoTest = () => {};
let cloudOrgTest = () => {};
let bulkAggregationTest = () => {};
if (process.env.EE === 'true') {
  workspaceTest = require('./tests/ee/workspace.test').default;
  ssoTest = require('./tests/ee/sso.test').default;
  cloudOrgTest = require('./tests/ee/cloud-org.test').default;
  bulkAggregationTest = require('./tests/ee/bulkAggregation.test').default;
}
// import layoutTests from './tests/layout.test';
// import widgetTest from './tests/widget.test';

function restTests() {
  authTests();
  orgTests();
  baseTests();
  tableTests();
  tableRowTests();
  viewRowTests();
  columnTypeSpecificTests();
  attachmentTests();
  filterTest();
  newDataApisTest();
  groupByTest();
  workspaceTest();
  formulaTests();
  ssoTest();
  cloudOrgTest();
  typeCastsTest();
  readOnlyTest();
  aggregationTest();
  bulkAggregationTest();

  // Enable for dashboard feature
  // widgetTest();
  // layoutTests();
}

export default function () {
  describe('Rest', restTests);
}
