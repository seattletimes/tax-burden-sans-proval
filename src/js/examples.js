module.exports = {
  supermarket: {
    businessInputs: {
      bizIncome: 0, //20727000,
      employees: 0, //124,
      //space: 41300 * 96, // supermarket avg size * avg of the 10 supermarket value/sqft from spreadsheet
      taxableSales: 0.005,
      bizType: "retail",
    },
  },
  software: {
    businessInputs: {
      bizIncome: 0, // 22483500,
      employees: 0, // 117,
      //space: 23400 * 248, // See note above
      taxableSales: 0.005,
      bizType: "services",
    },
  },
  custom: {
    businessInputs: {}
  },
};
