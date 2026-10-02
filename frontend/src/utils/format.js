// Prices are shown in Gambian dalasi, e.g. "D12.50"
export const formatPrice = (amount) => `D${Number(amount || 0).toFixed(2)}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
