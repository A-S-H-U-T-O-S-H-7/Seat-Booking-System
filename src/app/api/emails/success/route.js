import { NextResponse } from "next/server";
import { transporter } from "@/lib/nodemailer";

export async function POST(req) {
    try {
        const { to, subject, html } = await req.json();

        const info = await transporter.sendMail({
            from: `"SVSAMITI" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
