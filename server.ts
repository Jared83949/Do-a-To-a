import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Pagadito Config
const PAGADITO_UID = process.env.PAGADITO_UID;
const PAGADITO_WSK = process.env.PAGADITO_WSK;
const IS_SANDBOX = process.env.PAGADITO_SANDBOX === "true";
const PAGADITO_API_URL = IS_SANDBOX 
  ? "https://sandbox.pagadito.com/comercios/gateway/api" 
  : "https://www.pagadito.com/comercios/gateway/api";

// Pagadito Integration
async function getPagaditoToken() {
  if (!PAGADITO_UID || !PAGADITO_WSK) {
    throw new Error("PAGADITO_UID and PAGADITO_WSK are required environment variables");
  }

  try {
    const response = await axios.post(PAGADITO_API_URL, {
      operation: "get_token",
      uid: PAGADITO_UID,
      wsk: PAGADITO_WSK
    });

    if (response.data.code === "PG1001") {
      return response.data.value;
    } else {
      throw new Error(`Pagadito Auth Error: ${response.data.message} (${response.data.code})`);
    }
  } catch (error: any) {
    console.error("Pagadito Token Error:", error.response?.data || error.message);
    throw error;
  }
}

app.post("/api/pay/pagadito", async (req, res) => {
  try {
    const { items, total, orderId } = req.body;
    
    // 1. Get Authentication Token
    const token = await getPagaditoToken();

    // 2. Register Order
    // ern: External Reference Number (must be unique)
    const ern = orderId || `ORD-${Date.now()}`;
    
    const details = items.map((item: any) => ({
      quantity: item.quantity,
      description: item.name,
      price: item.price
    }));

    const orderData = {
      operation: "register_order",
      token,
      ern,
      amount: total,
      currency: "USD",
      details,
      // In a real app, these should be paths to your app
      url_return: "https://ais-pre-rwgrumzlm7f5pfdak3w6yh-93484665388.us-east5.run.app/?status=success",
      url_cancel: "https://ais-pre-rwgrumzlm7f5pfdak3w6yh-93484665388.us-east5.run.app/?status=cancel"
    };

    const response = await axios.post(PAGADITO_API_URL, orderData);

    if (response.data.code === "PG1002") {
      res.json({ checkoutUrl: response.data.value });
    } else {
      res.status(400).json({ 
        error: "Failed to register order with Pagadito", 
        message: response.data.message,
        code: response.data.code 
      });
    }
  } catch (error: any) {
    console.error("Payment registration error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
