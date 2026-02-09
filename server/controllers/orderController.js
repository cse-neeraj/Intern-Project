import Order from "../models/order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// Place Order COD :/api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product || item.productId);
      if (product) {
        amount += (product.offerPrice || product.price || 0) * item.quantity;
        orderItems.push({
          ...item,
          name: product.name,
          price: product.offerPrice || product.price,
          image: product.image || [],
          category: product.category,
        });
      }
    }

    //Added Tax charge(2%)
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items: orderItems,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const origin = req.headers.origin || "http://localhost:5173";

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let totalAmount = 0;
    const productData = [];
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product || item.productId);
      if (product) {
        const price = product.offerPrice || product.price || 0;
        const quantity = item.quantity;
        productData.push({
          name: product.name,
          price: price,
          quantity: quantity,
        });
        orderItems.push({
          ...item,
          name: product.name,
          price: price,
          image: product.image || [],
          category: product.category,
        });
        totalAmount += price * quantity;
      }
    }

    // Add Tax Charge (2%)
    totalAmount += Math.floor(totalAmount * 0.02);

    const newOrder = await Order.create({
      userId,
      items: orderItems,
      amount: totalAmount,
      address,
      paymentType: "Online",
      isPaid: false,
    });

    // Stripe Gateway Initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe
    const line_items = productData.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        // Including 2% tax in the unit amount to match total order amount
        unit_amount: Math.round(item.price * 100 * 1.02),
      },
      quantity: item.quantity,
    }));

    // create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: newOrder._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// Stripe Webhooks to verify payments Action : /stripe

export const stripeWebhooks = async (req, res) => {
  // stripe Gateway initilaize
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.log(`Webhook signature verification failed: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        // Getting Session Metadata
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });
        if (session.data.length > 0) {
          const { orderId, userId } = session.data[0].metadata;
          // mark Payment as paid
          await Order.findByIdAndUpdate(orderId, { isPaid: true });
          // Clear user cart
          await User.findByIdAndUpdate(userId, { cartItems: {} });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        //Getting Session Metadata
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });
        if (session.data.length > 0) {
          const { orderId } = session.data[0].metadata;
          await Order.findByIdAndDelete(orderId);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all orders ( for seller/admin):/api/order/seller

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const skip = (page - 1) * limit;

    const query = {
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      const searchConditions = [
        { "address.firstName": searchRegex },
        { "address.lastName": searchRegex }
      ];
      // If search term looks like an ObjectId, add it to search conditions
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        searchConditions.push({ _id: search });
      }
      query.$and = [{ $or: searchConditions }];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    res.json({ success: true, orders, totalOrders, totalPages: Math.ceil(totalOrders / limit), currentPage: page });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update Order Status
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status });
    if (order) {
      let message = `Your order #${orderId.slice(-6)} status has been updated to ${status}`;
      if (status === 'Cancelled') {
        message = `Your order #${orderId.slice(-6)} has been  by the seller.`;
      }

      const io = req.app.get('io');
      if (io) io.to(order.userId.toString()).emit('order_updated', { orderId, status });

      const notification = await createNotification(order.userId, "Order Status Updated", message, "order");
      if (notification && io) {
        io.to(order.userId.toString()).emit('new_notification', notification);
      }
    }
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// User Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (order.userId.toString() !== userId) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    if (order.status === "Order Placed") {
      await Order.findByIdAndUpdate(orderId, { status: "Cancelled" });
      res.json({ success: true, message: "Order Cancelled" });
    } else {
      res.json({ success: false, message: "Order cannot be " });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
