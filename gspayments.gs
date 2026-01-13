/**
 * FASHION FIZZ BD - PAYMENTS BACKEND (OPTIMIZED)
 */

function getPaymentStartupData() {
  const ss = SpreadsheetApp.getActive();
  const dims = soGetRangeDataAsObjects('RANGEDIMENSIONS');
  return {
    suppliers: soGetRangeDataAsObjects('RANGESUPPLIERS'),
    pos: soGetRangeDataAsObjects('RANGEPO'),
    payments: soGetRangeDataAsObjects('RANGEPAYMENTS'),
    modes: [...new Set(dims.map(r => r['PMT Mode']).filter(v => v))]
  };
}

function ptSaveNewPayment(rec) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getRangeByName('RANGEPAYMENTS').getSheet();
  sh.appendRow([
    new Date(rec['Trx Date']), rec['Trx ID'], rec['Supplier ID'], rec['Supplier Name'],
    '', '', rec['PO ID'], rec['Bill Num'], rec['PMT Mode'], rec['Amount Paid']
  ]);
  _ptRecalcAll();
}

function ptDeletePayment(trxID) {
  const ss = SpreadsheetApp.getActive();
  const rg = ss.getRangeByName('RANGEPAYMENTS');
  const sh = rg.getSheet();
  const vals = rg.getValues();
  const idx = vals.findIndex(r => r[vals[0].indexOf('Trx ID')] === trxID);
  if (idx > 0) {
    sh.deleteRow(rg.getRow() + idx);
    _ptRecalcAll();
  }
}

function ptGenerateTrxID() {
  const data = soGetRangeDataAsObjects('RANGEPAYMENTS').map(r => r['Trx ID']);
  let id;
  do { id = 'PT' + Math.floor(10000 + Math.random() * 90000); } while (data.includes(id));
  return id;
}