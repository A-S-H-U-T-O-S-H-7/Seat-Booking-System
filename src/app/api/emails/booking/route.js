import puppeteer from "puppeteer";
import { NextResponse } from "next/server";
export async function POST(req) {
    try {
        const { name, email, order_id, details, event_date, booking_type, amount, mobile, address, pan, valid_from, valid_to } = await req.json();

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        const html = `
      <html>

<head>
  <style>
    body {
      margin: 20;
      font-family: Arial, sans-serif;
    }

    .card {
      width: 100%;
      height: 400px;
      border-radius: 5px;
      overflow: hidden;
      display: flex;
      border: 2px solid #fdba74;
      box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    }

    .left {
      flex: 2;
      background: linear-gradient(to bottom right, #fffbeb, #fef3c7, #ffedd5);
      padding: 20px;
      position: relative;
    }

    .left h2 {
      margin: 0;
      font-size: 22px;
      color: #002060;
      text-align: center;
    }

   .left h3 {
      color: green;
      text-align: center;
      margin: 10px 0;
      font-size: 30px;
      font-weight: bold;
      letter-spacing: 2px;
    }

    .left h4 {
      color: red;
      text-align: center;
      margin: 5px 5px;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 2px;
    }

    .left p.person {
      text-align: center;
      font-size: 24px;
      margin-top: 50px;
    }
    .left p.purpose {
      text-align: center;
      font-size: 22px;
      margin-top: -18px;
    }
    .left .valid {
      text-align: center;
      font-size: 14px;
      margin-top: -5px;
    }

    .left img.deity {
      position: absolute;
      bottom: 50px;
      left: 50px;
      height: 300px;
    }

    .right {
      flex: 1;
      background: linear-gradient(180deg, #f44336, #d32f2f);
      color: white;
      text-align: center;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .right .temple {
      width: 100px;
      height: 100px;
      border: 1px solid #fff;
      background: #fff;
      border-radius: 50px;
    }

    .right h3 {
      font-size: 22px;
      letter-spacing: 2px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .right img.qr {
      margin: 15px 0;
      width: 120px;
      height: 120px;
      border: 10px solid #fff;
    }

    .right p {
      font-size: 12px;
      margin: 2px 0;
    }

    .card-second {
      margin-top: 30px;
      width: 100%;
      border-radius: 5px;
      border: 2px solid #fdba74;
      background: linear-gradient(to bottom right, #fff7ed, #ffedd5);
      box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }

    .card-second h2 {
      text-align: center;
      font-style: italic;
      font-size: 20px;
      margin-bottom: 15px;
      color: #b91c1c;
      border-bottom: 1px dashed #fdba74;
      padding-bottom: 5px;
    }

    .card-second ul {
      margin: 10px;
      padding-left: 20px;
    }

    .card-second li {
      margin-bottom: 8px;
      text-align: justify;
      font-style: italic;
    }

    .card-inner {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }

    .card-inner img {
      width: 50px;
      height: 50px;
      padding: 5px;
      border-radius: 30px;
      border: 2px solid #fdba74;
      background: linear-gradient(to bottom right, #fffbeb, #fef3c7, #ffedd5);
    }
    .left img.lefttop {
    position: absolute;
    top: 0;
    left: 0;
    width: 120px;  
    height: auto;
    }

.left img.rightto {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: auto;
}

.left img.leftbottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 120px;
  height: auto;
}

.left img.rightbottom {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 120px;
  height: auto;
}
  .lefttext{
    position: absolute;
    top:90px;
    left:230px;
  }
  </style>
</head>

<body>
  <div class="card">
    <!-- Left Side -->
    <div class="left">
      <div class="card-inner">
        <img
          src="https://svsamiti.com/havan-booking/images/pdf/logo-1svs-removebg-preview-Picsart-AiImageEnhancer.png" />
        <h2>SAMUDAYIK VIKAS SAMITI</h2>
      </div>
        <div class="lefttext">
            <h3>International</h3> 
            <h4>Śrī Jagannātha Pāñcharātra <br /> Havan Ceremony</h4>
            <p class="person"><b>${name}</b></p>
            <p class="purpose">Purpose: Cultural Event</p>
            <p class="valid">Valid From: ${valid_from} - ${valid_to}</p>
        </div>
        <img src="https://svsamiti.com/havan-booking/images/pdf/b498a96f847d1d2cf476e12e1b8c7d8e-removebg-preview.png"
        class="deity" />
        <img src="https://svsamiti.com/havan-booking/images/pdf/lefttop.png"
        class="lefttop" />
        <img src="https://svsamiti.com/havan-booking/images/pdf/righttop.png"
        class="rightto" />
        <img src="https://svsamiti.com/havan-booking/images/pdf/leftbottom.png"
        class="leftbottom" />
        <img src="https://svsamiti.com/havan-booking/images/pdf/rightbottom.png"
        class="rightbottom" />
    </div>

    <!-- Right Side -->
    <div class="right">
      <img src="https://svsamiti.com/havan-booking/images/pdf/istockphoto-451584323-612x612-removebg-preview.png"
        class="temple" />
      <h3>MEMBER PASS</h3>  

      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
            " SVS PASS | Name: " + name + " | Email: " + email + " | Reservation ID: " + order_id + " | Details: " + details + " | Event Date: " + event_date + " | Purpose: " + booking_type + " | Amount: " + amount + " | Mobile: " + mobile + " | Valid From: " + valid_from + " | Valid To: " + valid_to
        )}" class="qr" />
      <p>सर्वे भवन्तु सुखिनः</p>
      <p>सर्वे सन्तु निरामयाः</p>
      <p>May all be happy, may all be free from illness</p>
    </div>
  </div>

  <div class="card-second">
    <h2>Terms & Conditions</h2>
    <ul>
      <li>For security reasons, firearms, cameras, audio and video recorders are strictly not permitted inside the
        venue.</li>
      <li>The complimentary pass (valid for one person only) must be produced for entry to any event.</li>
      <li>The organizers reserve the right to add, withdraw or substitute artists and/or vary advertised programs,
        prices, venues, seating arrangements, and audience capacity without prior notice.</li>
      <li>Admission is subject to the organizers and the venue’s terms of admission. Late arrivals may result in
        non-admittance until a suitable break in the performance.</li>
      <li>It may be a condition of entry that a search of person and/or their possessions is required at the time of
        entry.</li>
      <li>Entry may be refused if passes are damaged, defaced, or not issued by the organizers.</li>
    </ul>
  </div>

</body>

</html>
         `;

        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            landscape: true,
            printBackground: true,
        });

        await browser.close();
        const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("order_id", order_id);
        formData.append("details", details);
        formData.append("event_date", event_date);
        formData.append("booking_type", booking_type);
        formData.append("amount", amount);
        formData.append("mobile", mobile);
        formData.append("address", address);
        formData.append("pan", pan);
        formData.append("valid_from", valid_from);
        formData.append("valid_to", valid_to);
        formData.append("member_pass", pdfBlob, `member_pass.pdf`);

        const resp = await fetch("https://svsamiti.com/havan-booking/email.php", {
            method: "POST",
            body: formData,
        });

        const result = await resp.json();

        if (result.status === true) {
            return NextResponse.json({ success: true, message: result.message });
        } else {
            return NextResponse.json({ success: false, message: result.message });
        }

    } catch (err) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
