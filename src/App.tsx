/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Utensils, MapPin, Phone, Clock, Facebook, Instagram, 
  ChevronRight, ShoppingCart, X, Send, Lock, User, 
  CreditCard, Smartphone, ClipboardList, LogOut
} from "lucide-react";

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
  { id: 1, name: "Pollo Frito", price: 150, category: "Pollo", description: "Pollo crujiente servido con acompañamientos.", image: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=400&auto=format&fit=crop" },
  { id: 2, name: "Pollo a la Plancha", price: 200, category: "Pollo", description: "Pechuga de pollo a la plancha, saludable y jugosa.", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop" },
  { id: 3, name: "Pollo Jalapeño", price: 200, category: "Pollo", description: "Pollo bañado en una deliciosa y picante salsa de jalapeño.", image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=400&auto=format&fit=crop" },
  { id: 4, name: "Pollo a la Barbacoa", price: 200, category: "Pollo", description: "Pollo asado con nuestra salsa barbacoa especial.", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=400&auto=format&fit=crop" },
  { id: 5, name: "Pollo Asado", price: 200, category: "Pollo", description: "Pollo asado a la leña con el sabor tradicional.", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=400&auto=format&fit=crop" },

  // Carnes y Pescados
  { id: 6, name: "Carne Asada", price: 200, category: "Carnes y Pescados", description: "Corte de res a la parrilla con sabor ahumado.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop" },
  { id: 7, name: "Carne en Salsa", price: 150, category: "Carnes y Pescados", description: "Trozos de carne suaves cocinados en salsa de la casa.", image: "https://images.unsplash.com/photo-1534939561122-3d290a01996a?q=80&w=400&auto=format&fit=crop" },
  { id: 8, name: "Pescado a la Plancha", price: 200, category: "Carnes y Pescados", description: "Filete de pescado fresco cocinado a la plancha.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop" },

  // Comidas Típicas
  { id: 9, name: "Quesillos", price: 100, category: "Comidas Típicas", description: "Tradicional quesillo con cebolla y crema.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop" },
  { id: 10, name: "Enchiladas", price: 100, category: "Comidas Típicas", description: "Tortilla rellena de arroz y carne, frita a la perfección.", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=400&auto=format&fit=crop" },
  { id: 11, name: "Tacos", price: 100, category: "Comidas Típicas", description: "Tacos fritos rellenos de carne desmenuzada.", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=400&auto=format&fit=crop" },
  { id: 12, name: "Tajadas con Queso", price: 80, category: "Comidas Típicas", description: "Tajadas de plátano verde fritas con queso.", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=400&auto=format&fit=crop" },
  { id: 13, name: "Maduro con Queso", price: 80, category: "Comidas Típicas", description: "Plátano maduro asado o frito con queso.", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=400&auto=format&fit=crop" },

  // Comida Rápida
  { id: 14, name: "Hot Dogs", price: 100, category: "Comida Rápida", description: "Salchicha premium con pan artesanal y salsas.", image: "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?q=80&w=400&auto=format&fit=crop" },
  { id: 15, name: "Hamburguesas", price: 160, category: "Comida Rápida", description: "Carne de res jugosa, queso y vegetales frescos.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop" },
  { id: 16, name: "Quesadillas", price: 150, category: "Comida Rápida", description: "Tortilla de harina con mezcla de quesos y carne.", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=400&auto=format&fit=crop" },
  { id: 17, name: "Burritos", price: 150, category: "Comida Rápida", description: "Relleno generoso de carne, frijoles y crema.", image: "https://images.unsplash.com/photo-1584031036380-3fb6f23c7166?q=80&w=400&auto=format&fit=crop" },
  { id: 18, name: "Pizza (Slice)", price: 50, category: "Comida Rápida", description: "Una porción de nuestra deliciosa pizza artesanal.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop" },

  // Refrescos
  { id: 19, name: "Refrescos Naturales", price: 40, category: "Bebidas", description: "Refrescos frescos hechos con frutas de temporada.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop" },
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

  const categories = ["Todos", ...Array.from(new Set(MENU_ITEMS.map(item => item.category)))];

  const filteredItems = activeCategory === "Todos" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem("tonagrill_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

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

  const handleOrder = () => {
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
      alert("Por favor completa todos los datos de envío.");
      return;
    }

    const orderItems = Object.entries(cart).map(([id, qty]) => {
      const item = MENU_ITEMS.find(m => m.id === Number(id))!;
      return { name: item.name, quantity: qty as number };
    });

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: deliveryInfo.name,
      phone: deliveryInfo.phone,
      address: deliveryInfo.address,
      items: orderItems,
      total: cartTotal,
      timestamp: Date.now(),
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem("tonagrill_orders", JSON.stringify(updatedOrders));

    // WhatsApp Redirection
    const message = `*Nueva Cita Agendada - Asado Toña Grill*%0A%0A` +
      `*Cliente:* ${deliveryInfo.name}%0A` +
      `*Teléfono:* ${deliveryInfo.phone}%0A` +
      `*Dirección:* ${deliveryInfo.address}%0A%0A` +
      `*Pedido:*%0A` +
      orderItems.map(i => `- ${i.name} x${i.quantity}`).join("%0A") +
      `%0A%0A*Total:* C$ ${cartTotal}%0A%0A` +
      `_Por favor confirmar pedido._`;

    window.open(`https://wa.me/50589835179?text=${message}`, "_blank");
    
    setCart({});
    setIsCartOpen(false);
    setDeliveryInfo({ name: "", phone: "", address: "" });
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
              <ClipboardList className="text-orange-600" /> Citas Agendadas
            </h2>
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-stone-200">
                <p className="text-stone-400">No hay citas agendadas aún.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{order.customerName}</h3>
                      <p className="text-sm text-stone-500">{new Date(order.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                      C$ {order.total}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-stone-700">Contacto:</p>
                      <p>{order.phone}</p>
                      <p className="mt-2 font-semibold text-stone-700">Dirección:</p>
                      <p>{order.address}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-700">Pedido:</p>
                      <ul className="list-disc list-inside">
                        {order.items.map((item, i) => (
                          <li key={i}>{item.name} x{item.quantity}</li>
                        ))}
                      </ul>
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
            <span className="font-bold text-xl tracking-tight text-stone-800">Asado Toña Grill</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-stone-600">
            <a href="#menu" className="hover:text-orange-600 transition-colors">Menú</a>
            <a href="#nosotros" className="hover:text-orange-600 transition-colors">Nosotros</a>
            <a href="#contacto" className="hover:text-orange-600 transition-colors">Contacto</a>
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
            Asado Toña Grill
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

      {/* Payment Gateway Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-stone-800 mb-4">Pasarela de Pago</h2>
          <p className="text-stone-500 mb-12">Aceptamos transferencias y pagos móviles para tu comodidad.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-orange-50 border border-orange-100">
              <Smartphone className="text-orange-600 mx-auto mb-4" size={32} />
              <h4 className="font-bold mb-2">Billetera Móvil</h4>
              <p className="text-2xl font-black text-stone-800">8983-5179</p>
              <p className="text-xs text-stone-500 mt-2">Bryan Cortez</p>
            </div>
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200">
              <CreditCard className="text-stone-600 mx-auto mb-4" size={32} />
              <h4 className="font-bold mb-2">BAC</h4>
              <p className="text-lg font-bold text-stone-800">222 345 2342 543</p>
              <p className="text-xs text-stone-500 mt-2">Cuenta Corriente</p>
            </div>
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200">
              <CreditCard className="text-stone-600 mx-auto mb-4" size={32} />
              <h4 className="font-bold mb-2">Lafise</h4>
              <p className="text-lg font-bold text-stone-800">13457826819</p>
              <p className="text-xs text-stone-500 mt-2">Cuenta de Ahorro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} />
            </div>
            <h4 className="font-bold text-stone-800 mb-2">Ubicación</h4>
            <p className="text-stone-500 text-sm">De la estatua de Montoya, 2c al sur. Managua, Nicaragua.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={24} />
            </div>
            <h4 className="font-bold text-stone-800 mb-2">Teléfono</h4>
            <p className="text-stone-500 text-sm">+505 8983-5179<br />+505 2222-2222</p>
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
                    Agendar Cita y Enviar <Send size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

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
                    placeholder="PIN de 4 dígitos" 
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
                    Cancelar
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
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-stone-100 py-12 border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <Utensils className="text-orange-600 w-5 h-5" />
              <span className="font-bold text-lg tracking-tight text-stone-800">Asado Toña Grill</span>
            </div>
            <p className="text-stone-500 text-sm text-center md:text-left">© 2026 Asado Toña Grill. Todos los derechos reservados.</p>
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
