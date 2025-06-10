//sap-proxy-server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const xml2js = require("xml2js");
const https = require("https");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = 3001;

const agent = new https.Agent({
  rejectUnauthorized: false, // 👈 disables cert check
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const SAP_CONFIG = {
  BASE_URL: process.env.SAP_BASE_URL,
  LOGIN_PATH: process.env.SAP_LOGIN_PATH,
  PROFILE_PATH: process.env.SAP_PROFILE_PATH,
  PAYMENTS_PATH: process.env.SAP_PAYMENTS_PATH,
  CLIENT: process.env.SAP_CLIENT,
  SAP_USER: process.env.SAP_USER,
  SAP_PASSWORD: process.env.SAP_PASSWORD,
};

app.listen(PORT, () => {
  console.log(`SAP Proxy Server running at http://localhost:${PORT}`);
});

//customer login
app.post("/api/sap-login", async (req, res) => {
  try {
    const { customerId, password } = req.body;
    console.log("🔐 Handling SAP login for:", customerId);

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZauthCustLogin>
            <IvCustPassword>${password}</IvCustPassword>
            <IvCustUsername>${customerId}</IvCustUsername>
          </urn:ZauthCustLogin>
        </soapenv:Body>
      </soapenv:Envelope>    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}${SAP_CONFIG.LOGIN_PATH}?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          Authorization: `Basic ${Buffer.from(
            `${SAP_CONFIG.SAP_USER}:${SAP_CONFIG.SAP_PASSWORD}`
          ).toString("base64")}`,
        },
      }
    );

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
    });

    const result = await parser.parseStringPromise(response.data);
    console.log("Parsed SAP Login Response:", JSON.stringify(result, null, 2));

    const body =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZauthCustLoginResponse"
      ];

    const success = body?.["EvAuthResult"] === "SUCCESS";

    res.json({
      success,
      message: success ? "Login successful" : "Invalid credentials",
    });
  } catch (error) {
    console.error(
      "💥 SAP Proxy Error:",
      error?.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Error connecting to SAP system",
      sapError: error?.response?.data || null,
    });
  }
});

//customer profile
app.post("/api/sap-profile", async (req, res) => {
  try {
    const { customerId } = req.body;
    const formattedCustomerId = customerId.padStart(10, "0");
    console.log("Fetching SAP profile for:", customerId);

    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZgetCustProfile>
          <IvCustomerid>${formattedCustomerId}</IvCustomerid>
        </urn:ZgetCustProfile>
      </soapenv:Body>
    </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}${SAP_CONFIG.PROFILE_PATH}?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          Authorization: `Basic ${Buffer.from(
            `${SAP_CONFIG.SAP_USER}:${SAP_CONFIG.SAP_PASSWORD}`
          ).toString("base64")}`,
        },
        timeout: 10000,
      }
    );

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
    });

    const result = await parser.parseStringPromise(response.data);
    const body = result?.["soap-env:Envelope"]?.["soap-env:Body"];

    if (body?.["soap-env:Fault"]) {
      const fault = body["soap-env:Fault"];
      throw new Error(fault.faultstring || "SAP system error");
    }

    const profileResponse = body?.["n0:ZgetCustProfileResponse"];
    const sapData = profileResponse?.EsProfileData;

    if (!sapData) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const profileData = {
      customerId: sapData.Kunnr,
      name: [sapData.Name1, sapData.Name2].filter(Boolean).join(" "),
      phone: sapData.Telf1,
      fax: sapData.Telfx,
      address: [sapData.Stras, sapData.Ort01, sapData.Regio]
        .filter(Boolean)
        .join(", "),
      user_type: sapData.Xcpdk === "X" ? "One-Time" : "Repetitive",
      country: sapData.Land1,
      postalCode: sapData.Pstlz,
      searchTerm: sapData.Sortl,
    };

    res.json({
      success: true,
      profile: profileData,
    });
  } catch (error) {
    console.log("SAP Profile Error:", error.message);
    let errorMessage = "Error fetching customer profile";
    if (error.response?.data) {
      try {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(error.response.data);
        const fault =
          result?.["soap-env:Envelope"]?.["soap-env:Body"]?.["soap-env:Fault"];
        errorMessage = fault?.faultstring || errorMessage;
      } catch (e) {
        console.error("Error parsing SAP fault:", e);
      }
    }
    res.status(500).json({
      success: false,
      message: errorMessage,
      sapError: error?.response?.data || null,
    });
  }
});

