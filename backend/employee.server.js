//sap-proxy-server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const xml2js = require("xml2js");
const https = require("https");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3002;

const agent = new https.Agent({
  rejectUnauthorized: false, // 👈 disables cert check
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const SAP_CONFIG = {
  BASE_URL: process.env.SAP_EMPLOYEE_URL,
  LOGIN_PATH: process.env.SAP_EMPLOYEE_LOGIN,
  PROFILE_PATH: process.env.SAP_EMPLOYEE_PROFILE,
  LEAVEDATA_PATH: process.env.SAP_EMPLOYEE_LEAVEDATA,
  PAYSLIP_DIS: process.env.SAP_EMPLOYEE_PAYSLIP,
  CLIENT: process.env.SAP_CLIENT,
  SAP_USER: process.env.SAP_USER,
  SAP_PASSWORD: process.env.SAP_PASSWORD,
  MAIL_PWD: process.env.APP_PASSWORDS,
};

app.listen(PORT, () => {
  console.log(`SAP Proxy Server running at http://localhost:${PORT}`);
});

//login
app.post("/api/login", async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    console.log("Login attempt with:", { employeeId, password });

    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
     <soapenv:Header/>
      <soapenv:Body>
        <urn:ZpmempLogin>
         <IvEmployeeid>${employeeId}</IvEmployeeid>
         <IvPassword>${password}</IvPassword>
       </urn:ZpmempLogin>
     </soapenv:Body>
    </soapenv:Envelope>
    `;

    console.log("SOAP Request:", soapRequest);

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}${SAP_CONFIG.LOGIN_PATH}?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        httpsAgent: agent,
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
    console.log("Parsed login:", JSON.stringify(result, null, 2));

    const body =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZpmempLoginResponse"
      ];

    const success = body?.["EvAuthResult"] === "SUCCESS";

    res.json({
      success,
      message: success ? "Login succesful" : "Invalid credentials",
    });
  } catch (error) {
    console.error("SAP Proxy error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Error connecting to SAP",
      sapError: error?.response?.data || null,
    });
  }
});

//profile
app.post("/api/profile", async (req, res) => {
  try {
    const { employeeId } = req.body;
    console.log("Profile of:", employeeId);

    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
     <soapenv:Header/>
      <soapenv:Body>
        <urn:ZpmempProfile>
          <IvEmployeeid>${employeeId}</IvEmployeeid>
        </urn:ZpmempProfile>
      </soapenv:Body>
    </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}${SAP_CONFIG.PROFILE_PATH}?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        httpsAgent: agent,
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

    const profileResponse = body?.["n0:ZpmempProfileResponse"];
    const sapData = profileResponse?.EsProfileData;

    if (!sapData) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    const profileData = {
      employeeId: sapData.Pernr,
      name: sapData.Ename,
      joiningDate: sapData.Begda,
      lastDate: sapData.Endda,
      lastUpdated: sapData.Aedtm,
      companyCode: sapData.Bukrs,
      personnelArea: sapData.Werks,
      employeeGroup: sapData.Persg,
      employeeSubGroup: sapData.Persk,
      organizationalKey: sapData.Vdsk1,
      personnelSubarea: sapData.Btrtl,
      payrollArea: sapData.Abkrs,
      adminGroup: sapData.Sbmod,
    };

    res.json({
      success: true,
      profile: profileData,
    });
  } catch (error) {
    console.log("SAP Profile Error:", error.message);
    let errorMessage = "Error fetching employee profile";
    if (error.response?.data) {
      try {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(error.response.data);
        const fault =
          result?.["soap-env:Envelope"]?.["soap-env:Body"]?.["soap.env:Fault"];
        errorMessage = fault?.fault || errorMessage;
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

//leavedata
app.post("/api/leavedata", async (req, res) => {
  try {
    const { employeeId } = req.body;
    console.log("Leave data of:", employeeId);

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
         <soapenv:Header/>
         <soapenv:Body>
            <urn:ZpmempLeavedata>
               <IvEmployeeid>${employeeId}</IvEmployeeid>
            </urn:ZpmempLeavedata>
         </soapenv:Body>
      </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}${SAP_CONFIG.LEAVEDATA_PATH}?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        httpsAgent: agent,
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

    const leavedataResponse = body?.["n0:ZpmempLeavedataResponse"];
    const items = leavedataResponse?.EtLeavedata?.item;

    if (!items) {
      return res.status(404).json({
        success: false,
        message: "No leave data found for this employee",
      });
    }

    const leaveHistory = (Array.isArray(items) ? items : [items]).map(
      (item) => ({
        employeeId: item.Pernr,
        from: item.Begda,
        to: item.Endda,
        type: item.Awart,
        days: parseFloat(item.Abwtg),
        absenceHours: parseFloat(item.Stdaz),
        payrollDays: parseFloat(item.Abrtg),
        payrollHours: parseFloat(item.Abrst),
        creditedDays: parseFloat(item.Anrtg),
        subsequentIllness: item.Kenn1,
        repeatedIllness: item.Kenn2,
        calendarDays: parseFloat(item.Kaltg),
        premiumIndicator: item.Prakz,
        position: item.Plans,
        reportedAt: item.Mlduz,
        sicknessConfirmed: item.Rmduz,
        status: item.Alldf === "X" ? "Approved" : "Pending",
      })
    );

    res.json({
      success: true,
      leaveHistory,
    });
  } catch (error) {
    console.log("SAP Error:", error.message);
    let errorMessage = "Error fetching employee leave details";

    if (error.response?.data) {
      try {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(error.response.data);
        const fault =
          result?.["soap-env:Envelope"]?.["soap-env:Body"]?.["soap-env:Fault"];
        errorMessage = fault?.fault || errorMessage;
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

//payslipdisplay
app.post("/api/payslips", async (req, res) => {
  try {
    const { employeeId } = req.body;
    console.log("Payslips of:", employeeId);

    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
       <soapenv:Header/>
       <soapenv:Body>
          <urn:ZpmempPayslipdisplay>
             <IvEmployeeid>${employeeId}</IvEmployeeid>
          </urn:ZpmempPayslipdisplay>
       </soapenv:Body>
    </soapenv:Envelope>
    `;

    const response = await axios.post(
      `${SAP_CONFIG.BASE_URL}${SAP_CONFIG.PAYSLIP_DIS}?sap-client=${SAP_CONFIG.CLIENT}`,
      soapRequest,
      {
        httpsAgent: agent,
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
    console.log("Raw response:", JSON.stringify(result, null, 2));

    let items =
      result?.["soap-env:Envelope"]?.["soap-env:Body"]?.[
        "n0:ZpmempPayslipdisplayResponse"
      ]?.["EsPslipdata"]?.["item"] || [];

    if (!Array.isArray(items)) {
      items = items ? [items] : [];
    }

    console.log("Extracted payslips:", JSON.stringify(items, null, 2));

    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{8}$/.test(dateStr)) {
        return new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
      }
      if (/^\d{4}-\d{2}\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
      }
      console.warn(`Invalid date format: ${dateStr}`);
      return null;
    };

    const parsed = items.map((item, i) => ({
      id: item.Pernr || employeeId,
      payScaleGrp: item.Trfgr || "N/A",
      lastChangedOn: item.Aedtm || "N/A",
      recordNo: item.Seqnr || "N/A",
    }));

    console.log("Parsed payroll data:", JSON.stringify(parsed, null, 2));

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
      error: "Payroll fetch failed.",
      sapFault:
        ["soap-env:Envelope"]?.["soap-env:Body"]?.["soap-env:Fault"]?.[
          "faultstring"
        ] || error.message,
    });
  }
});

