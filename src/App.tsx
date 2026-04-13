/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Utensils, MapPin, Phone, Clock, Facebook, Instagram, 
  ChevronRight, ShoppingCart, X, Send, Lock, User, 
  CreditCard, Smartphone, ClipboardList, LogOut, MessageSquare,
  CreditCard as CardIcon, ShieldCheck
} from "lucide-react";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  Timestamp
} from "firebase/firestore";

// Types
interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number }[];
  total: number;
  timestamp: number;
}

const MENU_ITEMS: MenuItem[] = [
  // Pollo
  { id: 1, name: "Pollo Frito", price: 150, category: "Pollo", description: "Pollo crujiente servido con acompañamientos.", image: "https://picsum.photos/seed/friedchicken/400/300" },
  { id: 2, name: "Pollo a la Plancha", price: 200, category: "Pollo", description: "Pechuga de pollo a la plancha, saludable y jugosa.", image: "https://picsum.photos/seed/grilledchicken/400/300" },
  { id: 3, name: "Pollo Jalapeño", price: 200, category: "Pollo", description: "Pollo bañado en una deliciosa y picante salsa de jalapeño.", image: "https://picsum.photos/seed/jalapenochicken/400/300" },
  { id: 4, name: "Pollo a la Barbacoa", price: 200, category: "Pollo", description: "Pollo asado con nuestra salsa barbacoa especial.", image: "https://picsum.photos/seed/bbqchicken/400/300" },
  { id: 5, name: "Pollo Asado", price: 200, category: "Pollo", description: "Pollo asado a la leña con el sabor tradicional.", image: "https://picsum.photos/seed/roastchicken/400/300" },

  // Carnes y Pescados
  { id: 6, name: "Carne Asada", price: 200, category: "Carnes y Pescados", description: "Corte de res a la parrilla con sabor ahumado.", image: "https://picsum.photos/seed/steak/400/300" },
  { id: 7, name: "New York Asado", price: 350, category: "Carnes y Pescados", description: "Corte premium New York a la parrilla.", image: "https://picsum.photos/seed/newyorksteak/400/300" },
  { id: 8, name: "Corazón Asado", price: 180, category: "Carnes y Pescados", description: "Corazón de res marinado y asado al término perfecto.", image: "https://picsum.photos/seed/heartgrill/400/300" },
  { id: 9, name: "Carne en Salsa", price: 150, category: "Carnes y Pescados", description: "Trozos de carne suaves cocinados en salsa de la casa.", image: "https://picsum.photos/seed/meatstew/400/300" },
  { id: 10, name: "Pescado a la Plancha", price: 200, category: "Carnes y Pescados", description: "Filete de pescado fresco cocinado a la plancha.", image: "https://picsum.photos/seed/grilledfish/400/300" },

  // Comidas Típicas
  { id: 11, name: "Quesillos", price: 100, category: "Comidas Típicas", description: "Tradicional quesillo con cebolla y crema.", image: "https://picsum.photos/seed/quesillo/400/300" },
  { id: 12, name: "Enchiladas", price: 100, category: "Comidas Típicas", description: "Tortilla rellena de arroz y carne, frita a la perfección.", image: "https://picsum.photos/seed/enchilada/400/300" },
  { id: 13, name: "Tacos", price: 100, category: "Comidas Típicas", description: "Tacos fritos rellenos de carne desmenuzada.", image: "https://picsum.photos/seed/tacos/400/300" },
  { id: 14, name: "Tajadas con Queso", price: 80, category: "Comidas Típicas", description: "Tajadas de plátano verde fritas con queso.", image: "https://picsum.photos/seed/plantaincheese/400/300" },
  { id: 15, name: "Maduro con Queso", price: 80, category: "Comidas Típicas", description: "Plátano maduro asado o frito con queso.", image: "https://picsum.photos/seed/sweetplantain/400/300" },

  // Comida Rápida
  { id: 16, name: "Hot Dogs", price: 100, category: "Comida Rápida", description: "Salchicha premium con pan artesanal y salsas.", image: "https://picsum.photos/seed/hotdog/400/300" },
  { id: 17, name: "Hamburguesas", price: 160, category: "Comida Rápida", description: "Carne de res jugosa, queso y vegetales frescos.", image: "https://picsum.photos/seed/burger/400/300" },
  { id: 18, name: "Quesadillas", price: 150, category: "Comida Rápida", description: "Tortilla de harina con mezcla de quesos y carne.", image: "https://picsum.photos/seed/quesadilla/400/300" },
  { id: 19, name: "Burritos", price: 150, category: "Comida Rápida", description: "Relleno generoso de carne, frijoles y crema.", image: "https://picsum.photos/seed/burrito/400/300" },
  { id: 20, name: "Pizza (Slice)", price: 50, category: "Comida Rápida", description: "Una porción de nuestra deliciosa pizza artesanal.", image: "https://picsum.photos/seed/pizza/400/300" },

  // Bebidas
  { id: 21, name: "Coca Cola", price: 40, category: "Bebidas", description: "Refrescante bebida de cola clásica.", image: "https://picsum.photos/seed/cocacola/400/300" },
  { id: 22, name: "Pepsi Cola", price: 40, category: "Bebidas", description: "Sabor refrescante de Pepsi.", image: "https://picsum.photos/seed/pepsi/400/300" },
  { id: 23, name: "Guayaba", price: 40, category: "Bebidas", description: "Refresco natural de guayaba fresca.", image: "https://picsum.photos/seed/guava/400/300" },
  { id: 24, name: "Cacao", price: 40, category: "Bebidas", description: "Bebida tradicional de cacao con leche.", image: "https://picsum.photos/seed/cacao/400/300" },
  { id: 25, name: "Linaza", price: 40, category: "Bebidas", description: "Refresco saludable de linaza.", image: "https://picsum.photos/seed/linseed/400/300" },
  { id: 26, name: "Semilla de Jícaro", price: 40, category: "Bebidas", description: "Bebida típica de semilla de jícaro.", image: "https://picsum.photos/seed/jicaro/400/300" },
  { id: 27, name: "Atol", price: 40, category: "Bebidas", description: "Bebida caliente tradicional de maíz.", image: "https://picsum.photos/seed/atol/400/300" },
];

