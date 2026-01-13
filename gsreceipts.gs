/**
 * FASHION FIZZ BD - RECEIPTS BACKEND (OPTIMIZED)
 */

function getReceiptStartupData() {
  const ss = SpreadsheetApp.getActive();
  const dims = soGetRangeDataAsObjects('RANGEDIMENSIONS');
  return {
    customers: soGetRangeDataAsObjects('RANGECUSTOMERS'),
    orders: soGetRangeDataAsObjects('RANGESO'),
    receipts: soGetRangeDataAsObjects('RANGERECEIPTS'),
    modes: [...new Set(dims.map(r => r['PMT Mode']).filter(v => v))]
  };
}

function rcSaveNewReceipt(rec) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getRangeByName('RANGERECEIPTS').getSheet();
  sh.appendRow([
    new Date(rec['Trx Date']), rec['Trx ID'], rec['Customer ID'], rec['Customer Name'],
    '', '', rec['SO ID'], rec['Invoice Num'], rec['PMT Mode'], rec['Amount Received']
  ]);
  _rcRecalcAll();
}

function rcDeleteReceipt(trxID) {
  const ss = SpreadsheetApp.getActive();
  const rg = ss.getRangeByName('RANGERECEIPTS');
  const sh = rg.getSheet();
  const vals = rg.getValues();
  const idx = vals.findIndex(r => r[vals[0].indexOf('Trx ID')] === trxID);
  if (idx > 0) {
    sh.deleteRow(rg.getRow() + idx);
    _rcRecalcAll();
  }
}

function rcGenerateTrxID() {
  const data = soGetRangeDataAsObjects('RANGERECEIPTS').map(r => r['Trx ID']);
  let id;
  do { id = 'RT' + Math.floor(10000 + Math.random() * 90000); } while (data.includes(id));
  return id;
}