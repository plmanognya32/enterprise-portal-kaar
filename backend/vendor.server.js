const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Replace with your actual SAP credentials and host
const SAP_BASE_URL = "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP";
const SAP_AUTH = {
  username: "K901501",
  password: "Welcome@123",
};

app.listen(PORT, () => {
  console.log(`🔥 Backend up at http://localhost:${PORT}`);
});

// 🟩 vendor login
app.post("/api/login", async (req, res) => {
  const { vendorId, password } = req.body;

  // Pad vendorId to SAP format (usually 10 digits)
  const paddedVendorId = vendorId.padStart(10, "0");

  const sapUrl = `${SAP_BASE_URL}/ZPMVENDOR_LOGIN_SRV/VendorLoginSet(VendorId='${paddedVendorId}',VendorPassword='${password}')`;

  try {
    const response = await axios.get(sapUrl, {
      auth: SAP_AUTH,
      headers: {
        Accept: "application/json",
      },
    });

    // If we got here, SAP responded
    const data = response.data?.d;

    if (
      data?.VendorId === paddedVendorId &&
      data?.VendorPassword === password
    ) {
      return res.json({
        success: true,
        result: "Y",
        message: "Login successful. Welcome to VendorLand™",
      });
    } else {
      return res.json({
        success: true,
        result: "N",
        message: "Invalid credentials. Vendor not found.",
      });
    }
  } catch (error) {
    console.error("SAP Login Error:", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      result: "N",
      message:
        "SAP login failed. Check your vendor credentials or backend logs.",
    });
  }
});

// 🟦 vendor profile
app.get("/api/vendor/profile/:vendorId", async (req, res) => {
  const vendorId = req.params.vendorId;

  if (!vendorId) {
    return res.status(400).json({ error: "Vendor ID is required" });
  }

  const profileUrl = `${SAP_BASE_URL}/ZPMVENDOR_PROFILE_SRV/VendorsProfileSet('${vendorId}')`;

  try {
    const response = await axios.get(profileUrl, {
      auth: SAP_AUTH,
      headers: {
        Accept: "application/json",
      },
    });

    const profile = response.data?.d;
    if (!profile) {
      return res.status(404).json({ error: "Profile not found in SAP" });
    }

    res.json(profile);
  } catch (error) {
    console.error("❌ SAP Vendor Profile fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch vendor profile from SAP" });
  }
});

// 🟨 vendor RFQs
app.get("/api/vendor/rfqs/:vendorId", async (req, res) => {
  const vendorId = req.params.vendorId;

  if (!vendorId) {
    return res.status(400).json({ error: "Vendor ID is required" });
  }

  const paddedVendorId = vendorId.padStart(10, "0");

  const rfqUrl = `${SAP_BASE_URL}/ZPMVENDOR_RFQUOTATION_SRV/VendorsQuotationSet?$filter=LIFNR eq ('${paddedVendorId}')`;

  try {
    const response = await axios.get(rfqUrl, {
      auth: SAP_AUTH,
      headers: {
        Accept: "application/json",
        //Content-Type: "application/json",
      },
    });

    const rfqs = response.data?.d?.results || [];

    // Transform for frontend clarity
    const formattedRFQs = rfqs.map((item, index) => ({
      id: item.EBELN || `rfq-${index}`,
      vendorNumber: item.LIFNR,
      documentNumber: item.EBELN || "N/A",
      documentType: item.BSART || "N/A",
      date: item.BEDAT
        ? new Date(parseInt(item.BEDAT.replace(/[^\d]/g, "")))
        : new Date(),
      purchasingOrg: item.EKORG || "N/A",
      purchasingGroup: item.EKGRP || "N/A",
      itemNumber: item.EBELP || "N/A",
      material: item.MATNR || "N/A",
      storageLocation: item.LGORT || "N/A",
      description: item.TXZ01 || "No description",
      priceUnit: item.PEINH || "N/A",
      quantity: item.MENGE || "N/A",
      unit: item.MEINS || "N/A",
      subject: item.TXZ01 ? `RFQ: ${item.TXZ01}` : "Request for Quotation",
      status: "Open",
    }));

    console.log("rfq data", formattedRFQs);

    res.json({ rfqs: formattedRFQs });
  } catch (error) {
    console.error(
      "❌ SAP RFQ Fetch Error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch RFQs from SAP" });
  }
});

