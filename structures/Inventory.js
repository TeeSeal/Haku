const { db } = helpers;

module.exports = class {
  static async get(user, item) {
    const inventory = await db.get('users', user, 'inventory');
    if (item) return inventory[item.id] || 0;
    return inventory;
  }

  static async update(user, item, amount) {
    const balance = await this.get(user, item);
    if (balance === amount) return;
    return db.update('users', {
      id: user.id,
      inventory: { [item]: amount }
    });
  }
};
