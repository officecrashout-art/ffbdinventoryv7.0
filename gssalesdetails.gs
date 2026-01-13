/**
 * FASHION FIZZ BD - SALES DETAILS & ANALYTICS (FIXED)
 */

function sdGetSalesDetails(startDate, endDate) {
  try {
    // Fetches all detail rows from the SalesDetails sheet
    const allDetails = soGetRangeDataAsObjects('RANGESD');
    if (!allDetails || allDetails.length === 0) return { details: [], summary: {totalQty:0, totalRevenue:0} };

    // Helper to normalize dates for accurate comparison
    const parseDate = (dStr) => {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return null;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };

    const startTS = startDate ? parseDate(startDate) : null;
    const endTS = endDate ? parseDate(endDate) : null;

    // Filter by the selected Date Range
    const filtered = allDetails.filter(row => {
      if (!row['SO Date']) return false;
      const rowTS = parseDate(row['SO Date']);
      if (!rowTS) return false;
      if (startTS && rowTS < startTS) return false;
      if (endTS && rowTS > endTS) return false;
      return true;
    });

    // Calculate Summary Totals
    const summary = filtered.reduce((acc, curr) => {
      acc.totalQty += (parseFloat(curr['QTY Sold']) || 0);
      acc.totalRevenue += (parseFloat(curr['Total Sales Price']) || 0);
      return acc;
    }, { totalQty: 0, totalRevenue: 0 });

    return {
      details: filtered.reverse(), // Shows newest sales at the top
      summary: summary
    };
  } catch (e) {
    throw new Error("Failed to fetch details: " + e.message);
  }
}