//payslip download
app.post("/api/downloadpayslip", async (req, res) => {
  const { employeeId } = req.body;

  const soapEnvelope = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
     <soapenv:Header/>
     <soapenv:Body>
        <urn:ZpmempPayslip>
           <Pernr>${employeeId}</Pernr>
        </urn:ZpmempPayslip>
     </soapenv:Body>
  </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(
      "https://AZKTLDS5CP.kcloud.com:44300/sap/bc/srt/scs/sap/zpmemp_payslip?sap-client=100",
      soapEnvelope,
      {
        httpsAgent: agent,
        headers: {
          "Content-Type": "text/xml; charset=UTF-8",
          Authorization: "Basic SzkwMTUwMTpXZWxjb21lQDEyMw==",
        },
        timeout: 15000,
      }
    );

    const match = response.data.match(/<PdfStringPs>(.*?)<\/PdfStringPs>/s);

    if (!match || !match[1]) {
      return res
        .status(500)
        .json({ error: "Failed to extract PDF content from SAP response." });
    }

    const base64PDF = match[1];
    res.json({ pdfBase64: base64PDF });
  } catch (error) {
    console.error("SAP request error:", error, message);
    res.status(500).json({
      error: "Error fetching invoice from SAP.",
      details: error.message,
    });
  }
});

//emails
app.post("/api/emailpayslip", async (req, res) => {
  const { employeeId, email } = req.body;

  try {
    const response = await axios.post(
      "https://AZKTLDS5CP.kcloud.com:44300/sap/bc/srt/scs/sap/zpmemp_payslip?sap-client=100",
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZpmempPayslip>
            <Pernr>${employeeId}</Pernr>
          </urn:ZpmempPayslip>
        </soapenv:Body>
      </soapenv:Envelope>`,
      {
        httpsAgent: agent,
        headers: {
          "Content-Type": "text/xml; charset=UTF-8",
          Authorization: "Basic SzkwMTUwMTpXZWxjb21lQDEyMw==",
        },
      }
    );

    const match = response.data.match(/<PdfStringPs>(.*?)<\/PdfStringPs>/s);
    if (!match || !match[1]) throw new Error("PDF not found");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "plmanognya@gmail.com",
        pass: SAP_CONFIG.MAIL_PWD,
      },
    });

    await transporter.sendMail({
      from: "plmanognya@gmail.com",
      to: email,
      subject: "Your Payslip for the month May 2025",
      text: "Please find attached your payslip for the month of May 2025. Let us know if you have any questions or require further information. Best Regards.",
      attachments: [
        {
          filename: `Payslip_${employeeId}.pdf`,
          content: Buffer.from(match[1], "base64"),
          encoding: "base64",
        },
      ],
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