// ⬜ vendor purchase orders
app.get("/api/vendor/purchase-orders/:vendorId", async (req, res) => {
  const vendorId = req.params.vendorId;

  if (!vendorId) {
    return res.status(400).json({ error: "Vendor ID is required" });
  }

  const paddedVendorId = vendorId.padStart(10, "0");

  const purchaseOrderUrl = `${SAP_BASE_URL}/ZPMVENDOR_PURCHASEORDER_SRV_01/VendorsPurchaseSet?$filter=LIFNR eq '${paddedVendorId}'`;

  try {
    const response = await axios.get(purchaseOrderUrl, {
      auth: SAP_AUTH,
      headers: {
        Accept: "application/json",
      },
    });

    const purchaseOrders = response.data?.d?.results || [];

    const formattedPurchaseOrders = purchaseOrders.map((item, index) => ({
      id: item.EBELN || `po-${index}`,
      vendorNumber: item.LIFNR || "N/A",
      documentNumber: item.EBELN || "N/A",
      companyCode: item.BUKRS || "N/A",
      purchasingOrg: item.EKORG || "N/A",
      purchasingGroup: item.EKGRP || "N/A",
      documentCategory: item.BSTYP || "N/A",
      documentType: item.BSART || "N/A",
      itemNumber: item.EBELP || "N/A",
      material: item.MATNR || "N/A",
      quantity: item.MENGE || "0",
      unit: item.MEINS || "N/A",
      priceUnit: item.PEINH || "1",
      status: "Open",
    }));

    console.log("Purchase orders data", formattedPurchaseOrders);

    res.json({ purchaseOrders: formattedPurchaseOrders });
  } catch (error) {
    console.error(
      "❌ SAP Purchase Orders Fetch Error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch purchase orders from SAP" });
  }
});

// 🟩 vendor goods receipt
app.get("/api/vendor/goodsreceipt/:vendorId", async (req, res) => {
  const vendorId = req.params.vendorId;

  if (!vendorId) {
    return res.status(400).json({ error: "Vendor ID is required" });
  }

  const paddedVendorId = vendorId.padStart(10, "0");

  const goodsReceiptUrl = `${SAP_BASE_URL}/ZPMVENDOR_GOODSRECEIPTS_SRV/VendorsGoodsSet?$filter=LIFNR eq '${paddedVendorId}'`;

  try {
    const response = await axios.get(goodsReceiptUrl, {
      auth: SAP_AUTH,
      headers: {
        Accept: "application/json",
      },
    });

    const goodsReceipts = response.data?.d?.results || [];

    const formattedGoodsReceipts = goodsReceipts.map((item, index) => ({
      id: item.MBLNR || `gr-${index}`,
      vendorNumber: item.LIFNR || this.vendorNumber,
      documentNumber: item.MBLNR || "N/A",
      documentYear: item.MJAHR || "N/A",
      postingDate: item.BUDAT
        ? new Date(parseInt(item.BUDAT.match(/\d+/)[0]))
        : new Date(),
      documentDate: item.BLDAT
        ? new Date(parseInt(item.BLDAT.match(/\d+/)[0]))
        : new Date(),
      createdBy: item.USNAM || "N/A",
      trackingNumber: item.XBLNR || "N/A",
      itemNumber: item.ZEILE || "N/A",
      movementType: item.BWART || "N/A",
      purchaseOrderNumber: item.EBELN || "N/A",
      purchaseOrderItem: item.EBELP || "N/A",
      storageLocation: item.LGORT || "N/A",
      batchNumber: item.CHARG || "N/A",
      quantity: String(item.MENGE || "0"),
      unit: item.MEINS || "N/A",
      status: "Posted", // Default status
    }));

    console.log("Goods Receipt", formattedGoodsReceipts);

    res.json({ goodsReceipts: formattedGoodsReceipts });
  } catch (error) {
    console.error(
      "❌ SAP Purchase Goods Receipt Fetch Error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch goods receipt from SAP" });
  }
});

