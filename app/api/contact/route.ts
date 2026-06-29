import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import pool from "@/lib/postgresql"
import { createEmailTemplate, createEmailSection } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Persist the message so the admin can read it in the dashboard, even if
    // email delivery is unavailable.
    try {
      await pool.query(
        `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)`,
        [name, email, subject, message]
      )
    } catch (dbError) {
      console.error("❌ [Contact] Failed to store message:", dbError)
    }

    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS

    // If email isn't configured, the message is still saved to the dashboard.
    if (!process.env.EMAIL_USER || !emailPassword) {
      console.warn("⚠️ [EMAIL] Email not configured; message saved to dashboard only")
      return NextResponse.json({ success: true, message: "Message received successfully" })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // STARTTLS (not SSL)
      auth: {
        user: process.env.EMAIL_USER,
        pass: emailPassword,
      },
    })


    // Create email content sections
    const headerSection = createEmailSection({
      content: `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1>New Contact Form Submission</h1>
          <p style="font-size: 18px;">Sense Fragrances Website</p>
        </div>
      `
    })

    const contactDetailsSection = createEmailSection({
      title: "Customer Information",
      highlight: true,
      content: `
        <div class="email-card" style="margin: 15px 0;">
          <div style="margin-bottom: 15px;">
            <strong style="color: currentColor;">Name:</strong>
            <div style="margin-top: 5px; padding: 10px; background-color: rgba(0,0,0,0.05); border-radius: 6px;">
              ${name}
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: currentColor;">Email:</strong>
            <div style="margin-top: 5px; padding: 10px; background-color: rgba(0,0,0,0.05); border-radius: 6px;">
              <a href="mailto:${email}" style="color: currentColor; text-decoration: none;">${email}</a>
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: currentColor;">Subject:</strong>
            <div style="margin-top: 5px; padding: 10px; background-color: rgba(0,0,0,0.05); border-radius: 6px;">
              ${subject}
            </div>
          </div>
        </div>
      `
    })

    const messageSection = createEmailSection({
      title: "Message",
      content: `
        <div style="padding: 20px; background-color: rgba(0,0,0,0.05); border-radius: 8px; line-height: 1.8; white-space: pre-wrap;">${message}</div>
        
        <hr class="divider">
        
        <div class="email-card" style="background-color: #e0f2fe; border-left-color: #0284c7; margin-top: 20px;">
          <p style="margin: 0;"><strong>Action Required:</strong></p>
          <p style="margin: 10px 0 0 0;">Please reply directly to the customer's email: <a href="mailto:${email}" style="color: currentColor;">${email}</a></p>
        </div>
      `
    })

    const emailContent = headerSection + contactDetailsSection + messageSection

    const htmlContent = createEmailTemplate({
      title: "New Contact Form Submission",
      preheader: `New message from ${name} - ${subject}`,
      content: emailContent,
      theme: { mode: 'light' },
      includeUnsubscribe: false
    })

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      html: htmlContent,
      replyTo: email,
    })

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
