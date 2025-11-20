"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  DollarSign, Printer, Trash2, Search, 
  TrendingUp, ArrowDownLeft, ArrowUpRight, Plus, Truck, LogIn, LogOut, X, FileText, Download, Image as ImageIcon, Wallet 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

const API = "http://localhost:5000";

// ============================================================================
// 1. UI HELPER COMPONENTS
// ============================================================================

const SidebarItem = ({ id, icon: Icon, label, activeTab, setActiveTab }: any) => (
  <button onClick={() => setActiveTab(id)} className={`flex items-center w-full p-3 mb-2 rounded-lg transition-all ${activeTab === id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
    <Icon size={20} className="mr-3" /> <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color} bg-opacity-10`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

// ============================================================================
// 2. ADMIN VIEWS
// ============================================================================

const DashboardView = ({ data, deleteSale }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Total Sales (Revenue)" value={`PKR ${data.stats.totalRevenue?.toLocaleString() || 0}`} icon={TrendingUp} color="bg-green-500" />
      <StatCard title="Net Profit (After Exp)" value={`PKR ${data.stats.netProfit?.toLocaleString() || 0}`} icon={DollarSign} color="bg-blue-500" />
      <StatCard title="Total Expenses" value={`PKR ${data.stats.totalExpenses?.toLocaleString() || 0}`} icon={ArrowDownLeft} color="bg-red-500" />
      <StatCard title="Cash in Hand (Sales-Exp)" value={`PKR ${data.stats.cashflow?.toLocaleString() || 0}`} icon={Wallet} color="bg-purple-500" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Sales Overview</h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stats.recentSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="invoiceId" tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalAmount" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Transactions</h3>
        <div className="space-y-4 overflow-y-auto max-h-64">
          {data.stats.recentSales?.map((sale: any) => (
            <div key={sale._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100">
              <div>
                <p className="font-bold text-sm text-gray-800">{sale.invoiceId}</p>
                <p className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold">PKR {sale.totalAmount}</span>
                <button onClick={() => deleteSale(sale._id)} className="p-1 text-red-300 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ExpensesView = ({ expenses, form, setForm, onSave, onDelete }: any) => (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Add Daily Expense</h3>
          <form onSubmit={onSave} className="flex gap-4 items-end">
             <div className="flex-1">
                 <label className="text-xs text-gray-500">Description</label>
                 <input className="w-full p-2 border rounded text-gray-900" placeholder="e.g. Electricity Bill, Tea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
             </div>
             <div className="w-32">
                 <label className="text-xs text-gray-500">Amount (PKR)</label>
                 <input type="number" className="w-full p-2 border rounded text-gray-900" placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
             </div>
             <div className="w-40">
                 <label className="text-xs text-gray-500">Category</label>
                 <select className="w-full p-2 border rounded text-gray-900" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option>General</option><option>Utilities</option><option>Rent</option><option>Food</option><option>Salary</option>
                 </select>
             </div>
             <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-bold h-10">Add Expense</button>
          </form>
       </div>
       
       <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-gray-800 text-white"><tr><th className="p-4">Description</th><th className="p-4">Category</th><th className="p-4">Date</th><th className="p-4 text-right">Amount</th><th className="p-4">Action</th></tr></thead>
             <tbody>
                {expenses.map((e: any) => (
                   <tr key={e._id} className="border-b hover:bg-gray-50">
                       <td className="p-4 text-gray-900 font-medium">{e.description}</td>
                       <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">{e.category}</span></td>
                       <td className="p-4 text-gray-500 text-sm">{new Date(e.date).toLocaleDateString()}</td>
                       <td className="p-4 text-right font-bold text-red-600">- PKR {e.amount}</td>
                       <td className="p-4"><button onClick={() => onDelete(e._id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button></td>
                    </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="p-4 text-right">Total Expenses:</td>
                    <td className="p-4 text-right text-red-700">PKR {expenses.reduce((a:any,c:any) => a+c.amount, 0)}</td>
                    <td></td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>
);

const POSView = ({ products, cart, addToCart, removeFromCart, updateCartPrice, processSale, customers, selectedCustomer, setSelectedCustomer, searchTerm, setSearchTerm }: any) => (
  <div className="flex h-[calc(100vh-140px)] gap-6">
    <div className="w-2/3 flex flex-col">
      <div className="mb-4 relative flex gap-2">
        <div className="relative flex-1"><Search className="absolute left-3 top-3 text-gray-400" size={20} /><input type="text" placeholder="Search products..." className="w-full pl-10 p-3 border rounded-lg text-gray-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} /></div>
        <select className="p-3 border rounded-lg bg-white min-w-[200px] text-gray-900" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}><option value="Walk-in">Walk-in Customer</option>{customers.map((c: any) => <option key={c._id} value={c.name}>{c.name}</option>)}</select>
      </div>
      <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2 pb-20">
        {products.filter((p:any) => p.name.toLowerCase().includes(searchTerm)).map((product:any) => (
          <div key={product._id} onClick={() => product.qty > 0 && addToCart(product)} className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md ${product.qty < 1 ? 'opacity-50' : ''}`}>
            <div className="h-24 mb-2 flex items-center justify-center bg-gray-100 rounded">{product.image ? <img src={product.image} className="h-full object-contain"/> : <span className="text-3xl">📦</span>}</div>
            <h4 className="font-bold text-gray-800 truncate">{product.name}</h4>
            <div className="flex justify-between items-center mt-2"><span className="font-bold text-blue-600">PKR {product.sellPrice}</span><span className={`text-xs px-2 py-1 rounded ${product.qty < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>Qty: {product.qty}</span></div>
          </div>
        ))}
      </div>
    </div>
    <div className="w-1/3 bg-white rounded-xl shadow-lg flex flex-col h-full border overflow-hidden">
      <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-lg flex items-center text-gray-800"><ShoppingCart className="mr-2" size={20}/> Bill: {selectedCustomer}</h3></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item:any, idx:number) => (
          <div key={idx} className="flex justify-between items-center border-b pb-2">
            <div className="flex-1"><p className="font-medium text-gray-800">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.soldQty}</p></div>
            
            {/* NEGOTIATION INPUT */}
            <div className="w-24 mr-3">
                <input type="number" className="w-full p-1 border rounded text-right text-sm font-bold text-gray-900" value={item.soldPrice} onChange={(e) => updateCartPrice(item._id, e.target.value)} />
            </div>
            
            <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
      <div className="p-6 bg-gray-50 border-t">
        <div className="flex justify-between text-xl font-bold mb-4 text-gray-800"><span>Total</span><span>PKR {cart.reduce((a:any,c:any)=>a+(c.soldPrice*c.soldQty),0)}</span></div>
        <button onClick={processSale} disabled={cart.length === 0} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300">PAY & PRINT</button>
      </div>
    </div>
  </div>
);

// ... (Other components: ReportsView, InventoryView, VendorsView, CustomersView, InvoiceView, PublicHome - SAME AS BEFORE, included below for completeness)

const ReportsView = () => {
    const [reportData, setReportData] = useState([]);
    useEffect(() => { axios.get(`${API}/reports`).then(res => setReportData(res.data)); }, []);
    const downloadExcel = () => {
        const headers = ["Product Name,Category,Qty Sold,Revenue (PKR),Profit (PKR)"];
        const rows = reportData.map((row:any) => `${row.name},${row.category},${row.qtySold},${row.revenue},${row.profit}`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "sales_report.csv");
        document.body.appendChild(link); link.click();
    };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border"><div><h2 className="text-xl font-bold text-gray-800">Monthly Sales Report</h2></div><button onClick={downloadExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700"><Download size={18} /> Download Excel</button></div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left"><thead className="bg-gray-800 text-white"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4 text-center">Qty Sold</th><th className="p-4 text-right">Revenue</th><th className="p-4 text-right">Profit</th></tr></thead>
                    <tbody>{reportData.map((row:any, idx) => (<tr key={idx} className="border-b hover:bg-gray-50"><td className="p-4 font-medium text-gray-800">{row.name}</td><td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">{row.category}</span></td><td className="p-4 text-center font-bold text-gray-800">{row.qtySold}</td><td className="p-4 text-right text-gray-800">PKR {row.revenue}</td><td className="p-4 text-right font-bold text-green-600">PKR {row.profit}</td></tr>))}</tbody>
                </table>
            </div>
        </div>
    )
}

const InventoryView = ({ products, form, setForm, onSave, onDelete, handleImageUpload }: any) => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Add New Product</h3>
      <form onSubmit={onSave} className="grid grid-cols-6 gap-4">
        <input placeholder="Name" className="col-span-3 p-2 border rounded text-gray-900 bg-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <select className="col-span-3 p-2 border rounded text-gray-900 bg-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option>General</option><option>Books</option><option>Clothes</option><option>Sports</option></select>
        <div className="col-span-6 border p-2 rounded border-gray-300"><label className="block text-xs text-gray-500 mb-1">Product Image</label><input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-900" /></div>
        <input placeholder="Description" className="col-span-6 p-2 border rounded text-gray-900 bg-white" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input type="number" placeholder="Cost Price" className="col-span-2 p-2 border rounded text-gray-900 bg-white" value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} required />
        <input type="number" placeholder="Sell Price" className="col-span-2 p-2 border rounded text-gray-900 bg-white" value={form.sellPrice} onChange={e => setForm({...form, sellPrice: e.target.value})} required />
        <input type="number" placeholder="Qty" className="col-span-2 p-2 border rounded text-gray-900 bg-white" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} required />
        <button type="submit" className="col-span-6 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">Save Product</button>
      </form>
    </div>
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4 text-gray-700">Image</th><th className="p-4 text-gray-700">Name</th><th className="p-4 text-gray-700">Price</th><th className="p-4 text-gray-700">Stock</th><th className="p-4 text-gray-700">Action</th></tr></thead>
        <tbody>{products.map((p: any) => (<tr key={p._id} className="border-b hover:bg-gray-50"><td className="p-4 h-16 w-16">{p.image ? <img src={p.image} className="h-10 w-10 object-cover rounded" /> : <span className="text-2xl">📦</span>}</td><td className="p-4 text-gray-900 font-medium">{p.name}</td><td className="p-4 font-bold text-gray-900">PKR {p.sellPrice}</td><td className={`p-4 font-bold ${p.qty < 5 ? 'text-red-500' : 'text-green-600'}`}>{p.qty}</td><td className="p-4"><button onClick={() => onDelete(p._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button></td></tr>))}</tbody>
      </table>
    </div>
  </div>
);

const VendorsView = ({ vendors, form, setForm, onSave, onDelete }: any) => (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold text-lg mb-4 text-gray-800">Add Vendor</h3><form onSubmit={onSave} className="grid grid-cols-3 gap-4"><input className="p-2 border rounded text-gray-900" placeholder="Vendor Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /><input className="p-2 border rounded text-gray-900" placeholder="Contact / Phone" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} /><input className="p-2 border rounded text-gray-900" placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /><button type="submit" className="col-span-3 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-bold">Save Vendor</button></form></div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{vendors.map((v: any) => (<div key={v._id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-start"><div><div className="flex items-center gap-2 mb-2"><Truck size={18} className="text-purple-500"/><h4 className="font-bold text-lg text-gray-800">{v.name}</h4></div><p className="text-sm text-gray-600">📞 {v.contact}</p><p className="text-xs text-gray-400 mt-1">📍 {v.address}</p></div><button onClick={() => onDelete(v._id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button></div>))}</div>
    </div>
);

const CustomersView = ({ customers, form, setForm, onSave, onDelete }: any) => (
  <div className="space-y-6">
     <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold text-lg mb-4 text-gray-800">Add Customer</h3><form onSubmit={onSave} className="flex gap-4"><input className="flex-1 p-2 border rounded text-gray-900" placeholder="Customer Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /><input className="flex-1 p-2 border rounded text-gray-900" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /><button type="submit" className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700 font-bold">Save</button></form></div>
     <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4 text-gray-700">Name</th><th className="p-4 text-gray-700">Phone</th><th className="p-4 text-gray-700">Total Spent</th><th className="p-4">Action</th></tr></thead><tbody>{customers.map((c: any) => (<tr key={c._id} className="border-b hover:bg-gray-50"><td className="p-4 text-gray-900">{c.name}</td><td className="p-4 text-gray-600">{c.phone}</td><td className="p-4 font-bold text-blue-600">PKR {c.totalSpent}</td><td className="p-4"><button onClick={() => onDelete(c._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button></td></tr>))}</tbody></table></div>
  </div>
);

const InvoiceView = ({ invoice, setActiveTab, setCart }: any) => (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[10mm] print:shadow-none print:w-full print:p-0" id="invoice-area">
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8"><div><h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Jameel General Store</h1><p className="text-gray-500 mt-2 font-medium">Pull 10/P, Mudubra</p></div><div className="text-right"><h2 className="text-2xl font-bold text-gray-700">INVOICE</h2><p className="font-bold text-gray-800 text-lg">#{invoice?.invoiceId}</p><p className="text-sm text-gray-500">{new Date().toLocaleString()}</p></div></div>
        <div className="flex justify-between mb-8"><div className="w-1/2"><p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Bill To:</p><h3 className="text-xl font-bold text-gray-800">{invoice?.customerName}</h3></div><div className="w-1/2 text-right"><h3 className="text-xl font-bold text-green-600">PAID</h3></div></div>
        <table className="w-full mb-8 border-collapse"><thead><tr className="bg-gray-900 text-white"><th className="text-left p-3 uppercase">Item</th><th className="text-center p-3 uppercase">Qty</th><th className="text-right p-3 uppercase">Price</th><th className="text-right p-3 uppercase">Amount</th></tr></thead><tbody>{invoice?.items.map((item: any, i: number) => (<tr key={i} className="border-b border-gray-200 hover:bg-gray-50"><td className="p-3 text-gray-700 font-medium">{item.name}</td><td className="p-3 text-center text-gray-600">{item.soldQty}</td><td className="p-3 text-right text-gray-600">{item.soldPrice}</td><td className="p-3 text-right font-bold text-gray-800">{item.soldPrice * item.soldQty}</td></tr>))}</tbody></table>
        <div className="flex justify-end"><div className="w-1/2 border-t border-gray-300 pt-4"><div className="flex justify-between text-2xl font-bold text-white bg-gray-900 p-3 rounded mt-4 shadow-sm"><span>Grand Total:</span><span>PKR {invoice?.totalAmount}</span></div></div></div>
      </div>
      <div className="mt-8 space-x-4 no-print fixed bottom-10"><button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 shadow-lg inline-flex items-center"><Printer className="mr-2" size={20} /> Print Invoice</button><button onClick={() => {setActiveTab('pos'); setCart([]);}} className="bg-gray-600 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-700 shadow-lg">Start New Sale</button></div>
    </div>
);

const PublicHome = ({ products, onLoginClick, onQuickAddClick }: any) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) && (filter === "All" || p.category === filter));
  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <nav className="bg-white shadow-sm sticky top-0 z-40"><div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center"><div className="flex items-center gap-2"><div className="bg-blue-600 text-white p-2 rounded-lg"><Package size={24} /></div><span className="text-xl font-bold text-gray-800 tracking-tight">Jameel General Store</span></div><div className="flex items-center gap-4"><button onClick={onQuickAddClick} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-bold flex items-center gap-2"><Plus size={16} /> Add Product</button><button onClick={onLoginClick} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800"><LogIn size={18} /> Admin</button></div></div></nav>
      {selectedProduct && (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-2xl"><button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={24}/></button><div className="flex flex-col items-center"><div className="h-48 w-full mb-4 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 border">{selectedProduct.image ? <img src={selectedProduct.image} className="w-full h-full object-cover" /> : <div className="text-6xl">📦</div>}</div><h2 className="text-3xl font-extrabold text-gray-900 text-center">{selectedProduct.name}</h2><span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold mt-2 uppercase">{selectedProduct.category}</span><div className="mt-6 w-full space-y-4"><div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-600 font-medium">Price</span><span className="text-2xl font-bold text-green-600">PKR {selectedProduct.sellPrice}</span></div><div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-600 font-medium">Status</span><span className={`font-bold ${selectedProduct.qty > 0 ? 'text-blue-600' : 'text-red-500'}`}>{selectedProduct.qty > 0 ? `${selectedProduct.qty} Available` : 'Out of Stock'}</span></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-100"><p className="text-gray-800 text-sm">{selectedProduct.description || "No detailed description available."}</p></div></div></div></div></div>)}
      <div className="max-w-7xl mx-auto px-4 py-8"><div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"><div className="flex gap-2 overflow-x-auto pb-2">{['All', 'Books', 'Clothes', 'Sports'].map(cat => (<button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${filter === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>{cat}</button>))}</div><div className="relative w-full md:w-96"><Search className="absolute left-3 top-3 text-gray-400" size={20} /><input type="text" placeholder="Search items..." className="w-full pl-10 p-3 rounded-full border focus:ring-2 ring-blue-500 outline-none text-gray-900" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{filteredProducts.map((product: any) => (<div key={product._id} onClick={() => setSelectedProduct(product)} className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all cursor-pointer group overflow-hidden h-full flex flex-col"><div className="h-56 bg-gray-100 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500 relative">{product.image ? <img src={product.image} className="w-full h-full object-cover" /> : (product.category === 'Books' ? <span className="text-5xl">📚</span> : <span className="text-5xl">📦</span>)}</div><div className="p-5 flex-1 flex flex-col"><h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{product.name}</h3><div className="flex justify-between items-end mt-auto"><span className="text-xl font-bold text-blue-600">PKR {product.sellPrice}</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">View</span></div></div></div>))}</div></div>
    </div>
  );
};

// ============================================================================
// 4. MAIN APP CONTROLLER
// ============================================================================

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddPass, setQuickAddPass] = useState("");
  const [isQuickAddAuthorized, setIsQuickAddAuthorized] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [data, setData] = useState<any>({ products: [], customers: [], vendors: [], expenses: [], stats: {} });
  const [cart, setCart] = useState<any[]>([]);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('Walk-in');

  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [productForm, setProductForm] = useState({ name: '', category: 'General', description: '', costPrice: '', sellPrice: '', qty: '', image: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '' });
  const [vendorForm, setVendorForm] = useState({ name: '', contact: '', address: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: 'General' });

  useEffect(() => { fetchData(); }, [activeTab, isAuthenticated]);

  const fetchData = async () => {
    try {
      const p = await axios.get(`${API}/products`);
      if (isAuthenticated) {
          const [c, v, e, d] = await Promise.all([axios.get(`${API}/customers`), axios.get(`${API}/vendors`), axios.get(`${API}/expenses`), axios.get(`${API}/dashboard`)]);
          setData({ products: p.data, customers: c.data, vendors: v.data, expenses: e.data, stats: d.data });
      } else { setData((prev:any) => ({ ...prev, products: p.data })); }
    } catch (e) { console.error(e); }
  };

  const handleLogin = (e: FormEvent) => { e.preventDefault(); if(loginForm.user === 'admin' && loginForm.pass === 'akhtar786') { setIsAuthenticated(true); setShowLoginModal(false); fetchData(); } else { alert("Invalid Credentials!"); } };
  const handleQuickAddAuth = (e: FormEvent) => { e.preventDefault(); if(quickAddPass === 'akhtar786') { setIsQuickAddAuthorized(true); } else { alert("Wrong Password!"); } };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if(file) { const reader = new FileReader(); reader.onloadend = () => { setProductForm({...productForm, image: reader.result as string}); }; reader.readAsDataURL(file); } };
  const handleProductSave = async (e: FormEvent) => { e.preventDefault(); await axios.post(`${API}/products`, productForm); setProductForm({ name: '', category: 'General', description: '', costPrice: '', sellPrice: '', qty: '', image: '' }); alert("Product Added!"); if(showQuickAdd) { setShowQuickAdd(false); setQuickAddPass(""); setIsQuickAddAuthorized(false); } fetchData(); };
  const handleProductDelete = async (id: string) => { if(confirm("Delete?")) { await axios.delete(`${API}/products/${id}`); fetchData(); }};
  const handleCustomerSave = async (e: FormEvent) => { e.preventDefault(); await axios.post(`${API}/customers`, customerForm); setCustomerForm({ name: '', phone: '' }); fetchData(); };
  const handleCustomerDelete = async (id: string) => { if(confirm("Delete?")) { await axios.delete(`${API}/customers/${id}`); fetchData(); }};
  const handleVendorSave = async (e: FormEvent) => { e.preventDefault(); await axios.post(`${API}/vendors`, vendorForm); setVendorForm({ name: '', contact: '', address: '' }); fetchData(); };
  const handleVendorDelete = async (id: string) => { if(confirm("Delete?")) { await axios.delete(`${API}/vendors/${id}`); fetchData(); }};
  const handleSaleDelete = async (id: string) => { if(confirm("Delete transaction?")) { await axios.delete(`${API}/sales/${id}`); fetchData(); }};
  
  // Expense Handler
  const handleExpenseSave = async (e: FormEvent) => { e.preventDefault(); await axios.post(`${API}/expenses`, expenseForm); setExpenseForm({ description: '', amount: '', category: 'General' }); fetchData(); };
  const handleExpenseDelete = async (id: string) => { if(confirm("Delete expense?")) { await axios.delete(`${API}/expenses/${id}`); fetchData(); }};

  // Cart Negotiation Handler
  const addToCart = (product: any) => {
    const exist = cart.find(x => x._id === product._id);
    if (exist) { if(exist.soldQty + 1 > product.qty) return alert("Out of Stock!"); setCart(cart.map(x => x._id === product._id ? { ...exist, soldQty: exist.soldQty + 1 } : x)); } 
    else { setCart([...cart, { ...product, soldQty: 1, soldPrice: product.sellPrice }]); }
  };
  const updateCartPrice = (id: string, newPrice: string) => {
      setCart(cart.map(item => item._id === id ? { ...item, soldPrice: parseFloat(newPrice) } : item));
  };
  const removeFromCart = (id: string) => setCart(cart.filter(x => x._id !== id));
  const processSale = async () => {
    if(cart.length === 0) return;
    const total = cart.reduce((a,c) => a + (c.soldPrice * c.soldQty), 0);
    const res = await axios.post(`${API}/sales`, { items: cart, totalAmount: total, customerName: selectedCustomer });
    setLastInvoice(res.data); setCart([]); setActiveTab('invoice');
  };

  if (showQuickAdd) { return (<div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"><div className="bg-white p-8 rounded-xl w-full max-w-md relative"><button onClick={() => {setShowQuickAdd(false); setIsQuickAddAuthorized(false);}} className="absolute top-4 right-4 text-gray-600 hover:text-red-500"><X/></button><h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Add Item</h2>{!isQuickAddAuthorized ? (<form onSubmit={handleQuickAddAuth} className="space-y-4"><input type="password" placeholder="Admin Password" className="w-full p-3 border rounded text-gray-900" value={quickAddPass} onChange={e => setQuickAddPass(e.target.value)} autoFocus /><button className="w-full bg-blue-600 text-white py-2 rounded font-bold">Verify</button></form>) : (<form onSubmit={handleProductSave} className="space-y-3"><input placeholder="Name" className="w-full p-2 border rounded text-gray-900" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required /><div className="border p-2 rounded"><label className="block text-xs text-gray-500 mb-1">Upload Image</label><input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-900" /></div><input placeholder="Description" className="w-full p-2 border rounded text-gray-900" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /><select className="w-full p-2 border rounded text-gray-900" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}><option>General</option><option>Books</option><option>Clothes</option><option>Sports</option></select><div className="flex gap-2"><input type="number" placeholder="Cost" className="w-1/2 p-2 border rounded text-gray-900" value={productForm.costPrice} onChange={e => setProductForm({...productForm, costPrice: e.target.value})} required /><input type="number" placeholder="Sell Price" className="w-1/2 p-2 border rounded text-gray-900" value={productForm.sellPrice} onChange={e => setProductForm({...productForm, sellPrice: e.target.value})} required /></div><input type="number" placeholder="Qty" className="w-full p-2 border rounded text-gray-900" value={productForm.qty} onChange={e => setProductForm({...productForm, qty: e.target.value})} required /><button type="submit" className="w-full bg-green-600 text-white py-3 rounded font-bold">Add to Store</button></form>)}</div></div>) }
  if (showLoginModal) { return (<div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"><div className="bg-white p-8 rounded-xl w-full max-w-md relative"><button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500"><X/></button><h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Admin Login</h2><form onSubmit={handleLogin} className="space-y-4"><input type="text" placeholder="Username" className="w-full p-3 border rounded text-gray-900" value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})} /><input type="password" placeholder="Password" className="w-full p-3 border rounded text-gray-900" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} /><button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold">Sign In</button></form></div></div>) }

  if (isAuthenticated) {
      if (activeTab === 'invoice') return <InvoiceView invoice={lastInvoice} setActiveTab={setActiveTab} setCart={setCart} />;
      return (
        <div className="flex h-screen bg-gray-100 text-gray-900 font-sans overflow-hidden">
            <aside className="w-64 bg-[#0f172a] text-white p-4 flex flex-col shadow-2xl z-50 no-print">
                <div className="mb-10 px-2"><h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2"><LayoutDashboard /> Jameel General Store</h1><p className="text-gray-500 text-xs ml-8">Admin Panel</p></div>
                <nav className="flex-1 space-y-1">
                    <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SidebarItem id="pos" icon={ShoppingCart} label="POS / Sale" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SidebarItem id="expenses" icon={Wallet} label="Expenses" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SidebarItem id="inventory" icon={Package} label="Inventory" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SidebarItem id="customers" icon={Users} label="Customers" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SidebarItem id="vendors" icon={Truck} label="Vendors" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SidebarItem id="reports" icon={FileText} label="Reports & Excel" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-red-400 mt-auto p-3 hover:bg-gray-800 rounded-lg"><LogOut size={20} /> Sign Out</button>
            </aside>
            <main className="flex-1 overflow-y-auto p-8 h-screen no-print">
                <h2 className="text-3xl font-bold capitalize text-gray-800 mb-8">{activeTab}</h2>
                {activeTab === 'dashboard' && <DashboardView data={data} deleteSale={handleSaleDelete} />}
                {activeTab === 'pos' && <POSView products={data.products} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} updateCartPrice={updateCartPrice} processSale={processSale} customers={data.customers} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
                {activeTab === 'expenses' && <ExpensesView expenses={data.expenses} form={expenseForm} setForm={setExpenseForm} onSave={handleExpenseSave} onDelete={handleExpenseDelete} />}
                {activeTab === 'inventory' && <InventoryView products={data.products} form={productForm} setForm={setProductForm} onSave={handleProductSave} onDelete={handleProductDelete} handleImageUpload={handleImageUpload} />}
                {activeTab === 'customers' && <CustomersView customers={data.customers} form={customerForm} setForm={setCustomerForm} onSave={handleCustomerSave} onDelete={handleCustomerDelete} />}
                {activeTab === 'vendors' && <VendorsView vendors={data.vendors} form={vendorForm} setForm={setVendorForm} onSave={handleVendorSave} onDelete={handleVendorDelete} />}
                {activeTab === 'reports' && <ReportsView />}
            </main>
        </div>
      );
  }

  return <PublicHome products={data.products} onLoginClick={() => setShowLoginModal(true)} onQuickAddClick={() => setShowQuickAdd(true)} />;
}