module.exports = function info() {
  return {
    props: ["text", "where", "toggle"],
    template: '<button class="i-button" v-on:click="show">ⓘ</button>',
    methods: {
      show() {
        if (this.toggle) {
          this.$set(this.$parent[this.toggle[0]], this.toggle[1], !this.$parent[this.toggle[0]][this.toggle[1]]);
          return;
        }

        if (this.$parent[this.where] === this.text) this.$parent[this.where] = "";
        else this.$parent[this.where] = this.text;
      },
    }
  };
};