// 🟪 vendor payments and ageing
app.get("/api/vendor/financials/payments/:vendorId", async (req, res) => {
  const vendorId = req.params.vendorId;

  if (!vendorId) {
    return res.status(400).json({ error: "Vendor ID is required" });
  }

  const paddedVendorId = vendorId.padStart(10, "0");

  const paymentsAgeingUrl = `${SAP_BASE_URL}/ZPMVENDOR_PAYMENTANDAGEING_SRV/VendorsPaymentsSet?$filter=LIFNR eq '${paddedVendorId}'`;

  try {
    const response = await axios.get(paymentsAgeingUrl, {
      auth: SAP_AUTH,
      headers: {
        Accept: "application/json",
      },
    });

    const payments = response.data?.d?.results || [];

    const formattedPayments = payments.map((item, index) => {
      const billingDate = item.BLDAT
        ? new Date(parseInt(item.BLDAT.match(/\d+/)[0]))
        : new Date();
      const dueDate = item.BUDAT
        ? new Date(parseInt(item.BUDAT.match(/\d+/)[0]))
        : new Date();
      const today = new Date();

      return {
        vendorNumber: item.LIFNR || paddedVendorId,
        companyCode: item.BUKRS || "N/A",
        lineItem: item.BUZEI || "N/A",
        generalLedger: item.HKONT || "N/A",
        documentCurrency: item.WRBTR || "N/A",
        paymentKey: item.ZTERM || "N/A",
        indicator: item.SHKZG || "N/A",
        documentNumber: item.BELNR || "N/A",
        fiscalYear: item.GJAHR || "N/A",
        billingDate,
        postingDate: dueDate,
        aging: Math.floor(
          (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
        currencyKey: item.WAERS || "N/A",
        documentType: item.BLART || "N/A",
      };
    });

    console.log("Payments and Ageing", formattedPayments);

    res.json({ payments: formattedPayments });
  } catch (error) {
    console.error(
      "❌ SAP Payments Fetch Error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch payments from SAP" });
  }
});

// ⬛ vendor credit and debit memos
app.get("/api/vendor/financials/memos/:vendorId", async (req, res) => {
  const vendorId = req.params.vendorId;

  if (!vendorId) {
    return res.status(400).json({ error: "Vendor ID is required" });
  }

  const paddedVendorId = vendorId.padStart(10, "0");

  const memosUrl = `${SAP_BASE_URL}/ZPMVENDOR_CREDITDEBITMEMO_SRV/VendorsCreditsSet?$filter=LIFNR eq '${paddedVendorId}'`;

  try {
    const response = await axios.get(memosUrl, {
      auth: SAP_AUTH,
      headers: {
        Accept: "application/json",
      },
    });

    const cdmemos = response.data?.d?.results || [];

    const formattedCDMemos = cdmemos.map((item, index) => {
      // Convert SAP date string to JavaScript Date
      const sapDateRegex = /\/Date\((\d+)\)\//;
      const postingDate = item.BUDAT
        ? new Date(parseInt(item.BUDAT.match(sapDateRegex)[1]))
        : null;

      // Convert currency string to number
      const documentCurrency = item.WRBTR ? parseFloat(item.WRBTR) : 0;

      return {
        documentNumber: item.BELNR || "N/A",
        postingDate: postingDate,
        documentCurrency: documentCurrency,
        currency: item.WAERS || "N/A",
        documentType: item.BLART || "N/A",
        indicator: item.SHKZG || "N/A",
        vendorNumber: item.LIFNR || paddedVendorId,
        fiscalYear: item.GJAHR || "N/A",
        companyCode: item.BUKRS || "N/A",
        username: item.USNAM || "N/A",
        transactionCode: item.TCODE || "N/A",
        generalLedger: item.HKONT || "N/A",
        paymentKey: item.ZTERM || "N/A",
        lineItem: item.BUZEI || "N/A",
      };
    });

    console.log("Memos", formattedCDMemos);

    res.json({ cdmemos: formattedCDMemos });
  } catch (error) {
    console.error(
      "❌ SAP Payments Fetch Error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch memos from SAP" });
  }
});

// 🟦 Fetch all invoices for a vendor
app.get("/api/invoices", async (req, res) => {
  const vendorId = req.query.vendorId;

  if (!vendorId) {
    return res.status(400).json({ error: "Vendor ID is required" });
  }

  const paddedVendorId = vendorId.padStart(10, "0");

  const invoicedisplayUrl = `${SAP_BASE_URL}/ZPMVENDOR_INVOICEDISPLAY_SRV/VendorsInvoicedisplaysSet?$filter=LIFNR eq '${paddedVendorId}'`;

  try {
    const response = await axios.get(invoicedisplayUrl, {
      auth: SAP_AUTH,
      headers: {
        Accept: "application/json",
      },
    });

    const results = response.data?.d?.results || [];

    const formatted = results.map((item) => ({
      Belnr: item.BELNR,
      Buzei: item.BUZEI,
      BUKRS: item.BUKRS,
      BLART: item.BLART,
      LIFNR: item.LIFNR,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ SAP Invoices Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch invoices from SAP" });
  }
});

// 🟨 Stream invoice PDF using BELNR
app.get("/api/invoice/:belnr/pdf", async (req, res) => {
  const { belnr } = req.params;

  try {
    const pdfStream = await axios.get(
      `${SAP_BASE_URL}/ZPMVENDOR_INVOICES_SRV_01/VendorsInvoiceSet('${belnr}')/$value`,
      {
        auth: SAP_AUTH,
        responseType: "arraybuffer",
        headers: { Accept: "application/pdf" },
      }
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=Invoice_${belnr}.pdf`,
    });

    res.send(pdfStream.data);
  } catch (error) {
    console.error("❌ PDF Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch PDF" });
  }
});
