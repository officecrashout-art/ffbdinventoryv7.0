/**
 * FASHION FIZZ BD - SALES ENGINE (FIXED CUSTOMER INFO)
 */

function soShowSalesUI() {
  const html = HtmlService.createTemplateFromFile('sales')
    .evaluate()
    .setTitle('Sales Order Management')
    .setWidth(1200)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, ' ');
}

/**
 * Fetches startup data including city dimensions.
 */
function getSalesStartupData() {
  const ss = SpreadsheetApp.getActive();
  return {
    customers: soGetRangeDataAsObjects('RANGECUSTOMERS') || [],
    items: soGetRangeDataAsObjects('RANGEINVENTORYITEMS') || [], 
    sales: soGetRangeDataAsObjects('RANGESO') || [],
    states: _getUniqueDimension('State') || [],
    cities: _getUniqueDimension('City') || []
  };
}

/**
 * MASTER SAVE: Processes the Sales Order and updates Inventory.
 */
function soSaveOrder(soData, items, customer) {
  const ss = SpreadsheetApp.getActive();
  const soSheet = ss.getSheetByName('SalesOrders');
  const sdSheet = ss.getSheetByName('SalesDetails');
  
  if (!soSheet || !sdSheet) throw new Error("Sales tabs not found.");

  // 1. Save or Update Customer with full address
  if (customer.isNew) {
    // Passes name, contact, city, and address to the customer module
    custAddNewCustomer({
      id: custGenerateCustomerId(),
      name: customer.name,
      contact: customer.contact,
      city: customer.city,
      address: customer.address 
    });
  }

  // 2. Save Sales Order Summary
  soSheet.appendRow([
    new Date(), soData.id, customer.id || "C-NEW", customer.name, 
    soData.invoice, "Unpaid", "Pending", soData.totalAmount, 0, soData.totalAmount
  ]);

  // 3. Save Line Items & Sync Stock
  items.forEach(item => {
    sdSheet.appendRow([
      new Date(), soData.id, "SD-" + Date.now(), customer.id || "C-NEW", customer.name,
      customer.state || "", customer.city, soData.invoice, item.id, 
      item.category, item.category, item.subcategory, item.name, 
      item.qty, item.price, item.price, 0, 0, item.price, item.ship, item.total
    ]);
    
    _syncSalesStock(item.id, item.qty);
  });

  return { success: true, message: "Sales Order " + soData.id + " recorded!" };
}

function _syncSalesStock(id, qty) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('InventoryItems');
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf("Item ID");
  const soldCol = data[0].indexOf("QTY Sold");
  
  const row = data.findIndex(r => r[idCol] == id);
  if (row > -1) {
    const currentSold = parseFloat(data[row][soldCol]) || 0;
    sheet.getRange(row + 1, soldCol + 1).setValue(currentSold + parseFloat(qty));
  }
}

function soGenerateSOID() {
  return "SO-" + Math.floor(10000 + Math.random() * 90000);
}