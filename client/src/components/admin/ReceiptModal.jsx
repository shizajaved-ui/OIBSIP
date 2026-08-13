import { useRef } from 'react';
import { motion } from 'framer-motion';

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
                className="bg-[#FDF5E6] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative border-t-8 border-basil"
            >
                {/* Top Right Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-char-950/5 text-char-950/40 hover:bg-tomato hover:text-white transition-all shadow-inner"
                >
                    ✕
                </button>
                <div ref={componentRef} className="p-8 overflow-y-auto flex-1">
                    <div className="text-center border-b-2 border-char-950/10 pb-6 mb-6">
                        <h2 className="font-display text-3xl font-black text-char-950">The Artisan Crust</h2>
                        <p className="text-[10px] font-bold text-char-950/40 uppercase tracking-[0.2em] mt-1">Official Order Receipt</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-char-950/30 mb-1">Customer</p>
                            <p className="font-display text-lg font-bold text-char-950">{order.user?.name || 'Guest'}</p>
                            <p className="text-xs text-char-950/60 italic">{order.user?.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-char-950/30 mb-1">Order Details</p>
                            <p className="font-bold text-char-950">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-char-950/40">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-3 border-y-2 border-dashed border-char-950/10 py-6 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-display text-base font-bold text-char-950">Quantity</span>
                            <span className="font-bold text-char-950/40">{order.quantity || 1}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-display text-base font-bold text-char-950">Thickness: {order.thickness?.name || 'Standard'}</span>
                            <span className="font-bold text-char-950/40">₹{order.thickness?.price || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-display text-base font-bold text-char-950">Size: {order.size?.name || 'Regular'}</span>
                            <span className="font-bold text-char-950/40">₹{order.size?.price || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-display text-base font-bold text-char-950">Base: {order.base?.name || 'Custom Base'}</span>
                            <span className="font-bold text-char-950/40">₹{order.base?.price || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-display text-base font-bold text-char-950">Sauce: {order.sauce?.name || 'Signature Tomato'}</span>
                            <span className="font-bold text-char-950/40">₹{order.sauce?.price || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-display text-base font-bold text-char-950">Cheese: {order.cheese?.name || 'Premium Mozzarella'}</span>
                            <span className="font-bold text-char-950/40">₹{order.cheese?.price || 0}</span>
                        </div>
                        {order.vegetables?.length > 0 && (
                            <div className="pt-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-char-950/30 mb-1.5 border-b border-char-950/5 pb-0.5">Toppings</p>
                                {order.vegetables.map(v => (
                                    <div key={v._id} className="flex justify-between items-center text-xs mb-0.5">
                                        <span className="font-medium text-char-950/70">{v.name}</span>
                                        <span className="font-bold text-char-950/30">₹{v.price || 0}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-char-950/5">
                            <span className="text-xs font-bold text-char-950/40 uppercase">Standard Preparation</span>
                            <span className="font-bold text-char-950/40">₹199</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-char-950/30 mb-1">Payment Status</p>
                            <span className="px-3 py-1 rounded-full bg-basil/10 text-basil text-[9px] font-black uppercase">PAID VIA RAZORPAY</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-char-950/40 uppercase mb-0.5">Total Amount</p>
                            <p className="font-display text-3xl font-black text-tomato">₹{order.totalAmount}</p>
                        </div>
                    </div>
                </div>

                <div
                    className="p-6 flex items-center justify-center gap-4 border-t border-char-950/10"
                    style={{
                        backgroundColor: '#FDF5E6',
                        backgroundImage: 'url("/assets/doodle-border.png")',
                        backgroundSize: '250px auto',
                    }}
                >
                    <button
                        onClick={handlePrint}
                        className="relative z-10 bg-char-950 text-white px-8 py-3 rounded-full font-display text-xs font-black uppercase tracking-widest hover:bg-tomato transition-all shadow-xl active:scale-95"
                    >
                        🖨️ Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="relative z-10 px-8 py-3 rounded-full bg-white/90 border-2 border-char-950/10 text-char-950 font-display text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-md active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ReceiptModal;
