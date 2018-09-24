module.exports = {
  supermarket: {
    businessInputs: {
      bizIncome: 20727000,
      employees: 124,
      space: 41300 * 96, // supermarket avg size * avg of the 10 supermarket value/sqft from spreadsheet
      taxableSales: 0.005,
      bizType: "retail",
    },
  },
  software: {
    businessInputs: {
      bizIncome: 22483500,
      employees: 117,
      space: 23400 * 248, // See note above
      taxableSales: 0.005,
      bizType: "services",
    },
  },
  custom: {
    businessInputs: {}
  },
};
