import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const contactEmail = process.env.CONTACT_EMAIL_TO || process.env.GMAIL_USER || "lesptitsmijotes@gmail.com"
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase environment variables are missing." }, { status: 500 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const { name, email, phone, subject, message } = body || {}

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: inserted, error: insertError } = await supabase
    .from("contact_messages")
    .insert([
      {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        status: "new",
      },
    ])
    .select()
    .single()

  if (insertError) {
    console.error("[contact] Failed to save contact message:", insertError)
    return NextResponse.json({ error: "Unable to save your message right now." }, { status: 500 })
  }

  if (!smtpUser || !smtpPass) {
    console.error("[contact] SMTP credentials are not configured.")
    return NextResponse.json(
      {
        error: "Email non configure. Renseignez SMTP_USER et SMTP_PASS (ou GMAIL_USER et GMAIL_APP_PASSWORD).",
      },
      { status: 500 },
    )
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  try {
    await transporter.sendMail({
      from: `Les Ptits Mijotes <${smtpUser}>`,
      to: contactEmail,
      subject: subject || "Nouveau message de contact",
      text: `Vous avez recu un nouveau message de contact.\n\nNom: ${name}\nEmail: ${email}\nTelephone: ${phone || "Non renseigne"}\nSujet: ${subject || "Non renseigne"}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2 style="margin: 0 0 12px 0;">Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telephone:</strong> ${phone || "Non renseigne"}</p>
          <p><strong>Sujet:</strong> ${subject || "Non renseigne"}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
        </div>
      `,
    })
  } catch (emailError) {
    console.error("[contact] Email send failed:", emailError)
    return NextResponse.json({ error: "Message enregistre mais email non envoye." }, { status: 502 })
  }

  return NextResponse.json({ success: true, id: inserted?.id, emailSent: true, to: contactEmail })
}
