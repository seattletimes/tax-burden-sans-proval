require("component-responsive-frame");
var $ = require("./lib/qsa");

// Vue and components
var Vue = require("vue/dist/vue.min");
var info = require("./info");
var equation = require("./equation");

// Other code
var { comma, money, percent, preprocessLicenseRates } = require("./util");
var calculateTaxes = require("./calculate");

// Defining an array so we have consistent order (unlike Object.keys)
var outputKeys = ["bo", "head", "sales", "license"];
var outputsMeta = {
  //property: { name: "Property tax" },
  bo: { name: "Business and occupation (B&O) tax " },
  head: { name: "Head tax" },
  sales: { name: "Sales tax" },
  license: { name: "Business license" },
};
outputKeys.forEach((o) => {
  outputsMeta[o].hidden = false;
});

// Private variable tracking whether we've focused the legend
var legendFocused = false;

Vue.component("info", info());
Vue.component("equation", equation());

var app = new Vue({
  el: "main",
  data: {
    //spaces: [1000,2000,3000,4000],
    businessInputs: {
      bizType: {
        name: "Type of business",
        value: null,
        info: "Some 44 Washington cities levy B&O taxes at varying rates depending on business type. The state also collects B&O taxes, which aren’t shown here.",
      },
      bizIncome: {
        name: "Gross revenue",
        value: null,
        max: 5e10,
        step: 1e4,
        info: "Cities collect B&O taxes based on a business’ gross receipts from sales inside that city – a straightforward number for retailers and wholesalers that make their sales to customers inside the city limits. For service businesses, cities determine how much revenue they can tax by accounting for the share of a company’s payroll within city limits and revenue directly from customers located in the city. Few businesses only have revenue within a single city.",
      },
      employees: {
        name: "Employees (full time equivalent)",
        value: null,
        max: 5e4,
        step: 1e2,
        info: "Spokane, Vancouver, Kirkland, Kent and Redmond charge more for business licenses based on the number of employees a company has. This component of the business license in these cities is displayed in dark blue below.",
      },
      //space: {
        //name: "Assessed property value",
        //value: "Please select one",
        //max: 5e9,
        //step: 1e5,
        //info: "Businesses pay property taxes at the same rate as other property owners. If they lease space, their rent typically reflects the taxes paid by landlords, though business tenants may also pay property taxes themselves. Input the value of the property your company occupies for an estimate of property tax payments on a property of the same value in each city.",
      //},
      taxableSales: {
        name: "Local sales tax on business purchases",
        value: null,
        max: 1,
        step: 1e-3,
        info: "Businesses pay the sales tax, too. A typical business will make taxable purchases of about 0.5 percent of revenue, though this will vary widely depending on the type of business. The sales tax rates given for each city include the portion going to the cities themselves and other local jurisdictions, such as counties and transit districts. The statewide rate of 6.5 percent is excluded.",
      },
    },
    bizInputInfo: "",
    bizTypes: ["retail", "services", "manufacturing", "wholesale"],
    cityNotes: {
      Spokane: "Spokane's head tax depends on a company's total number of employees: $10 per employee if the company has 1-5 employees, $15 per employee if it has 6-10, and $20 per employee if it has more than 10.",
      Vancouver: "Vancouver caps its head tax at $36,000.",
      Kent: "In Kent, the cost of a business license depends on the number of employees: $340.59 for 25-49 employees,  $540.59 for 50-99 and $740.49 for 100 or more.",
    },
    activeCities: {},
    cities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Kirkland", "Redmond"],
    taxRates: preprocessLicenseRates(window.rates),
    outputKeys,
    outputsMeta,
    info: "Hover over different areas of the chart for more information.",
    chartDiv: null,
    hoverBoxDiv: null,
    hoverBoxContent: null,
    hoverCaveat: null,
    maxColWidth: 0,
    preset: null,
    examples: require("./examples"),
    expandedFooter: false,
  },
  computed: {
    outputs() {
      var result = {};
      Object.keys(this.taxRates).forEach((city) => {
        var cityRates = this.taxRates[city];
        result[city] = calculateTaxes(city, cityRates, this.businessInputs);
      });
      return result;
    },
    totalBurden() {
      var result = { max: 0 };
      Object.keys(this.outputs).forEach((city) => {
        var taxes = this.outputs[city];
        var total = Object.keys(taxes)
          .filter(taxType => !this.outputsMeta[taxType].hidden)
          .reduce((total, taxType) => total + taxes[taxType].value, 0);
        result[city] = money(total);
        if (total > result.max) result.max = total; // Also keep track of max total, for display
      });
      return result;
    },
  },
  methods: {
    formatInput(short, num) {
      if (num === null) return "";
      if (short === "employees") return comma(num);
      if (short === "taxableSales") return percent(num);
      return money(num);
    },
    showOnly(shownOutput, focusMode) {
      if (legendFocused) { // If we have focused, only go forward if we are unfocusing (not if we are mouseout-ing)
        if (focusMode) legendFocused = false;
        else return;
      }
      else if (focusMode) { // Record that we have focused
        legendFocused = true;
      }

      outputKeys.forEach((o) => {
        this.outputsMeta[o].hidden = shownOutput ? (shownOutput !== o) : false;
      });
    },
    showHoverBox(ev, city, taxType) {
      // Only when you first move mouse over
      if (!this.hoverBoxContent) {
        this.hoverBoxContent = this.updateHoverContent(city, taxType);
        this.hoverCaveat = this.outputs[city][taxType].caveat;
      }

      var clientX, clientY;
      if (ev.clientX && ev.clientY) { // mouse event
        clientX = ev.clientX;
        clientY = ev.clientY;
      } else { // focus event
        var barRect = ev.target.getBoundingClientRect();
        clientX = barRect.left;
        clientY = barRect.top;
      }
      var chartDivRect = this.chartDiv.getBoundingClientRect();
      if (chartDivRect.width > 460) { // desktop
        this.hoverBoxDiv.style.left = `${clientX - chartDivRect.left}px`;
        this.hoverBoxDiv.style.bottom = `${chartDivRect.bottom - clientY}px`;
      } else { //mobile - full-ish width
        this.hoverBoxDiv.style.left = "0";
        this.hoverBoxDiv.style.bottom = `${chartDivRect.bottom - clientY + 30}px`;
      }
    },
    closeHoverBox() {
      this.hoverBoxContent = null;
      this.hoverCaveat = null;
    },
    updateHoverContent(city, tax) {
      var result = this.outputs[city][tax].equationParts.slice();
      result.push(["="]);
      var total = money(this.outputs[city][tax].value);
      result.push([total]);
      return result;
    },
  },
  watch: {
    preset(newPreset, oldPreset) {
      if (newPreset === "newCustom") { // i.e. changed input, didn't click "custom"
        this.examples.custom.businessInputs = {}; // clear previously "saved"
        this.preset = "custom";
        return;
      }

      if (oldPreset === "custom") { // If we go from custom to a preset, "save" our custom inputs
        Object.keys(this.businessInputs).forEach((short) => {
          this.examples.custom.businessInputs[short] = this.businessInputs[short].value;
        });
      }
      var newBusinessInputs = this.examples[newPreset].businessInputs;
      Object.keys(newBusinessInputs).forEach((short) => {
        this.businessInputs[short].value = newBusinessInputs[short];
      });
    },
  },
  mounted() {
    this.preset = "supermarket";

    this.chartDiv = $.one(".chart");
    this.hoverBoxDiv = $.one(".hover-box");

    var refreshChartSize = () => {
      // Allocates 250px for left and right labels (city name and total $ amount)
      // Except on mobile, sets maxColWidth to entire chart size
      this.maxColWidth = (this.chartDiv.clientWidth > 460) ? (this.chartDiv.clientWidth - 250) : (this.chartDiv.clientWidth);
    };
    window.addEventListener("resize", refreshChartSize);
    refreshChartSize();
  },
});