export default function App() {
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPartnerMode, setIsPartnerMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState({ name: "", phone: "", address: "" });
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  // Firebase Auth & Profile
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", phone: "", address: "" });

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ cardNumber: "", expiry: "", cvv: "", name: "" });

  // Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);

  const categories = ["Todos", ...Array.from(new Set(MENU_ITEMS.map(item => item.category)))];

  const filteredItems = activeCategory === "Todos" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
          setDeliveryInfo({
            name: docSnap.data().displayName || "",
            phone: docSnap.data().phoneNumber || "",
            address: docSnap.data().address || ""
          });
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load orders from Firestore
  useEffect(() => {
    if (!isLoggedIn) return;
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, [isLoggedIn]);

  // Chat Listener
  useEffect(() => {
    if (!activeOrderId) return;
    const q = query(collection(db, "orders", activeOrderId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeOrderId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeOrderId || !user) return;
    await addDoc(collection(db, "orders", activeOrderId, "messages"), {
      text: newMessage,
      senderId: user.uid,
      timestamp: Timestamp.now()
    });
    setNewMessage("");
  };

  const addToCart = (id: number) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id]--;
      else delete newCart[id];
      return newCart;
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = MENU_ITEMS.find(m => m.id === Number(id));
    return total + (item?.price || 0) * (qty as number);
  }, 0);

  const handleOrder = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!deliveryInfo.address || !deliveryInfo.phone) {
      alert("Por favor completa tus datos de perfil (dirección y teléfono).");
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const processPayment = async () => {
    const orderItems = Object.entries(cart).map(([id, qty]) => {
      const item = MENU_ITEMS.find(m => m.id === Number(id))!;
      return { name: item.name, quantity: qty as number, price: item.price };
    });

    const orderId = Math.random().toString(36).substr(2, 9);
    const newOrder = {
      customerId: user?.uid,
      customerName: userProfile?.displayName,
      phoneNumber: userProfile?.phoneNumber,
      address: userProfile?.address,
      items: orderItems,
      total: cartTotal,
      status: "pending",
      timestamp: Timestamp.now()
    };

    try {
      await setDoc(doc(db, "orders", orderId), newOrder);
      
      // WhatsApp Redirection with requested format
      const message = `Hola mi nombre es ${userProfile?.displayName} y mi pedido es:%0A` +
        orderItems.map(i => `- ${i.name} x${i.quantity} (C$ ${i.price * i.quantity})`).join("%0A") +
        `%0A%0A*Total:* C$ ${cartTotal}%0A%0A` +
        `*Dirección de entrega:* ${userProfile?.address}%0A` +
        `_Por favor confirmar pedido._`;

      window.open(`https://wa.me/50589835179?text=${message}`, "_blank");
      
      setCart({});
      setIsCartOpen(false);
      setIsPaymentModalOpen(false);
      alert("¡Pedido realizado con éxito!");
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName: authForm.name,
          email: authForm.email,
          phoneNumber: authForm.phone,
          address: authForm.address,
          role: "customer"
        });
      }
      setIsAuthModalOpen(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handlePartnerLogin = (e: FormEvent) => {
    e.preventDefault();
    if (pin === "4455") {
      setIsLoggedIn(true);
      setPin("");
    } else {
      alert("PIN incorrecto");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("¿Estás seguro de eliminar este pedido?")) return;
    try {
      await setDoc(doc(db, "orders", orderId), { ...orders.find(o => o.id === orderId), deleted: true }, { merge: true });
      alert("Pedido eliminado.");
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  if (!isAuthReady) return <div className="min-h-screen flex items-center justify-center bg-orange-50"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Utensils className="text-orange-600 w-12 h-12" /></motion.div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Utensils className="text-orange-600 w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-stone-800">Bienvenido</h2>
            <p className="text-stone-500">Inicia sesión para ver nuestro menú</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "register" && (
              <>
                <input type="text" placeholder="Nombre completo" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600" required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                <input type="tel" placeholder="Número de teléfono" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600" required value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} />
                <textarea placeholder="Dirección exacta" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600 h-24" required value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})} />
              </>
            )}
            <input type="email" placeholder="Correo electrónico" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">{authMode === "login" ? "Entrar" : "Registrarse"}</button>
            <p className="text-center text-sm text-stone-500">{authMode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} <button type="button" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} className="text-orange-600 font-bold hover:underline">{authMode === "login" ? "Regístrate aquí" : "Inicia sesión"}</button></p>
          </form>
        </motion.div>
      </div>
    );
  }

  if (isPartnerMode && isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-stone-800">Panel de Socios</h1>
              <p className="text-stone-500">Bienvenido, Bryan Cortez</p>
            </div>
            <button 
              onClick={() => { setIsLoggedIn(false); setIsPartnerMode(false); }}
              className="bg-stone-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-700 transition-all"
            >
              <LogOut size={18} /> Salir
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="text-orange-600" /> Pedidos en Tiempo Real
            </h2>
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-stone-200">
                <p className="text-stone-400">No hay pedidos aún.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{order.customerName}</h3>
                      <p className="text-sm text-stone-500">{order.timestamp?.toDate().toLocaleString()}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                      C$ {order.total}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="font-semibold text-stone-700">Contacto:</p>
                      <a href={`tel:${order.phoneNumber}`} className="text-orange-600 flex items-center gap-1 hover:underline">
                        <Phone size={14} /> {order.phoneNumber}
                      </a>
                      <p className="mt-2 font-semibold text-stone-700">Dirección:</p>
                      <p className="text-stone-600">{order.address}</p>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-1"
                      >
                        <MapPin size={14} /> Ver en Google Maps
                      </a>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-700">Pedido:</p>
                      <ul className="list-disc list-inside text-stone-600">
                        {order.items.map((item: any, i: number) => (
                          <li key={i}>{item.name} x{item.quantity}</li>
                        ))}
                      </ul>
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => { setActiveOrderId(order.id); setIsChatOpen(true); }}
                          className="flex-1 bg-stone-100 text-stone-700 py-2 rounded-xl font-bold hover:bg-stone-200 flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={16} /> Chat
                        </button>
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <X size={16} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 text-stone-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="text-orange-600 w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-stone-800">Doña Tola Grill</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-stone-600">
            <a href="#menu" className="hover:text-orange-600 transition-colors">Menú</a>
            <a href="#nosotros" className="hover:text-orange-600 transition-colors">Nosotros</a>
            <a href="#contacto" className="hover:text-orange-600 transition-colors">Contacto</a>
            {user ? (
              <button onClick={() => signOut(auth)} className="hover:text-orange-600 transition-colors flex items-center gap-1">
                <LogOut size={14} /> Salir
              </button>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-orange-600 transition-colors flex items-center gap-1">
                <User size={14} /> Ingresar
              </button>
            )}
            <button onClick={() => setIsPartnerMode(true)} className="hover:text-orange-600 transition-colors flex items-center gap-1">
              <Lock size={14} /> Socios
            </button>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-all shadow-sm"
          >
            <ShoppingCart size={20} />
            {Object.keys(cart).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-orange-600">
                {Object.values(cart).reduce((a, b) => (a as number) + (b as number), 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920&auto=format&fit=crop" 
            alt="Asado Grill" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <span className="text-orange-400 font-bold tracking-widest uppercase text-sm mb-4 block">Tradición que se saborea</span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
            Doña Tola Grill
          </h1>
          <p className="text-xl text-stone-200 max-w-2xl mx-auto mb-8 font-light">
            El sabor auténtico que conocías como <span className="italic font-normal">Fritanga Doña Tona</span>, ahora renovado con la mejor parrilla de la ciudad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#menu" className="bg-orange-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
              Ver Menú <ChevronRight size={20} />
            </a>
            <a href="#contacto" className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all">
              Ubicación
            </a>
          </div>
        </motion.div>
      </header>

      {/* Menu Section */}
      <section id="menu" className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-stone-800 mb-4">Nuestro Menú</h2>
          <div className="w-20 h-1.5 bg-orange-600 mx-auto rounded-full mb-8"></div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat 
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200" 
                    : "bg-white text-stone-600 hover:bg-orange-100 border border-orange-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-orange-50 flex flex-col"
            >
              <img src={item.image} alt={item.name} className="h-48 w-full object-cover" referrerPolicy="no-referrer" />
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-stone-800">{item.name}</h3>
                  <span className="text-orange-600 font-black">C$ {item.price}</span>
                </div>
                <p className="text-stone-500 text-xs leading-relaxed mb-4 flex-grow">{item.description}</p>
                <button 
                  onClick={() => addToCart(item.id)}
                  className="w-full bg-orange-50 text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  Agregar <ShoppingCart size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 bg-stone-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black mb-6 text-orange-500">Nuestra Historia</h2>
            <p className="text-stone-400 mb-6 leading-relaxed text-lg">
              La historia del negocio comenzó con una idea de mi tía, ya que por el lugar donde estamos no había un lugar donde vendieran comida. Ahí es donde decidimos crear este restaurante.
            </p>
            <div className="bg-white/5 p-6 rounded-2xl border-l-4 border-orange-600 mb-8">
              <p className="text-white font-medium italic mb-2">El Bryan:</p>
              <p className="text-stone-300 leading-relaxed">
                "A mí me apasiona lo que es la cocina y pues vi un buen momento para ganar plata y así demostrar mi talento."
              </p>
              <p className="text-orange-500 font-bold mt-4 text-sm">— Bryan Cortez</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-orange-500">15+</div>
                <div className="text-xs uppercase tracking-widest text-stone-500">Años de Sabor</div>
              </div>
              <div className="text-center border-l border-stone-800 pl-6">
                <div className="text-3xl font-black text-orange-500">100%</div>
                <div className="text-xs uppercase tracking-widest text-stone-500">Artesanal</div>
              </div>
            </div>
          </motion.div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop" 
              alt="Grill Master" 
              className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Payment Gateway Section - REMOVED SENSITIVE DATA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-stone-800 mb-4">Pagos Seguros</h2>
          <p className="text-stone-500 mb-12">Utilizamos tecnología de encriptación para proteger tus transacciones.</p>
          
          <div className="flex justify-center gap-8 items-center opacity-50 grayscale">
            <CardIcon size={48} />
            <ShieldCheck size={48} />
            <Smartphone size={48} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-stone-800">Visítanos en el Restaurante</h2>
          <p className="text-stone-500 mt-2">Nuestra ubicación física para que disfrutes del mejor sabor.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} />
            </div>
            <h4 className="font-bold text-stone-800 mb-2">Dirección del Local</h4>
            <p className="text-stone-500 text-sm font-bold">De la estatua de Montoya, 2c al sur. Managua, Nicaragua.</p>
            <p className="text-xs text-orange-600 mt-2 italic">*Esta es la dirección de nuestro restaurante, no de su casa.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={24} />
            </div>
            <h4 className="font-bold text-stone-800 mb-2">WhatsApp Restaurante</h4>
            <p className="text-stone-500 text-sm">+505 8983-5179</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={24} />
            </div>
            <h4 className="font-bold text-stone-800 mb-2">Horarios</h4>
            <p className="text-stone-500 text-sm">Lun - Sáb: 11:00 AM - 10:00 PM<br />Dom: 11:00 AM - 6:00 PM</p>
          </div>
        </div>
      </section>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end"
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <ShoppingCart className="text-orange-600" /> Tu Pedido
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {Object.keys(cart).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-stone-400">Tu carrito está vacío.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {Object.entries(cart).map(([id, qty]) => {
                        const item = MENU_ITEMS.find(m => m.id === Number(id))!;
                        return (
                          <div key={id} className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl">
                            <div>
                              <h4 className="font-bold">{item.name}</h4>
                              <p className="text-sm text-stone-500">C$ {item.price} x {qty}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-200">-</button>
                              <span className="font-bold">{qty}</span>
                              <button onClick={() => addToCart(item.id)} className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-200">+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-6 border-t space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <MapPin className="text-orange-600" size={18} /> Datos de Envío
                      </h3>
                      <input 
                        type="text" 
                        placeholder="Nombre completo" 
                        className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600 transition-all"
                        value={deliveryInfo.name}
                        onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                      />
                      <input 
                        type="tel" 
                        placeholder="Número de teléfono" 
                        className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600 transition-all"
                        value={deliveryInfo.phone}
                        onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                      />
                      <textarea 
                        placeholder="Dirección exacta para el delivery" 
                        className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600 transition-all h-24"
                        value={deliveryInfo.address}
                        onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                      />
                    </div>
                  </>
                )}
              </div>

              {Object.keys(cart).length > 0 && (
                <div className="p-6 border-t bg-stone-50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-stone-500 font-medium">Total a pagar:</span>
                    <span className="text-2xl font-black text-orange-600">C$ {cartTotal}</span>
                  </div>
                  <button 
                    onClick={handleOrder}
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                  >
                    Continuar al Pago <CreditCard size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Auth Modal */}
        {isAuthModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-stone-800">
                  {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                </h2>
                <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === "register" && (
                  <>
                    <input 
                      type="text" 
                      placeholder="Nombre completo" 
                      className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600"
                      required
                      value={authForm.name}
                      onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    />
                    <input 
                      type="tel" 
                      placeholder="Número de teléfono" 
                      className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600"
                      required
                      value={authForm.phone}
                      onChange={e => setAuthForm({...authForm, phone: e.target.value})}
                    />
                    <textarea 
                      placeholder="Dirección exacta" 
                      className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600 h-24"
                      required
                      value={authForm.address}
                      onChange={e => setAuthForm({...authForm, address: e.target.value})}
                    />
                  </>
                )}
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600"
                  required
                  value={authForm.email}
                  onChange={e => setAuthForm({...authForm, email: e.target.value})}
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600"
                  required
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                />
                
                <button 
                  type="submit"
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                >
                  {authMode === "login" ? "Entrar" : "Registrarse"}
                </button>

                <p className="text-center text-sm text-stone-500">
                  {authMode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                    className="text-orange-600 font-bold hover:underline"
                  >
                    {authMode === "login" ? "Regístrate aquí" : "Inicia sesión"}
                  </button>
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Google Play Style Billing Modal */}
        {isPaymentModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b flex items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" className="w-6 h-6" alt="Google Play" />
                <h2 className="text-xl font-medium text-stone-700">Google Play Billing</h2>
              </div>
              
              <div className="p-6 bg-stone-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-stone-600">Total a pagar</span>
                  <span className="text-xl font-bold">C$ {cartTotal}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-3 mb-6">
                  <div className="w-10 h-6 bg-stone-800 rounded flex items-center justify-center text-[10px] text-white font-bold">VISA</div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">Visa •••• {paymentForm.cardNumber.slice(-4) || "4242"}</p>
                    <p className="text-xs text-stone-500">{user?.email}</p>
                  </div>
                  <ChevronRight size={20} className="text-stone-400" />
                </div>
                
                <div className="space-y-4 mb-6">
                  <input type="text" placeholder="Número de tarjeta" className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={paymentForm.cardNumber} onChange={e => setPaymentForm({...paymentForm, cardNumber: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={paymentForm.expiry} onChange={e => setPaymentForm({...paymentForm, expiry: e.target.value})} />
                    <input type="text" placeholder="CVV" className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={paymentForm.cvv} onChange={e => setPaymentForm({...paymentForm, cvv: e.target.value})} />
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 mb-6">
                  Al tocar "Comprar", aceptas las Condiciones de servicio de Google Payments. Consulta el Aviso de privacidad para saber cómo se tratan tus datos.
                </p>

                <div className="flex gap-3">
                  <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 font-medium text-stone-500 hover:bg-stone-100 rounded-lg transition-all">Cancelar</button>
                  <button onClick={processPayment} className="flex-1 bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition-all shadow-md">Comprar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Partner Login Modal */}
        {isPartnerMode && !isLoggedIn && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} />
                </div>
                <h2 className="text-2xl font-black text-stone-800">Acceso Socios</h2>
                <p className="text-stone-500">Ingresa tu PIN de seguridad</p>
              </div>

              <form onSubmit={handlePartnerLogin} className="space-y-6">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <input 
                    type="password" 
                    placeholder="PIN" 
                    maxLength={4}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-stone-100 border-none focus:ring-2 focus:ring-orange-600 text-center text-2xl tracking-[1em] font-black"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsPartnerMode(false)}
                    className="flex-1 py-4 font-bold text-stone-500 hover:bg-stone-100 rounded-2xl transition-all"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Chat Modal */}
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-md h-[600px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 bg-orange-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">Chat con Repartidor</h3>
                    <p className="text-xs text-orange-100">Pedido #{activeOrderId?.substr(0, 5)}</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-stone-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                      msg.senderId === user?.uid 
                        ? "bg-orange-600 text-white rounded-tr-none" 
                        : "bg-white text-stone-800 shadow-sm rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t flex gap-2">
                <input 
                  type="text" 
                  placeholder="Escribe un mensaje..." 
                  className="flex-grow p-4 rounded-xl bg-stone-100 border-none focus:ring-2 focus:ring-orange-600"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && sendMessage()}
                />
                <button 
                  onClick={sendMessage}
                  className="bg-orange-600 text-white p-4 rounded-xl hover:bg-orange-700 transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-stone-100 py-12 border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <Utensils className="text-orange-600 w-5 h-5" />
              <span className="font-bold text-lg tracking-tight text-stone-800">Doña Tola Grill</span>
            </div>
            <p className="text-stone-500 text-sm text-center md:text-left">© 2026 Doña Tola Grill. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-stone-400 hover:text-orange-600 transition-colors"><Facebook size={24} /></a>
            <a href="#" className="text-stone-400 hover:text-orange-600 transition-colors"><Instagram size={24} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
