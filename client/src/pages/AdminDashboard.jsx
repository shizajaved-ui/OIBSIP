import { useEffect, useState, useRef } from 'react';
import api, { resolveImageUrl } from '../utils/api.js';
import { motion, AnimatePresence } from 'framer-motion';

import PageLayout from '../components/PageLayout';

const CATEGORIES = ['base', 'sauce', 'cheese', 'vegetable'];
const ORDER_STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

const ReceiptModal = ({ order, onClose }) => {
    const componentRef = useRef();

    const handlePrint = () => {
        const printContent = componentRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    if (!order) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-char-950/80 backdrop-blur-md p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FDF5E6] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div ref={componentRef} className="p-12 overflow-y-auto flex-1">
                    <div className="text-center border-b-2 border-char-950/10 pb-8 mb-8">
                        <h2 className="font-display text-4xl font-black text-char-950">The Artisan Crust</h2>
                        <p className="text-sm font-bold text-char-950/40 uppercase tracking-[0.2em] mt-2">Official Order Receipt</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-char-950/30 mb-1">Customer</p>
                            <p className="font-display text-xl font-bold text-char-950">{order.user?.name || 'Guest'}</p>
                            <p className="text-sm text-char-950/60 italic">{order.user?.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-char-950/30 mb-1">Order Details</p>
                            <p className="font-bold text-char-950">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-char-950/40">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-4 border-y-2 border-dashed border-char-950/10 py-8 mb-8">
                        <div className="flex justify-between items-center">
                            <span className="font-display text-lg font-bold text-char-950">Base: {order.base?.name || 'Custom Base'}</span>
                            <span className="font-bold text-char-950/40">₹{order.base?.price || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-display text-lg font-bold text-char-950">Sauce: {order.sauce?.name || 'Signature Tomato'}</span>
                            <span className="font-bold text-char-950/40">₹{order.sauce?.price || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-display text-lg font-bold text-char-950">Cheese: {order.cheese?.name || 'Premium Mozzarella'}</span>
                            <span className="font-bold text-char-950/40">₹{order.cheese?.price || 0}</span>
                        </div>
                        {order.vegetables?.length > 0 && (
                            <div className="pt-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-char-950/30 mb-2">Toppings</p>
                                {order.vegetables.map(v => (
                                    <div key={v._id} className="flex justify-between items-center text-sm mb-1">
                                        <span className="font-medium text-char-950/70">{v.name}</span>
                                        <span className="font-bold text-char-950/30">₹{v.price || 0}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-char-950/5">
                            <span className="text-sm font-bold text-char-950/40 uppercase">Standard Preparation</span>
                            <span className="font-bold text-char-950/40">₹199</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-char-950/30 mb-1">Payment Status</p>
                            <span className="px-3 py-1 rounded-full bg-basil/10 text-basil text-[10px] font-black uppercase">PAID VIA RAZORPAY</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-char-950/40 uppercase mb-1">Total Amount</p>
                            <p className="font-display text-4xl font-black text-tomato">₹{order.totalAmount}</p>
                        </div>
                    </div>
                </div>

                <div
                    className="p-8 flex items-center justify-center gap-4 border-t border-char-950/10"
                    style={{
                        backgroundColor: '#FDF5E6',
                        backgroundImage: 'url("/assets/doodle-border.png")',
                        backgroundSize: '250px auto',
                    }}
                >
                    <button
                        onClick={handlePrint}
                        className="relative z-10 bg-char-950 text-white px-10 py-3 rounded-full font-display text-xs font-black uppercase tracking-widest hover:bg-tomato transition-all shadow-xl active:scale-95"
                    >
                        🖨️ Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="relative z-10 px-10 py-3 rounded-full bg-white/90 border-2 border-char-950/10 text-char-950 font-display text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-md active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', category: 'base', stock: 100, threshold: 20, price: 0 });
  const [toast, setToast] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchInventory = async () => {
    try {
        const { data } = await api.get('/inventory');
        setInventory(data);
    } catch (err) {
        console.error('Failed to fetch inventory:', err);
    }
  };

  const fetchOrders = async () => {
    try {
        const { data } = await api.get('/orders');
        setOrders(data);
    } catch (err) {
        console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem._id}`, editingItem);
        showToast(`${editingItem.name} updated successfully`);
      } else {
        await api.post('/inventory', newItem);
        showToast(`${newItem.name} added to collection`);
      }
      setShowModal(false);
      setEditingItem(null);
      setNewItem({ name: '', category: 'base', stock: 100, threshold: 20, price: 0 });
      fetchInventory();
    } catch (err) {
      console.error('Failed to save item:', err);
      showToast('Action failed — check connection');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
          await api.delete(`/inventory/${id}`);
          showToast('Item removed');
          fetchInventory();
      } catch (err) {
          console.error('Failed to delete:', err);
      }
    }
  };

  const updateStock = async (id, stock) => {
    try {
        await api.put(`/inventory/${id}`, { stock: Number(stock) });
        fetchInventory();
    } catch (err) {
        console.error('Failed to update stock:', err);
    }
  };

  const uploadImage = async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
        const { data } = await api.post(`/inventory/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.image) {
            showToast('Visual updated successfully!');
            fetchInventory();
        } else {
            showToast('Upload failed: No image URL returned');
        }
    } catch (err) {
        console.error('Upload failed:', err);
        const serverMsg = err.response?.data?.message;
        const detail = err.response?.data?.error;
        const fallback = err.message || 'Check your internet or Cloudinary config';

        const finalMsg = detail ? `${serverMsg}: ${detail}` : (serverMsg || fallback);
        showToast(`Upload failed: ${finalMsg.toUpperCase()}`);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
        await api.put(`/orders/${id}/status`, { status });
        showToast('Order status updated');
        fetchOrders();
    } catch (err) {
        console.error('Failed to update order status:', err);
    }
  };

  const clearAllOrders = async () => {
    if (window.confirm('WARNING: This will permanently delete ALL order history. Continue?')) {
        try {
            await api.delete('/orders');
            showToast('Order history cleared');
            fetchOrders();
        } catch (err) {
            console.error('Failed to clear orders:', err);
            showToast('Clear failed');
        }
    }
  };

  const deleteSingleOrder = async (id) => {
    if (window.confirm('Delete this specific order?')) {
        try {
            await api.delete(`/orders/${id}`);
            showToast('Order deleted');
            fetchOrders();
        } catch (err) {
            console.error('Failed to delete order:', err);
            showToast('Delete failed');
        }
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const lowStockCount = inventory.filter(i => i.stock < i.threshold).length;

  const categoryLabels = {
    base: 'Bases',
    sauce: 'Sauces',
    cheese: 'Cheeses',
    vegetable: 'Toppings'
  };

  return (
    <PageLayout title="Admin panel" width="5xl" isFloating>
      <AnimatePresence>
          {selectedReceipt && (
              <ReceiptModal order={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
          )}
      </AnimatePresence>

      {/* Stats Summary Section - Tinted Green */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
        {[
          { label: 'Total Orders', val: orders.length, color: 'text-tomato' },
          { label: 'Inventory Items', val: inventory.length, color: 'text-char-950' },
          { label: 'Low Stock Alerts', val: lowStockCount, color: lowStockCount > 0 ? 'text-tomato animate-pulse' : 'text-basil' },
        ].map(s => (
          <div key={s.label} className="bg-basil/10 border border-basil/20 p-8 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:bg-basil/20 group rounded-[40px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-char-950/40 mb-2">{s.label}</span>
            <span className={`text-4xl font-black ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 border-b-2 border-char-950/5 mb-10 pb-2">
        {['inventory', 'menu', 'orders'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-10 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-t-[32px] ${
              tab === t ? 'bg-tomato text-white shadow-lg' : 'text-char-950/40 hover:bg-tomato/5 hover:text-tomato'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'inventory' && (
        <div className="space-y-12">
          {/* Quick Jump Station - Professional Charcoal */}
          <div className="sticky top-[80px] z-20 -mx-6 md:-mx-12 mb-10 px-6 md:px-12 py-5 bg-char-800/95 backdrop-blur-md border-y border-char-950/10 flex items-center justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-char-950/60 mr-4">Select Station:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => document.getElementById(`section-${cat}`).scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="px-8 py-2.5 text-[11px] font-black uppercase tracking-widest bg-char-950 text-white rounded-full shadow-lg transition-all hover:bg-tomato active:scale-95"
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat} id={`section-${cat}`} className="p-10 bg-char-900/20 rounded-[48px] border border-char-950/5 shadow-sm scroll-mt-64">
              <div className="flex items-center justify-between mb-8 border-b-4 border-tomato/20 pb-4">
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-tomato">{categoryLabels[cat]}</h2>
                <button
                  onClick={() => { setNewItem({...newItem, category: cat}); setShowModal(true); }}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-char-950 text-white shadow-lg hover:bg-tomato transition-all"
                >
                  <span className="text-2xl font-bold">+</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {inventory
                  .filter((i) => i.category === cat)
                  .map((item) => {
                    const low = item.stock < item.threshold;
                    return (
                      <div
                        key={item._id}
                        className={`bg-char-800 overflow-hidden flex flex-col border-t-8 border-t-basil shadow-md rounded-[40px] transition-all hover:shadow-xl hover:-translate-y-1 ${low ? 'ring-4 ring-tomato/20' : 'border border-char-950/5'}`}
                      >
                        <div className="relative h-32 w-full bg-char-950/5 shrink-0">
                          {item.image ? (
                            <img
                              src={resolveImageUrl(item.image)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[12.5px] font-black uppercase tracking-[0.2em] text-char-950/40">
                              No Visual
                            </div>
                          )}
                          {low && (
                            <span className="absolute right-4 top-4 rounded-full bg-tomato px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                              Low stock
                            </span>
                          )}
                          <div className="absolute left-4 bottom-4 flex gap-2">
                             <button
                               onClick={() => { setEditingItem(item); setShowModal(true); }}
                               className="h-9 w-9 flex items-center justify-center rounded-full bg-char-950/90 text-white backdrop-blur-md hover:bg-tomato transition-all shadow-lg"
                             >
                               ✎
                             </button>
                             <button
                               onClick={() => deleteItem(item._id)}
                               className="h-9 w-9 flex items-center justify-center rounded-full bg-char-950/90 text-white backdrop-blur-md hover:bg-tomato transition-all shadow-lg"
                             >
                               ✕
                             </button>
                          </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                          <div className="flex-1">
                            <span className="font-display text-2xl font-black text-char-950 block mb-1 leading-tight">{item.name}</span>
                            <span className="text-[12.5px] font-black uppercase tracking-widest text-char-950/60">Price Tag: ₹{item.price}</span>

                            <div className="mt-8 flex flex-col gap-5">
                              <div>
                                  <label className="text-[12.5px] font-black uppercase tracking-widest text-char-950/70 mb-2 block">Inventory Level</label>
                                  <input
                                      type="number"
                                      defaultValue={item.stock}
                                      className="input-field w-full px-5 py-3 font-bold text-lg"
                                      onBlur={(e) => updateStock(item._id, e.target.value)}
                                  />
                              </div>
                            </div>
                          </div>
                          <label className="mt-8 flex items-center justify-center gap-3 rounded-full bg-tomato py-4 text-[11px] font-black uppercase tracking-widest text-white cursor-pointer hover:bg-tomato-dark shadow-xl transition-all active:scale-95">
                            {item.image ? 'Change Photo' : 'Upload Photo'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files[0] && uploadImage(item._id, e.target.files[0])}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'menu' && (
        <div className="p-10 bg-char-900/20 rounded-[48px] border border-char-950/5 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b-4 border-tomato/20 pb-4">
            <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-tomato">Menu Collection</h2>
                <p className="text-sm font-medium text-char-950/40 italic">Manage ready-to-order artisanal pizzas.</p>
            </div>
            <button
              onClick={() => { setEditingItem(null); setNewItem({ name: '', category: 'base', stock: 100, threshold: 20, price: 0 }); setShowModal(true); }}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-char-950 text-white shadow-lg hover:bg-tomato transition-all"
            >
              <span className="text-2xl font-bold">+</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {inventory.filter(i => i.category === 'base').map(item => (
              <div key={item._id} className="bg-char-800 rounded-[40px] overflow-hidden border-t-8 border-t-tomato shadow-md flex flex-col">
                <div className="relative h-48 w-full shrink-0">
                  <img src={resolveImageUrl(item.image)} className="h-full w-full object-cover" alt={item.name} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="h-9 w-9 flex items-center justify-center rounded-full bg-char-950/80 text-white hover:bg-tomato shadow-lg">✎</button>
                    <button onClick={() => deleteItem(item._id)} className="h-9 w-9 flex items-center justify-center rounded-full bg-char-950/80 text-white hover:bg-tomato shadow-lg">✕</button>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-black text-char-950 leading-[1.1]">{item.name}</h3>
                    <p className="text-[12.5px] font-black uppercase tracking-widest text-char-950/60 mt-3">Menu Price</p>
                    <p className="text-3xl font-black text-tomato mt-1">₹{item.price + 199}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-char-950 text-white px-10 py-5 rounded-full font-display text-sm font-black uppercase tracking-widest shadow-2xl border border-white/10"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Management Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-char-950/60 backdrop-blur-md p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden w-full max-w-lg p-12 rounded-[48px] shadow-2xl border border-char-950/10"
            style={{
              backgroundColor: 'rgba(253, 245, 230, 0.95)', // Warm Butter Honey with high opacity
              backgroundImage: 'url("/assets/doodle-border.png")',
              backgroundSize: '400px auto',
              backgroundBlendMode: 'soft-light'
            }}
          >
            <div className="relative z-10">
              <h3 className="font-display text-3xl font-black text-char-950 mb-8">
                {editingItem ? 'Modify Item' : 'New Collection Item'}
              </h3>
              <form onSubmit={handleSaveItem} className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-char-950/50 mb-2 block">Display Name</label>
                  <input
                    required
                    className="input-field w-full px-6 py-4 font-bold bg-white/50 border-char-950/5"
                    value={editingItem ? editingItem.name : newItem.name}
                    onChange={(e) => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-char-950/50 mb-2 block">Station</label>
                    <select
                      className="input-field w-full px-6 py-4 font-bold bg-white/50 border-char-950/5 border-r-8 border-transparent"
                      value={editingItem ? editingItem.category : newItem.category}
                      onChange={(e) => editingItem ? setEditingItem({...editingItem, category: e.target.value}) : setNewItem({...newItem, category: e.target.value})}
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-char-950/50 mb-2 block">Price (₹)</label>
                    <input
                      type="number"
                      className="input-field w-full px-6 py-4 font-bold bg-white/50 border-char-950/5"
                      value={editingItem ? editingItem.price : newItem.price}
                      onChange={(e) => editingItem ? setEditingItem({...editingItem, price: Number(e.target.value)}) : setNewItem({...newItem, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-char-950/50 mb-2 block">Initial Count</label>
                    <input
                      type="number"
                      className="input-field w-full px-6 py-4 font-bold bg-white/50 border-char-950/5"
                      value={editingItem ? editingItem.stock : newItem.stock}
                      onChange={(e) => editingItem ? setEditingItem({...editingItem, stock: Number(e.target.value)}) : setNewItem({...newItem, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-char-950/50 mb-2 block">Alert Level</label>
                    <input
                      type="number"
                      className="input-field w-full px-6 py-4 font-bold bg-white/50 border-char-950/5"
                      value={editingItem ? editingItem.threshold : newItem.threshold}
                      onChange={(e) => editingItem ? setEditingItem({...editingItem, threshold: Number(e.target.value)}) : setNewItem({...newItem, threshold: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="submit" className="btn-primary flex-1 py-4 text-sm uppercase tracking-widest shadow-ember">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-4 text-sm font-black uppercase tracking-widest text-char-950/40 hover:text-tomato transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8 bg-tomato/5 p-6 rounded-[32px] border border-tomato/10">
            <div>
                <h2 className="font-display text-2xl font-black text-char-950">Incoming Orders</h2>
                <p className="text-sm text-char-950/40 font-medium">Manage and track live customer orders.</p>
            </div>
            {orders.length > 0 && (
                <button
                    onClick={clearAllOrders}
                    className="px-6 py-3 rounded-full border-2 border-tomato/20 text-tomato text-xs font-black uppercase tracking-widest hover:bg-tomato hover:text-white transition-all shadow-sm active:scale-95"
                >
                    🗑️ Clear History
                </button>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-tomato/5 rounded-[40px]">
              <p className="font-display text-2xl font-bold text-char-950/20 italic">No incoming orders.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-char-900 rounded-[40px] p-8 shadow-sm border border-char-950/5 hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-tomato">Order #{order._id.slice(-6).toUpperCase()}</span>
                        <span className="h-1 w-1 rounded-full bg-char-950/20"></span>
                        <span className="text-xs font-bold text-char-950/30 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="font-display text-xl font-bold text-char-950">
                      {order.user?.name || 'Customer'} <span className="text-sm font-medium text-char-950/40 italic">({order.user?.email || 'No Email'})</span>
                    </p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-char-950/40 leading-relaxed">
                      {order.base?.name ? `Base: ${order.base.name}` : 'Custom Base'}
                      {order.sauce?.name ? ` · Sauce: ${order.sauce.name}` : ''}
                      {order.cheese?.name ? ` · Cheese: ${order.cheese.name}` : ''}
                      {order.vegetables?.length > 0 && ` · Toppings: ${order.vegetables.map(v => v.name).join(', ')}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4 min-w-[180px]">
                    <div className="flex items-center gap-3">
                        <span className="font-display text-2xl font-black text-char-950">₹{order.totalAmount}</span>
                        <button
                            onClick={() => deleteSingleOrder(order._id)}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-tomato/10 text-tomato hover:bg-tomato hover:text-white transition-all"
                            title="Delete Order"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedReceipt(order)}
                            className="px-6 py-2.5 rounded-full bg-char-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-tomato transition-all shadow-md"
                        >
                            View Receipt
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="bg-char-950/5 border-none outline-none rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest text-char-950 focus:ring-2 ring-tomato/20 cursor-pointer"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default AdminDashboard;
