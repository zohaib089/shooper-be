const { User } = require("../../models/user");
const { Order } = require("../../models/order");
const { OrderItem } = require("../../models/order_item");
const { CartProduct } = require("../../models/cart_product");
const { Token } = require("../../models/token");
exports.getUsersCount = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (!userCount) {
      return res.status(500).json({ message: "Could not get user count" });
    }
    return res.status(200).json(userCount);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const orders = await Order.find({ user: userId });
    const orderItemsIds = orders.map((order) => order.orderItems);
    await Order.deleteMany({ user: userId });
    await OrderItem.deleteMany({ _id: { $in: orderItemsIds } });
    await CartProduct.deleteMany({ _id: { $in: user.cart } });
    await User.findByIdAndUpdate(userId, {
      $pull: { cart: { $exists: true } },
    });
    await Token.deleteOne({ userId: userId });
    await User.deleteOne({ _id: userId });
    // await Review.deleteMany({ user: userId });
    return res.status(204).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
