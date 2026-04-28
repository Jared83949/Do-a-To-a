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
  User as FirebaseUser,
  sendPasswordResetEmail,
  confirmPasswordReset
} from "firebase/auth";
import { GoogleGenAI, Type } from "@google/genai";
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
  { id: 1, name: "Pollo Frito", price: 150, category: "Pollo", description: "Pollo crujiente servido con acompañamientos.", image: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=600&auto=format&fit=crop" },
  { id: 2, name: "Pollo a la Plancha", price: 200, category: "Pollo", description: "Pechuga de pollo a la plancha, saludable y jugosa.", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop" },
  { id: 3, name: "Pollo Jalapeño", price: 200, category: "Pollo", description: "Pollo bañado en una deliciosa y picante salsa de jalapeño.", image: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=600&auto=format&fit=crop" },
  { id: 4, name: "Pollo a la Barbacoa", price: 200, category: "Pollo", description: "Pollo asado con nuestra salsa barbacoa especial.", image: "https://images.unsplash.com/photo-1524339939944-1360b24724e7?q=80&w=600&auto=format&fit=crop" },
  { id: 5, name: "Pollo Asado", price: 200, category: "Pollo", description: "Pollo asado a la leña con el sabor tradicional.", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=600&auto=format&fit=crop" },

  // Carnes y Pescados
  { id: 6, name: "Carne Asada", price: 200, category: "Carnes y Pescados", description: "Corte de res a la parrilla con sabor ahumado.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop" },
  { id: 7, name: "New York Asado", price: 350, category: "Carnes y Pescados", description: "Corte premium New York a la parrilla.", image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=600&auto=format&fit=crop" },
  { id: 8, name: "Corazón Asado", price: 180, category: "Carnes y Pescados", description: "Corazón de res marinado y asado al término perfecto.", image: "https://images.unsplash.com/photo-1529692236671-f1f6e9460272?q=80&w=600&auto=format&fit=crop" },
  { id: 9, name: "Carne en Salsa", price: 150, category: "Carnes y Pescados", description: "Trozos de carne suaves cocinados en salsa de la casa.", image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=600&auto=format&fit=crop" },
  { id: 10, name: "Pescado a la Plancha", price: 200, category: "Carnes y Pescados", description: "Filete de pescado fresco cocinado a la plancha.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop" },

  // Comidas Típicas
  { id: 11, name: "Quesillos", price: 100, category: "Comidas Típicas", description: "Tradicional quesillo con cebolla y crema.", image: "https://images.unsplash.com/photo-1628102422208-1647a837f40e?q=80&w=600&auto=format&fit=crop" },
  { id: 12, name: "Enchiladas", price: 100, category: "Comidas Típicas", description: "Tortilla rellena de arroz y carne, frita a la perfección.", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&auto=format&fit=crop" },
  { id: 13, name: "Tacos", price: 100, category: "Comidas Típicas", description: "Tacos fritos rellenos de carne desmenuzada.", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop" },
  { id: 14, name: "Tajadas con Queso", price: 80, category: "Comidas Típicas", description: "Tajadas de plátano verde fritas con queso.", image: "https://images.unsplash.com/photo-1541535881962-3bb380b08458?q=80&w=600&auto=format&fit=crop" },
  { id: 15, name: "Maduro con Queso", price: 80, category: "Comidas Típicas", description: "Plátano maduro asado o frito con queso.", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop" },

  // Comida Rápida
  { id: 16, name: "Hot Dogs", price: 100, category: "Comida Rápida", description: "Salchicha premium con pan artesanal y salsas.", image: "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?q=80&w=600&auto=format&fit=crop" },
  { id: 17, name: "Hamburguesas", price: 160, category: "Comida Rápida", description: "Carne de res jugosa, queso y vegetales frescos.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
  { id: 18, name: "Quesadillas", price: 150, category: "Comida Rápida", description: "Tortilla de harina con mezcla de quesos y carne.", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=600&auto=format&fit=crop" },
  { id: 19, name: "Burritos", price: 150, category: "Comida Rápida", description: "Relleno generoso de carne, frijoles y crema.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600&auto=format&fit=crop" },
  { id: 20, name: "Pizza (Slice)", price: 50, category: "Comida Rápida", description: "Una porción de nuestra deliciosa pizza artesanal.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },

  // Bebidas
  { id: 21, name: "Coca Cola", price: 40, category: "Bebidas", description: "Refrescante bebida de cola clásica.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop" },
  { id: 22, name: "Pepsi Cola", price: 40, category: "Bebidas", description: "Sabor refrescante de Pepsi.", image: "https://images.unsplash.com/photo-1546695259-ad30ff3fd643?q=80&w=600&auto=format&fit=crop" },
  { id: 23, name: "Guayaba", price: 40, category: "Bebidas", description: "Refresco natural de guayaba fresca.", image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=600&auto=format&fit=crop" },
  { id: 24, name: "Cacao", price: 40, category: "Bebidas", description: "Bebida tradicional de cacao con leche.", image: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=600&auto=format&fit=crop" },
  { id: 25, name: "Linaza", price: 40, category: "Bebidas", description: "Refresco saludable de linaza.", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop" },
  { id: 26, name: "Semilla de Jícaro", price: 40, category: "Bebidas", description: "Bebida típica de semilla de jícaro.", image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?q=80&w=600&auto=format&fit=crop" },
  { id: 27, name: "Atol", price: 40, category: "Bebidas", description: "Bebida caliente tradicional de maíz.", image: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=600&auto=format&fit=crop" },
];

export default function App() {
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({ name: "", phone: "", address: "" });
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  // Firebase Auth & Profile
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">("login");
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", phone: "", address: "" });

    

  // Gemini Initialization
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Detect Password Reset Code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    if (mode === 'resetPassword' && oobCode) {
      setResetCode(oobCode);
      setAuthMode("reset");
      setIsAuthModalOpen(true);
    }
  }, []);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ cardNumber: "", expiry: "", cvv: "", name: "" });

  // Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const categories = ["Todos", ...Array.from(new Set(MENU_ITEMS.map(item => item.category)))];

  const filteredItems = activeCategory === "Todos" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  // Auth Listener
  useEffect(() => {
    // Aggressive timeout to prevent getting stuck on loading screen
    const timeout = setTimeout(() => {
      setIsAuthReady(true);
    }, 1500); 

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data();
          setUserProfile(profile);
          setDeliveryInfo({
            name: profile.displayName || "",
            phone: profile.phoneNumber || "",
            address: profile.address || ""
          });
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
      clearTimeout(timeout);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Order Listener
  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }
    const q = query(
      collection(db, "orders"), 
      where("customerId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserOrders(ordersData);
    });
    return () => unsubscribe();
  }, [user]);

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
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      const orderId = docRef.id;
      
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

  // AI Error Supervisor
  const getAIErrorMessage = async (errorCode: string, context: string) => {
    try {
      const prompt = `Eres el Auditor de Seguridad IA de 'Doña Toña', con la personalidad de Rick V1 (directo, analítico, un poco frío pero eficiente).
      Un usuario ha fallado en una operación de Firebase.
      Error: ${errorCode}
      Contexto: ${context} (login, registro, recuperación).
      
      Instrucciones:
      1. Explica qué significa el error sin usar el código técnico.
      2. Si el error es 'auth/invalid-credential', explica que el correo o la contraseña no coinciden con nuestros registros, o que la cuenta no existe.
      3. Sé autoritario pero útil.
      4. Si es un error de red, indícale que su conexión es inestable.
      5. Responde ÚNICAMENTE con el mensaje de error procesado, estilo Rick V1.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      return result.text || "La IA ha detectado una anomalía. Acceso denegado.";
    } catch (e) {
      console.error("AI Error helper failure:", e);
      return "Fallo en el enlace con el Auditor IA. Verifica tus credenciales manualmente.";
    }
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    const email = authForm.email.trim();
    const password = authForm.password;
    
    if (authLoading) return;
    if (!email || !password) {
      setAuthError("Email y contraseña son obligatorios.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setIsAuthModalOpen(false);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName: authForm.name || "Usuario",
          email: email,
          phoneNumber: authForm.phone,
          address: authForm.address,
          role: "customer",
          createdAt: Timestamp.now(),
          verified: true 
        });
        setIsAuthModalOpen(false);
      }
    } catch (error: any) {
      console.error("Auth error code:", error.code);
      setAuthError("IA analizando brecha de seguridad...");
      const aiMessage = await getAIErrorMessage(error.code, authMode);
      setAuthError(aiMessage);
    } finally {
      setAuthLoading(false);
    }
  };


  const handleResetPassword = async () => {
    const email = authForm.email.trim();
    if (!email) {
      setAuthError("Escribe tu correo arriba para recibir el enlace de recuperación.");
      return;
    }
    
    setAuthLoading(true);
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthError("✅ Enlace de recuperación enviado. Revisa tu correo electrónico.");
    } catch (error: any) {
      console.error("Reset error code:", error.code);
      setAuthError("Fallo al enviar correo de recuperación.");
      const aiMessage = await getAIErrorMessage(error.code, "recuperación de contraseña");
      setAuthError(aiMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleConfirmReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetCode) return;
    if (newPassword.length < 6) {
      setAuthError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      await confirmPasswordReset(auth, resetCode, newPassword);
      setAuthError("✅ ¡Contraseña actualizada por IA! Ya puedes iniciar sesión.");
      setAuthMode("login");
      setResetCode(null);
      // Limpiar URL
      window.history.replaceState({}, document.title, "/");
    } catch (error: any) {
      console.error("Confirm reset error:", error.code);
      const aiMessage = await getAIErrorMessage(error.code, "confirmar nueva contraseña");
      setAuthError(aiMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("¿Deseas eliminar este pedido del historial?")) return;
    try {
      await setDoc(doc(db, "orders", orderId), { deleted: true }, { merge: true });
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("No se pudo eliminar el pedido.");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-orange-600 text-white rounded-3xl flex items-center justify-center shadow-2xl mb-6"
        >
          <Utensils size={40} />
        </motion.div>
        <p className="text-orange-900 font-black animate-pulse">Cargando Doña Toña...</p>
      </div>
    );
  }

  if (!user && authMode !== "reset") {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="text-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
              <Utensils className="text-white w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-stone-800">Doña Toña</h2>
            <p className="text-stone-500 font-medium mt-2">Tradición y Sabor en tu mesa</p>
            <div className="w-12 h-1 bg-orange-600 mx-auto mt-4 rounded-full"></div>
          </div>
          
          {authMode === "reset" ? (
            <form onSubmit={handleConfirmReset} className="space-y-4 relative z-10">
              {authError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold">{authError}</div>
              )}
              <p className="text-sm text-stone-500 mb-4">Estás restableciendo tu contraseña.</p>
              <input 
                type="password" 
                placeholder="Nueva Contraseña" 
                className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button 
                type="submit"
                disabled={authLoading}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg"
              >
                {authLoading ? "Cargando..." : "Guardar Contraseña"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2"
                >
                  <div className="bg-red-600 text-white p-1 rounded-full"><X size={12} /></div>
                  {authError}
                </motion.div>
              )}
              {authMode === "register" && (
                <>
                  <input type="text" placeholder="Nombre completo" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600" required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                  <input type="tel" placeholder="Número de teléfono" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600" required value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} />
                  <textarea placeholder="Dirección exacta" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600 h-24" required value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})} />
                </>
              )}
              <input type="email" placeholder="Correo electrónico" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
              <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              
              {authMode === "login" && (
                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={handleResetPassword}
                    className="text-xs text-orange-600 font-bold hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading}
                className={`w-full bg-orange-600 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 ${authLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-700"}`}
              >
                {authLoading ? "Procesando..." : (authMode === "login" ? "Entrar" : "Registrarse")}
              </button>
              <p className="text-center text-sm text-stone-500">{authMode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(null); }} className="text-orange-600 font-bold hover:underline">{authMode === "login" ? "Regístrate aquí" : "Inicia sesión"}</button></p>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-stone-100 text-center relative z-10">
            <p className="text-xs text-stone-400">© 2026 Doña Toña. Reservados todos los derechos.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 text-stone-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Utensils className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tighter text-stone-800 block leading-none">Doña Toña</span>
                <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">Grill & Sabor</span>
              </div>
            </div>
            <div className="hidden md:flex gap-8 text-sm font-bold text-stone-600 uppercase tracking-wide">
              <a href="#menu" className="hover:text-orange-600 transition-colors">Menú</a>
              {user && (
                <button 
                  onClick={() => setShowHistory(true)}
                  className="hover:text-orange-600 transition-colors flex items-center gap-1"
                >
                   Pedidos
                </button>
              )}
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
      <header className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1529692236671-f1f6e9460272?q=80&w=2000&auto=format&fit=crop" 
            alt="Asado Grill" 
            className="w-full h-full object-cover brightness-40 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-900/40 to-stone-900"></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-4"
        >
          <motion.span 
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.2em" }}
            className="text-orange-500 font-black uppercase text-xs tracking-[0.2em] mb-4 block"
          >
            Nicaragua en cada bocado
          </motion.span>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl">
            Doña Toña
          </h1>
          <p className="text-xl text-stone-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Desde 1998, el punto de encuentro para los amantes del <span className="font-bold text-orange-500">asado auténtico</span> y la tradición nicaragüense.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#menu" className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-white hover:text-orange-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-950/40 group">
              Explorar Menú <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-[2px] h-10 bg-white/50 rounded-full"></div>
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">Deslizar</span>
        </div>
      </header>

      {/* Services Section */}
      <section id="servicios" className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-stone-900 mb-4 tracking-tighter">Nuestros Servicios</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Más que comida, brindamos una experiencia completa de sabor y comodidad.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Reparto a Domicilio", 
                desc: "Llevamos el calor de la brasa directo a tu puerta con empaques térmicos.",
                img: "https://images.unsplash.com/photo-1526367790999-01507244b293?q=80&w=800&auto=format&fit=crop"
              },
              { 
                title: "Catering para Eventos", 
                desc: "Hacemos de tus celebraciones un banquete inolvidable para todos tus invitados.",
                img: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop"
              },
              { 
                title: "Pedido en Línea", 
                desc: "Ordena rápido desde nuestra plataforma y retira en local sin esperas.",
                img: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?q=80&w=800&auto=format&fit=crop"
              }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group cursor-default"
              >
                <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6 shadow-xl shadow-stone-200">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/0 transition-colors"></div>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{service.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          {user && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-orange-600 font-bold mb-2"
            >
              ¡Hola, {userProfile?.displayName || "Cliente"}! ¿Qué vas a pedir hoy?
            </motion.p>
          )}
          <h2 className="text-5xl font-black text-stone-800 mb-4">Nuestro Menú</h2>
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
          {filteredItems.map((item, index) => (
            <motion.div 
              key={`${item.id}-${index}`}
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
              src="https://images.unsplash.com/photo-1551135049-8a33b5883817?q=80&w=1000&auto=format&fit=crop" 
              alt="Grill Action" 
              className="rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500"
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
                      {Object.entries(cart).map(([id, qty], index) => {
                        const item = MENU_ITEMS.find(m => m.id === Number(id))!;
                        return (
                          <div key={`cart-${id}-${index}`} className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl">
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

        {/* Auth Modal Inside App */}
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
                  {authMode === "login" ? "Iniciar Sesión" : authMode === "register" ? "Crear Cuenta" : "Nueva Contraseña"}
                </h2>
                <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              {authMode === "reset" ? (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  {authError && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${authError.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                    >
                      {authError.startsWith('✅') ? <Send size={16} /> : <div className="bg-red-600 text-white p-1 rounded-full"><X size={12} /></div>}
                      {authError}
                    </motion.div>
                  )}
                  <div className="bg-orange-50 p-4 rounded-xl text-stone-600 text-sm mb-4">
                    Estás restableciendo tu contraseña. Escribe una nueva abajo.
                  </div>
                  <input 
                    type="password" 
                    placeholder="Nueva Contraseña (mín. 6 caracteres)" 
                    className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-600"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={authLoading}
                    className={`w-full bg-orange-600 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 ${authLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-700"}`}
                  >
                    {authLoading ? "Actualizando..." : "Guardar Nueva Contraseña"}
                  </button>
                  <button type="button" onClick={() => setAuthMode("login")} className="w-full text-stone-500 font-bold hover:text-stone-800 transition-colors">
                    Volver al Inicio
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAuth} className="space-y-4">
                  {authError && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${authError.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                    >
                      {authError.startsWith('✅') ? <Send size={16} /> : <div className="bg-red-600 text-white p-1 rounded-full"><X size={12} /></div>}
                      {authError}
                    </motion.div>
                  )}
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
                  
                  {authMode === "login" && (
                    <div className="text-right">
                      <button 
                        type="button" 
                        onClick={handleResetPassword}
                        className="text-xs text-orange-600 font-bold hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={authLoading}
                    className={`w-full bg-orange-600 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 ${authLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-700"}`}
                  >
                    {authLoading ? "Procesando..." : (authMode === "login" ? "Entrar" : "Registrarse")}
                  </button>

                  <p className="text-center text-sm text-stone-500">
                    {authMode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                    <button 
                      type="button"
                      onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(null); }}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      {authMode === "login" ? "Regístrate aquí" : "Inicia sesión"}
                    </button>
                  </p>
                </form>
              )}
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

        {/* History Modal */}
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-2xl h-[80vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center bg-orange-600 text-white">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <ClipboardList /> Mis Pedidos
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/20 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-stone-50">
                {userOrders.filter(o => !o.deleted).length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-stone-400">Aún no has realizado pedidos.</p>
                    <button 
                      onClick={() => { setShowHistory(false); window.location.hash = "#menu"; }}
                      className="mt-4 text-orange-600 font-bold hover:underline"
                    >
                      ¡Ver el menú ahora!
                    </button>
                  </div>
                ) : (
                  userOrders.filter(o => !o.deleted).map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                      <div className="flex justify-between items-start mb-4 pb-4 border-b border-stone-100">
                        <div>
                          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Pedido #{order.id.slice(0, 8)}</p>
                          <p className="text-sm font-medium text-stone-600">
                            {order.timestamp?.toDate().toLocaleString('es-NI', { 
                              day: '2-digit', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {order.status === 'pending' ? 'Pendiente' : 'Completado'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-stone-600">{item.name} x{item.quantity}</span>
                            <span className="font-bold">C$ {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                        <span className="text-stone-800 font-bold">Total Pagado</span>
                        <span className="text-xl font-black text-orange-600">C$ {order.total}</span>
                      </div>

                      <button 
                        onClick={() => { setActiveOrderId(order.id); setIsChatOpen(true); setShowHistory(false); }}
                        className="mt-4 w-full bg-orange-50 text-orange-600 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white transition-all"
                      >
                        <MessageSquare size={16} /> Hablar con el repartidor
                      </button>
                    </div>
                  ))
                )}
              </div>
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
                  <div key={`${msg.timestamp?.seconds || i}-${i}`} className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}>
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
              <span className="font-bold text-lg tracking-tight text-stone-800">Doña Toña</span>
            </div>
            <p className="text-stone-500 text-sm text-center md:text-left">© 2026 Doña Toña. Todos los derechos reservados.</p>
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
