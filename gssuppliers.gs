/**
 * Supplier Management Module
 */

function supGetSuppliers() {
  return soGetRangeDataAsObjects('RANGESUPPLIERS'); // Reusing fast helper
}

// Unified Dimension Getters
function supGetStates() { return _getUniqueDimension('State'); }
function supGetCities() { return _getUniqueDimension('City'); }

/**
 * Fast Dimension Helper (Centralized logic)
 */
function _getUniqueDimension(colHeader) {
  const data = soGetRangeDataAsObjects('RANGEDIMENSIONS');
  return [...new Set(data.map(r => r[colHeader]).filter(v => v && v.trim() !== ""))];
}

function supAddNewState(name) { _addDimensionValue('State', name); }
function supAddNewCity(name)  { _addDimensionValue('City', name); }

function _addDimensionValue(colHeader, value) {
  const ss = SpreadsheetApp.getActive();
  const range = ss.getRangeByName('RANGEDIMENSIONS');
  const sheet = range.getSheet();
  const headers = range.getValues()[0];
  const colIdx = headers.indexOf(colHeader);
  if (colIdx === -1) return;
  
  sheet.getRange(sheet.getLastRow() + 1, range.getColumn() + colIdx).setValue(value);
}

function supGenerateSupplierId() {
  const data = supGetSuppliers().map(r => r['Supplier ID']);
  let id;
  do { id = "P" + Math.floor(10000 + Math.random() * 90000); } while (data.includes(id));
  return id;
}

function supAddNewSupplier(supplier) {
  const ss = SpreadsheetApp.getActive();
  const range = ss.getRangeByName('RANGESUPPLIERS');
  const headers = range.getValues()[0];
  
  const newRow = headers.map(h => {
    switch(h) {
      case "Supplier ID": return supplier.id;
      case "Supplier Name": return supplier.name;
      case "Supplier Contact": return supplier.contact;
      case "Supplier Email": return supplier.email;
      case "State": return supplier.state;
      case "City": return supplier.city;
      case "Supplier Address": return supplier.address;
      default: return 0; // Totals start at 0
    }
  });
  range.getSheet().appendRow(newRow);
}

function supUpdateSupplier(supplier) {
  const ss = SpreadsheetApp.getActive();
  const range = ss.getRangeByName('RANGESUPPLIERS');
  const vals = range.getValues();
  const hdr = vals[0];
  const rowIdx = vals.findIndex(r => r[hdr.indexOf("Supplier ID")] === supplier.id);

  if (rowIdx > 0) {
    const sheetRow = range.getRow() + rowIdx;
    const colStart = range.getColumn();
    // Batch update editable fields
    const updates = [
      ["Supplier Name", supplier.name], ["Supplier Contact", supplier.contact],
      ["Supplier Email", supplier.email], ["State", supplier.state],
      ["City", supplier.city], ["Supplier Address", supplier.address]
    ];
    updates.forEach(([h, val]) => {
      sheetRow.getSheet().getRange(sheetRow, colStart + hdr.indexOf(h)).setValue(val);
    });
  }
}

function supDeleteSupplier(id) {
  const data = supGetSuppliers().find(s => s['Supplier ID'] === id);
  if (!data) return "not_found";
  if (parseFloat(data['Balance Payable']) > 0) return "balance_error";
  
  const ss = SpreadsheetApp.getActive();
  const range = ss.getRangeByName('RANGESUPPLIERS');
  const vals = range.getValues();
  const idx = vals.findIndex(r => r[vals[0].indexOf("Supplier ID")] === id);
  if (idx > 0) range.getSheet().deleteRow(range.getRow() + idx);
  return "success";
}