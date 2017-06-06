const { db } = helpers;

module.exports = class {
  constructor(options) {
    this.id = options.id;
    this.worth = options.worth;
    this.inShop = options.inShop || true;
  }

  toString() { return this.id; }
  format(amount) {
    amount = Math.abs(amount);
    if (amount === 1) return this.id;
    if (this.id.slice(-1) === 's') return `${this.id}es`;
    return `${this.id}s`;
  }

  get imagePath() {
    return `assets/items/${this.id}.png`;
  }

  get plain() {
    return {
      id: this.id,
      worth: this.worth,
      inShop: this.inShop
    };
  }

  async add() { return db.add('items', this.plain); }
  async update() { return db.update('items', this.plain); }
  static async remove(id) { return db.remove('items', { id }); }

  static async get(id) {
    let obj = await db.get('items', { id });
    if (!obj) {
      obj = await db.get('items', { id: id.slice(0, -1) });
      if (!obj) return;
    }

    return new this(obj);
  }
};