//customer inquiry
app.post("/api/sap-inquiries", async (req, res) => {
  try {
    const { kunnr } = req.body;
    const formattedKunnr = kunnr.padStart(10, "0");

    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZgetInquirydets>
          <IvKunnr>${formattedKunnr}</IvKunnr>
        </urn:ZgetInquirydets>
      </soapenv:Body>
    </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}/sap/bc/srt/scs/sap/zget_inquirydets?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Basic ${Buffer.from(
            `${SAP_CONFIG.SAP_USER}:${SAP_CONFIG.SAP_PASSWORD}`
          ).toString("base64")}`,
        },
      }
    );

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
    });

    const result = await parser.parseStringPromise(response.data);
    const items =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZgetInquirydetsResponse"
      ]?.["EtInquiries"]?.["item"] || [];

    const list = Array.isArray(items) ? items : [items];

    const parsed = list.map((item, i) => ({
      id: item.vbeln || `temp-${i}`,
      documentNumber: item.Vbeln,
      customerNumber: item.Kunnr,
      date: item.Erdat ? new Date(item?.Erdat) : new Date(),
      dueDate: item.Bnddt === "0000-00-00" ? null : new Date(item.Bnddt),
      subject: item.Arktx || "No Subject",
      description: item.Arktx || "No Description",
      currency: item.Waerk,
      position: item.Posnr,
      quantity: item.Kwmeng,
      units: item.Vrkme,
      netValue: item.Netwr,
      status: "Open",
    }));

    console.log("Parsed", parsed);
    res.json({ data: parsed });
  } catch (error) {
    console.error("❌ Inquiry fetch failed", error.message);
    res.status(500).json({ error: "Failed to fetch inquiries from SAP." });
  }
});

//customer sales
app.post("/api/sap-sales", async (req, res) => {
  try {
    const { kunnr } = req.body;
    const formattedKunnr = kunnr.padStart(10, "0");
    console.log("Customer number", formattedKunnr);

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
         <soapenv:Header/>
         <soapenv:Body>
            <urn:ZgetSalesdets>
               <IvKunnr>${formattedKunnr}</IvKunnr>
            </urn:ZgetSalesdets>
         </soapenv:Body>
      </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}/sap/bc/srt/scs/sap/zget_salesdets?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Basic ${Buffer.from(
            `${SAP_CONFIG.SAP_USER}:${SAP_CONFIG.SAP_PASSWORD}`
          ).toString("base64")}`,
        },
        timeout: 10000,
      }
    );
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
    });

    const result = await parser.parseStringPromise(response.data);

    console.log(JSON.stringify(result, null, 2));

    const items =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZgetSalesdetsResponse"
      ]?.["EtSales"]?.["item"] || [];

    const list = Array.isArray(items) ? items : [items];

    const parsed = list.map((item, i) => ({
      id: item.Kunnr,
      documentNumber: item.Vbeln,
      customerNumber: item.Kunnr,
      position: item.Posnr,
      date: item.Erdat ? new Date(item.Erdat) : new Date(),
      requestDeliveryDate: item.VdatuAna ? new Date(item.VdatuAna) : null,
      material: item.Matnr,
      description: item.Arktx,
      quantity: item.Kwmeng,
      unit: item.Vrkme,
      netValue: item.Netwr,
      currency: item.Waerk,
      orderType: item.Auart,
      reference: item.Bstnk,
      processingStatus: item.Gbstk,
      deliveryStatus: item.Lfgsk,
      storageLocation: item.Lgort,
      division: item.Spart,
      status: "Open",
    }));

    console.log(
      "Successfully fetched sales data for customer:",
      formattedKunnr
    );
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Sales fetch failed", error.message);
    res.status(500).json({ error: "Failed to fetch sales data." });
  }
});

