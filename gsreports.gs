/**
 * FASHION FIZZ BD - MONTHLY PROFITABILITY REPORTS
 */

function getMonthlyReportData(targetMonth, targetYear) {
  const sales = soGetRangeDataAsObjects('RANGESO');
  const purchases = soGetRangeDataAsObjects('RANGEPO');
  const salesDetails = soGetRangeDataAsObjects('RANGESD');
  
  const isMatch = (dateStr) => {
    const d = new Date(dateStr);
    return d.getMonth() === parseInt(targetMonth) && d.getFullYear() === parseInt(targetYear);
  };

  // 1. Calculate Monthly Revenue (Sales)
  const monthlySales = sales.filter(s => s['SO Date'] && isMatch(s['SO Date']));
  const totalRevenue = monthlySales.reduce((acc, curr) => acc + (parseFloat(curr['Total SO Amount']) || 0), 0);
  const totalReceived = monthlySales.reduce((acc, curr) => acc + (parseFloat(curr['Total Received']) || 0), 0);

  // 2. Calculate Monthly Expenses (Purchases)
  const monthlyPurchases = purchases.filter(p => p['Date'] && isMatch(p['Date']));
  const totalExpense = monthlyPurchases.reduce((acc, curr) => acc + (parseFloat(curr['Total Amount']) || 0), 0);

  // 3. Calculate Gross Profit
  const grossProfit = totalRevenue - totalExpense;

  // 4. Group Top Items
  const monthlyDetails = salesDetails.filter(d => d['SO Date'] && isMatch(d['SO Date']));
  const itemSummary = {};
  monthlyDetails.forEach(d => {
    itemSummary[d['Item Name']] = (itemSummary[d['Item Name']] || 0) + parseFloat(d['QTY Sold']);
  });

  const topItems = Object.keys(itemSummary).map(name => ({
    name: name,
    qty: itemSummary[name]
  })).sort((a,b) => b.qty - a.qty).slice(0, 5);

  return {
    revenue: totalRevenue,
    received: totalReceived,
    expense: totalExpense,
    profit: grossProfit,
    topItems: topItems,
    orderCount: monthlySales.length
  };
}