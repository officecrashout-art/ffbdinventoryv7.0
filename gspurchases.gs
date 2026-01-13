/**
 * FASHION FIZZ BD - PURCHASES MODULE (FIXED FOR RANGEPD)
 */

function getPurchaseStartupData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Check if the specific sheet exists
    const poSheet = ss.getSheetByName('PurchaseOrders');
    if (!poSheet) throw new Error("Sheet 'PurchaseOrders' not found! Please check your tab name.");

    // Fetch data using your specific Named Ranges
    const suppliers = soGetRangeDataAsObjects('RANGESUPPLIERS') || [];
    const items = soGetRangeDataAsObjects('RANGEINVENTORYITEMS') || [];
    const pos = soGetRangeDataAsObjects('RANGEPO') || [];
    
    return { suppliers, items, pos };
  } catch (e) {
    // Stops infinite spinning by sending the error to the frontend
    throw new Error(e.message);
  }
}

function poGetPODetails(poID) {
  try {
    // UPDATED: Using your specific named range 'RANGEPD'
    const allDetails = soGetRangeDataAsObjects('RANGEPD');
    return allDetails.filter(d => d['PO ID'] === poID);
  } catch(e) { 
    return []; 
  }
}

function soSaveOrUpdatePO(poId, items) {
  try {
    const ss = SpreadsheetApp.getActive();
    const summarySheet = ss.getSheetByName('PurchaseOrders');
    const detailSheet = ss.getSheetByName('PurchaseDetails'); 
    
    if (!summarySheet || !detailSheet) throw new Error("Missing 'PurchaseOrders' or 'PurchaseDetails' tab.");

    const total = items.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);
    
    // Summary Save
    summarySheet.appendRow([new Date(), poId, items[0].supplierName, items[0].billNum, total, total, "Pending"]);

    // Details Save to RANGEPD sheet & Inventory Update
    items.forEach(item => {
      detailSheet.appendRow([
        new Date(), 
        poId, 
        "D" + Date.now(), 
        item.itemId, 
        item.itemName, 
        item.brand, 
        item.size, 
        item.qty, 
        item.unitCost, 
        item.total
      ]);
      _syncStock(item.itemId, item.qty);
    });
    return "success";
  } catch (e) {
    throw new Error(e.message);
  }
}

function _syncStock(id, qty) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('InventoryItems');
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf("Item ID");
  const purCol = data[0].indexOf("QTY Purchased");
  
  const row = data.findIndex(r => r[idCol] == id);
  if (row > -1) {
    const current = parseFloat(data[row][purCol]) || 0;
    sheet.getRange(row + 1, purCol + 1).setValue(current + parseFloat(qty));
  }
}

function poGeneratePOID() {
  return "PO-" + Math.floor(1000 + Math.random() * 9000);
}