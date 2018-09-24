var comma = function comma(num) {
  if (num === null) return null;
  return num.toLocaleString("en-US");
};
var money = function money(num, includeCents) {
  if (num === null) return null;
  var unit = "";
  if (num >= 1e9) {
    unit = " billion";
    num /= 1e9
  } else if (num >= 1e6) {
    unit = " million";
    num /= 1e6;
  }
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: (unit || includeCents ? 2 : 0),
    maximumFractionDigits: (unit || includeCents ? 2 : 0), 
    }) + unit;
};
var percent = function percent(num) {
  if (num == null) return null;
  return `${(num * 100).toFixed(2)}%`;
};
var preprocessLicenseRates = function preprocessLicenseRates(rates) {
  Object.keys(rates).forEach((city) => {
    if (typeof rates[city].license === "number") return;

    rates[city].license  = rates[city].license.split("|") // Split buckets by |
    .map(pair => pair.split(":") // Split threshold:fee by :
    .map(Number)); // cast each as number
  });
  return rates;
};

module.exports = {
  comma,
  money,
  percent,
  preprocessLicenseRates,
};