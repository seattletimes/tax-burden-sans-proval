module.exports = function equation() {
  return {
    props: ["parts"],
    template: require("./_equation.html"),
  };
};