//customer deliveries
app.post("/api/sap-deliveries", async (req, res) => {
  try {
    const { kunnr } = req.body;
    const formattedKunnr = kunnr.padStart(10, "0");
    console.log("Customer number for deliveries:", formattedKunnr);

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
         <soapenv:Header/>
         <soapenv:Body>
            <urn:ZgetDeliverydets>
               <IvKunnr>${formattedKunnr}</IvKunnr>
            </urn:ZgetDeliverydets>
         </soapenv:Body>
      </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}/sap/bc/srt/scs/sap/zget_deliverydets?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Basic ${Buffer.from(
            `${SAP_CONFIG.SAP_USER}:${SAP_CONFIG.SAP_PASSWORD}`
          ).toString("base64")}`,
        },
        timeout: 10000,
      }
    );

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
    });

    const result = await parser.parseStringPromise(response.data);
    console.log("Raw deliveries response:", JSON.stringify(result, null, 2));

    const items =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZgetDeliverydetsResponse"
      ]?.["EtDeliveries"]?.["item"] || [];

    const list = Array.isArray(items) ? items : [items];

    const parsed = list.map((item, i) => ({
      id: item.Vbeln || `delivery-${i}`,
      documentNumber: item.Vbeln || "N/A",
      customerNumber: item.Kunnr || formattedKunnr,
      shippingPoint: item.Vstel || "N/A",
      deliveryType: item.Lfart || "N/A",
      deliveryDate: item.Lfdat ? new Date(item.Lfdat) : null,
      goodsIssueDate: item.Wadat ? new Date(item.Wadat) : null,
      salesOrganization: item.Vkorg || "N/A",
      createdBy: item.Ernam || "N/A",
      creationDate: item.Erdat ? new Date(item.Erdat) : null,
      position: item.Posnr || "1",
      material: item.Matnr || "N/A",
      description: item.Arktx || "No description",
      quantity: item.Lfimg || "0",
      unit: item.Vrkme || "EA",
      plant: item.Werks || "N/A",
      storageLocation: item.Lgort || "N/A",
      status: item.status || "Open",
    }));

    console.log("Parsed deliveries data:", parsed);
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Deliveries fetch failed:", error.message, error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to fetch deliveries data.",
      details: error.message,
    });
  }
});

//customer payments
app.post("/api/sap-financial/payments", async (req, res) => {
  try {
    const { kunnr } = req.body;
    if (!kunnr) {
      console.error("Missing kunnr in request body");
      return res.status(400).json({
        success: false,
        error: "Customer ID is required",
      });
    }

    const formattedKunnr = String(kunnr).padStart(10, "0");
    console.log("Fetching payments for:", formattedKunnr);

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
         <soapenv:Header/>
         <soapenv:Body>
            <urn:ZgetPaymentdets>
               <IvKunnr>${formattedKunnr}</IvKunnr>
            </urn:ZgetPaymentdets>
         </soapenv:Body>
      </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}/sap/bc/srt/scs/sap/zget_paymentdets?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Basic ${Buffer.from(
            `${SAP_CONFIG.SAP_USER}:${SAP_CONFIG.SAP_PASSWORD}`
          ).toString("base64")}`,
        },
        timeout: 10000,
      }
    );

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
      trim: true,
    });

    const result = await parser.parseStringPromise(response.data);
    console.log("Raw payments response:", JSON.stringify(result, null, 2));

    // Extract items from EtPayments
    let items =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZgetPaymentdetsResponse"
      ]?.["EtPayments"]?.["item"] || [];

    // Ensure items is an array
    if (!Array.isArray(items)) {
      items = items ? [items] : [];
    }

    console.log("Extracted items:", JSON.stringify(items, null, 2));

    const parseSAPDate = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{8}$/.test(dateStr)) {
        return new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
      }
      console.warn(`Invalid date format: ${dateStr}`);
      return null;
    };

    const parsed = items.map((item, i) => {
      const billingDate = parseSAPDate(item.Bldat);
      const dueDate = parseSAPDate(item.Zfbdt);
      const postingDate = parseSAPDate(item.Budat);
      const today = new Date();
      const aging = dueDate
        ? Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;
      const status = item.Augbl ? "Cleared" : aging > 0 ? "Overdue" : "Open";

      return {
        id: item.Belnr || `payment-${i}`,
        documentNumber: item.Belnr || "N/A",
        customerNumber: item.Kunnr || formattedKunnr,
        postingDate,
        billingDate,
        dueDate,
        amount: parseFloat(item.Wrbtr) || 0,
        currency: item.Waers || "USD",
        status,
        aging: aging >= 0 ? aging : 0,
      };
    });

    console.log("Parsed payments data:", JSON.stringify(parsed, null, 2));

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Payment fetch error:", {
      message: error.message,
      url: error.config?.url,
      response: error.response?.data,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: "Payment data fetch failed",
      details: error.response?.data || error.message,
    });
  }
});

