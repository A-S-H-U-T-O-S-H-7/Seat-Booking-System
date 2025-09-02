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
        // Send email directly using Nodemailer instead of external PHP API
        const { transporter } = await import('@/lib/nodemailer');
        
        const mailOptions = {
            from: process.env.SMTP_USER || 'noreply@svsamiti.com',
            to: email,
            subject: `${booking_type} - Booking Confirmation - Order #${order_id}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">🕉️ Booking Confirmed</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">SAMUDAYIK VIKAS SAMITI</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #2d3748; margin-bottom: 20px;">Dear ${name},</h2>
                    
                    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
                        Your booking has been confirmed! We're excited to have you join us for this sacred event.
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
                        <h3 style="color: #2d3748; margin-top: 0;">Booking Details</h3>
                        <p><strong>Order ID:</strong> ${order_id}</p>
                        <p><strong>Event:</strong> ${booking_type}</p>
                        <p><strong>Event Date:</strong> ${event_date}</p>
                        <p><strong>Amount Paid:</strong> ₹${amount}</p>
                        <p><strong>Mobile:</strong> ${mobile}</p>
                        <p><strong>Valid From:</strong> ${valid_from} to ${valid_to}</p>
                    </div>
                    
                    <div style="background: #e6fffa; padding: 15px; border-radius: 8px; border-left: 4px solid #38b2ac; margin-bottom: 20px;">
                        <p style="margin: 0; color: #2d3748;"><strong>Event Details:</strong></p>
                        <p style="margin: 5px 0 0 0; color: #4a5568; white-space: pre-line;">${details}</p>
                    </div>
                    
                    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
                        Please find your member pass attached to this email. You must present this pass at the event venue.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #2d3748; font-style: italic; font-size: 18px; margin: 0;">🙏 सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः</p>
                        <p style="color: #718096; font-size: 14px; margin: 5px 0 0 0;">May all be happy, may all be free from illness</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    
                    <p style="color: #718096; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated message. Please do not reply to this email.<br>
                        For support, contact us at support@svsamiti.com
                    </p>
                </div>
            </div>
            `,
            attachments: [
                {
                    filename: `Member_Pass_${order_id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };
        
        await transporter.sendMail(mailOptions);
        
        return NextResponse.json({ 
            status: true, 
            message: 'Booking confirmation email sent successfully with member pass attachment!' 
        });

    } catch (err) {
        return NextResponse.json({ status: false, errors: [err.message || 'Unknown error occurred'] });
    }
}
