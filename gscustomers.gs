/**
 * FASHION FIZZ BD - CUSTOMER MANAGEMENT (UPDATED)
 */

function custShowCustomersUI() {
  const html = HtmlService.createTemplateFromFile('customers')
    .evaluate()
    .setTitle('Customer Directory')
    .setWidth(1200)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, ' ');
}

/**
 * Fetches all customers including their contact and location details.
 */
function custGetCustomers() {
  try {
    return soGetRangeDataAsObjects('RANGECUSTOMERS');
  } catch (e) {
    return [];
  }
}

/**
 * Generates a unique Customer ID.
 */
function custGenerateCustomerId() {
  const data = custGetCustomers().map(r => r['Customer ID']);
  let id;
  do { 
    id = "C" + Math.floor(10000 + Math.random() * 90000); 
  } while (data.includes(id));
  return id;
}

/**
 * Adds a new customer from the Sales or Customer module[cite: 10].
 */
function custAddNewCustomer(c) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('Customers');
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  
  const rowMap = {
    "Customer ID": c.id || custGenerateCustomerId(),
    "Customer Name": c.name,
    "Customer Contact": c.contact,
    "Customer Email": c.email || "",
    "City": c.city || "",
    "Customer Address": c.address || "",
    "Total Sales": 0,
    "Total Receipts": 0,
    "Balance Receivable": 0
  };

  const newRow = headers.map(h => rowMap[h.trim()] !== undefined ? rowMap[h.trim()] : "");
  sh.appendRow(newRow);
  return { success: true };
}

/**
 * Fetches detailed history for a specific customer[cite: 105].
 */
function custGetCustomerHistory(customerId) {
  const sales = soGetRangeDataAsObjects('RANGESO');
  return sales.filter(s => s['Customer ID'] === customerId);
}