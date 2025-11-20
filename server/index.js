const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const MONGO_URI = "mongodb+srv://admin:akhtar786@storesoftware.mots3tc.mongodb.net/?appName=StoreSoftware";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// --- SCHEMAS ---
const CustomerSchema = new mongoose.Schema({ name: String, phone: String, totalSpent: { type: Number, default: 0 } });
const VendorSchema = new mongoose.Schema({ name: String, contact: String, address: String, balance: { type: Number, default: 0 } });
const ProductSchema = new mongoose.Schema({ name: String, category: String, description: String, costPrice: Number, sellPrice: Number, qty: Number, image: String });
// NEW: Expense Schema
const ExpenseSchema = new mongoose.Schema({ description: String, amount: Number, category: String, date: { type: Date, default: Date.now } });

// Updated Sale Schema to store the actual sold price
const SaleSchema = new mongoose.Schema({ 
    invoiceId: String, 
    customerName: String, 
    items: Array, 
    totalAmount: Number, 
    profit: Number, 
    date: { type: Date, default: Date.now } 
});

const Customer = mongoose.model('Customer', CustomerSchema);
const Vendor = mongoose.model('Vendor', VendorSchema);
const Product = mongoose.model('Product', ProductSchema);
const Sale = mongoose.model('Sale', SaleSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

// --- ROUTES ---

// Dashboard (Now includes Expenses in calculation)
app.get('/dashboard', async (req, res) => {
    const sales = await Sale.find().sort({ date: -1 });
    const products = await Product.find();
    const expenses = await Expense.find();
    
    const totalRevenue = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const grossProfit = sales.reduce((acc, curr) => acc + curr.profit, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Cashflow = Money In (Sales) - Money Out (Expenses)
    // Note: Inventory cost is usually considered money out, but for simple cashflow we often look at Sales vs Expenses
    const cashflow = totalRevenue - totalExpenses; 
    
    // Net Profit = Gross Profit from items - Expenses
    const netProfit = grossProfit - totalExpenses;

    res.json({ 
        totalRevenue, 
        grossProfit, 
        totalExpenses,
        netProfit, 
        cashflow,
        inventoryCount: products.length, 
        recentSales: sales.slice(0, 5) 
    });
});

// Expenses Routes
app.get('/expenses', async (req, res) => { res.json(await Expense.find().sort({date: -1})); });
app.post('/expenses', async (req, res) => { await new Expense(req.body).save(); res.json({msg:"Saved"}); });
app.delete('/expenses/:id', async (req, res) => { await Expense.findByIdAndDelete(req.params.id); res.json({msg:"Deleted"}); });

// Sales Route (Updated for Negotiation)
app.post('/sales', async (req, res) => {
    const { items, totalAmount, customerName } = req.body;
    let profit = 0;

    for (let item of items) {
        const product = await Product.findById(item._id);
        if(product) {
            product.qty -= item.soldQty;
            await product.save();
            // Negotiation Logic: Use item.soldPrice (what you actually sold it for) - Cost Price
            profit += (item.soldPrice - product.costPrice) * item.soldQty;
        }
    }

    if(customerName && customerName !== "Walk-in") {
        await Customer.findOneAndUpdate({ name: customerName }, { $inc: { totalSpent: totalAmount } });
    }

    const invoiceId = "INV-" + Date.now().toString().slice(-6);
    const sale = new Sale({ invoiceId, customerName, items, totalAmount, profit });
    await sale.save();
    res.json(sale);
});

// Standard CRUD (Same as before)
app.get('/reports', async (req, res) => {
    const sales = await Sale.find();
    let productReport = {};
    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!productReport[item._id]) { productReport[item._id] = { name: item.name, category: item.category, qtySold: 0, revenue: 0, profit: 0 }; }
            productReport[item._id].qtySold += item.soldQty;
            productReport[item._id].revenue += (item.soldPrice * item.soldQty);
            productReport[item._id].profit += ((item.soldPrice - item.costPrice) * item.soldQty);
        });
    });
    res.json(Object.values(productReport));
});

app.delete('/sales/:id', async (req, res) => { await Sale.findByIdAndDelete(req.params.id); res.json({msg:"Deleted"}); });
app.get('/products', async (req, res) => { res.json(await Product.find()); });
app.post('/products', async (req, res) => { await new Product(req.body).save(); res.json({msg:"Saved"}); });
app.delete('/products/:id', async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({msg:"Deleted"}); });
app.get('/customers', async (req, res) => { res.json(await Customer.find()); });
app.post('/customers', async (req, res) => { await new Customer(req.body).save(); res.json({msg:"Saved"}); });
app.delete('/customers/:id', async (req, res) => { await Customer.findByIdAndDelete(req.params.id); res.json({msg:"Deleted"}); });
app.get('/vendors', async (req, res) => { res.json(await Vendor.find()); });
app.post('/vendors', async (req, res) => { await new Vendor(req.body).save(); res.json({msg:"Saved"}); });
app.delete('/vendors/:id', async (req, res) => { await Vendor.findByIdAndDelete(req.params.id); res.json({msg:"Deleted"}); });

app.listen(5000, () => console.log("Server running on 5000"));