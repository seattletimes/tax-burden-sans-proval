var { comma, money, percent } = require("./util");

var kentLicense = function kentLicense(numEmployees) {
  if (numEmployees <= 24) return [240.59, "24 or fewer employees"]; // TK - this is probably not right
  if (numEmployees <= 49) return [340.59, "25-49 employees"];
  if (numEmployees <= 99) return [540.59, "50-99 employees"];
  return [740.59, "100 or more employees"];
};
var calculateLicense = function calculateLicense(city, licenseRate, bizInputs) {
  if (city === "Kent") return kentLicense(bizInputs.employees.value);
  if (typeof licenseRate === "number") return [licenseRate, null];
  var prevThreshold = 0;
  for (var i = 0; i < licenseRate.length; i += 1) {
    var [threshold, fee] = licenseRate[i];
    if (i === licenseRate.length - 1) {
      return [fee, `gross revenue above ${money(prevThreshold)}`];
    }
    if (bizInputs.bizIncome.value <= threshold) return [fee, `gross revenue between ${money(prevThreshold)} and ${money(threshold)}`];
    prevThreshold = threshold;
  }
  return [null, null]; // shouldn't get here
};
var calculateHeadTax = function calculateHeadTax(city, head, numEmployees) {
  if (city === "Spokane") {
    if (numEmployees <= 5) return [10 * numEmployees, "for companies with 5 or fewer employees", 10];
    if (numEmployees <= 10) return [15 * numEmployees, "for companies with 6 to 10 employees", 15];
    return [20 * numEmployees, "for companies with more than 10 employees", 20];
  }
  var result = head * numEmployees;
  if (city === "Vancouver" && result > 36000) return [36000, "Vancouver", null];
  return [result, null, null];
};

var property = function property(city, cityRates, businessInputs) {
  return {
    value: cityRates.property / 1000 * businessInputs.space.value,
    equationParts: [
      [money(businessInputs.space.value), "Assessed property value"],
      ["×"],
      [`${money(cityRates.property, true)} / $1,000 of value`, `${city}'s property tax`],
    ],
  };
};

var bo = function bo(city, cityRates, businessInputs) {
  if (businessInputs.bizIncome.value >= cityRates.threshold) {
    return {
      value: cityRates[businessInputs.bizType.value] * businessInputs.bizIncome.value,
      equationParts: [
        [money(businessInputs.bizIncome.value), "Your gross revenue in the city"],
        ["×"],
        [percent(cityRates[businessInputs.bizType.value]), `${city}'s B&O tax for ${businessInputs.bizType.value}`],
      ],
    };
  }
  return {
    value: 0,
    equationParts: [
      [`There is no B&O tax in ${city} for companies making less than ${money(cityRates.threshold)}`],
    ],
  };
};

var head = function head(city, cityRates, businessInputs) {
  var result = calculateHeadTax(city, cityRates.head, businessInputs.employees.value);

  var equationParts = [];
  if (result[1] === "Vancouver") {
    equationParts.push([400, "Your first 400 employees"]);
    result[1] = null;
  } else {
    equationParts.push([`${comma(businessInputs.employees.value)} employees`, "The number of people you employ"]);
  }
  equationParts.push(["×"]);
  equationParts.push([`${money(result[2]) || money(cityRates.head)} per employee`, `${city}'s head tax${result[1] || ''}`]);

  var caveat = null;
  if (city === "Spokane") {
    caveat = "Spokane's per employee fee changes depending on how many employees – including part-time and temporary -- a business has working in the city: $10 per employee if the company has 1-5 employees, $15 per employee if it has 6-10, and $20 per employee if it has more than 10.";
  } else if (city === "Vancouver") {
    caveat = "Vancouver charges a $90 surcharge per full-time equivalent employee, capped at 400 employees. ";
  } else if (city === "Kirkland") {
    caveat = "Kirkland charges a fee of $105 per full-time employee.";
  } else if (city === "Redomond") {
    caveat = "Redmond charges a fee of $112 per full-time employee.";
  }
  return {
    value: result[0],
    equationParts,
    caveat,
  };
};

var sales = function sales(city, cityRates, businessInputs) {
  return {
    value: cityRates.sales * (businessInputs.bizIncome.value * businessInputs.taxableSales.value),
    equationParts: [
      [money(businessInputs.bizIncome.value), "Your gross revenue"],
      ["×"],
      [percent(businessInputs.taxableSales.value), "Taxable business purchases as a percent of revenue"],
      ["×"],
      [percent(cityRates.sales), `${city}'s sales tax`],
    ],
  };
};

var license = function license(city, cityRates, businessInputs) {
  var result = calculateLicense(city, cityRates.license, businessInputs);
  var description =  result[1] ? ` for companies with ${result[1]}` : "";
  var caveat = null;
  if (city === "Kent") {
    caveat = "In Kent, the cost of a business license depends on the number of employees: $250.59 for fewer than 25 employees, $340.59 for 25-49 employees, $540.59 for 50-99 and $740.49 for 100 or more.";
  }
  return {
    value: result[0],
    equationParts: [
      [money(result[0]), `${city}'s business license fee${description}`],
    ],
    caveat
  };
};

module.exports = function calculateTaxes(c, cr, bi) {
  if (!c || !cr || !bi) return null;
  return {
    property: property(c, cr, bi),
    bo: bo(c, cr, bi),
    head: head(c, cr, bi),
    sales: sales(c, cr, bi),
    license: license(c, cr, bi),
  };
};