//customer credit/debit
app.post("/api/sap-financial/memos", async (req, res) => {
  try {
    const { kunnr } = req.body;
    if (!kunnr) {
      console.error("Missing kunnr in request body");
      return res.status(400).json({
        success: false,
        error: "Customer ID is required",
      });
    }

    const formattedKunnr = String(kunnr).padStart(10, "0");
    console.log("Fetching memos for kunnr:", formattedKunnr);

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZgetMemodets>
            <IvKunnr>${formattedKunnr}</IvKunnr>
          </urn:ZgetMemodets>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}/sap/bc/srt/scs/sap/zget_memodets?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Basic ${Buffer.from(
            `${SAP_CONFIG.SAP_USER}:${SAP_CONFIG.SAP_PASSWORD}`
          ).toString("base64")}`,
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Bypass self-signed certificate
        }),
        timeout: 10000,
      }
    );

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
      trim: true,
    });

    const result = await parser.parseStringPromise(response.data);
    console.log("Raw memos response:", JSON.stringify(result, null, 2));

    // Extract items from EtMemos
    let items =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZgetMemodetsResponse"
      ]?.["EtMemos"]?.["item"] || [];

    // Ensure items is an array
    if (!Array.isArray(items)) {
      items = items ? [items] : [];
    }

    console.log("Extracted memo items:", JSON.stringify(items, null, 2));

    const parseSAPDate = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{8}$/.test(dateStr)) {
        return new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
      }
      console.warn(`Invalid date format: ${dateStr}`);
      return null;
    };

    const parsed = items.map((item, i) => {
      const billingDate = parseSAPDate(item.Fkdat);
      // No Zfbdt, Budat, or Augbl in response, so aging/status are simplified
      const type = item.Vbtyp === "M" ? "Invoice" : "Unknown"; // Vbtyp=M for Invoice
      const status = "Open"; // Default, no Augbl
      const aging = 0; // Default, no Zfbdt

      return {
        id: item.Vbeln || `memo-${i}`,
        documentNumber: item.Vbeln || "N/A",
        customerNumber: item.Kunnr || formattedKunnr,
        postingDate: null, // No Budat
        billingDate,
        dueDate: null, // No Zfbdt
        amount: parseFloat(item.Netwr) || 0,
        currency: item.Waerk || "USD",
        type,
        status,
        aging,
        billingType: item.Fkart || "N/A", // Use Fkart instead of Blart
      };
    });

    console.log("Parsed memos data:", JSON.stringify(parsed, null, 2));

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Memo fetch error:", {
      message: error.message,
      url: error.config?.url,
      response: error.response?.data,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: "Memo data fetch failed",
      details: error.response?.data || error.message,
    });
  }
});

//customer invoices
app.post("/api/sap-invoices", async (req, res) => {
  try {
    const { kunnr } = req.body;
    if (!kunnr) {
      console.error("Missing kunnr in request body");
      return res.status(400).json({
        success: false,
        error: "Customer ID is required",
      });
    }

    const formattedKunnr = String(kunnr).padStart(10, "0");
    console.log("Fetching invoices for kunnr:", formattedKunnr);

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZgetInvoicepagedets>
         <IvKunnr>${formattedKunnr}</IvKunnr>
      </urn:ZgetInvoicepagedets>
   </soapenv:Body>
</soapenv:Envelope>
    `;

    console.log("SOAP Request:", soapRequest);

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}/sap/bc/srt/scs/sap/zget_invoicepagedets?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Basic ${Buffer.from(
            `${SAP_CONFIG.SAP_USER}:${SAP_CONFIG.SAP_PASSWORD}`
          ).toString("base64")}`,
        },
      }
    );

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
      trim: true,
    });

    const result = await parser.parseStringPromise(response.data);
    console.log("Raw invoices response:", JSON.stringify(result, null, 2));

    let items =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZgetInvoicepagedetsResponse"
      ]?.["EtInvoicepagedets"]?.["item"] || [];

    if (!Array.isArray(items)) {
      items = items ? [items] : [];
    }

    console.log("Extracted invoice items:", JSON.stringify(items, null, 2));

    const parseSAPDate = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{8}$/.test(dateStr)) {
        return new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
      }
      console.warn(`Invalid date format: ${dateStr}`);
      return null;
    };

    const parsed = items.map((item, i) => ({
      id: item.Vbeln || `invoice-${i}`,
      invoiceNumber: item.Vbeln || "N/A",
      customerNumber: item.Kunnr || formattedKunnr,
      itemNumber: item.Posnr || "1",
      billingDate: parseSAPDate(item.Fkdat),
      amount: parseFloat(item.Netwr) || 0,
      currency: item.Waerk || "USD",
      material: item.Matnr || "N/A",
      description: item.Arktx || "No description",
      quantity: parseFloat(item.Kwmeng) || 0,
      unit: item.Vrkme || "EA",
      status: "Open", // Simplified, adjust based on your SAP logic
    }));

    console.log("Parsed invoices data:", JSON.stringify(parsed, null, 2));

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Invoice fetch error:", {
      message: error.message,
      url: error.config?.url,
      response: error.response?.data,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: "Invoice data fetch failed",
      sapFault:
        result?.["soap-env:Envelope"]?.["soap-env:Body"]?.["soap-env:Fault"]?.[
          "faultstring"
        ] || error.message,
    });
  }
});

//customer invoice download
app.post("/api/get-invoice-pdf", async (req, res) => {
  const { vbeln, posnr } = req.body;

  if (!vbeln || !posnr) {
    return res.status(400).json({ error: "VBELN and POSNR are required!" });
  }

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ZgetInvoicedets>
          <Posnr>${posnr}</Posnr>
          <Vbeln>${vbeln}</Vbeln>
        </urn:ZgetInvoicedets>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(
      "https://AZKTLDS5CP.kcloud.com:44300/sap/bc/srt/scs/sap/zget_invoicepdfdets?sap-client=100",
      soapEnvelope,
      {
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          Authorization: "Basic SzkwMTUwMTpXZWxjb21lQDEyMw==",
        },
        timeout: 15000,
        httpsAgent: agent,
      }
    );

    const match = response.data.match(/<LvPdfEncoded>(.*?)<\/LvPdfEncoded>/s);

    if (!match || !match[1]) {
      return res
        .status(500)
        .json({ error: "Failed to extract PDF content from SAP response." });
    }

    const base64PDF = match[1];
    res.json({ pdfBase64: base64PDF });
  } catch (error) {
    console.error("SAP request error:", error.message);
    res.status(500).json({
      error: "Error fetching invoice from SAP.",
      details: error.message,
    });
  }
});
