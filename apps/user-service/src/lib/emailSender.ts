import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendVerificationEmail(to: string, token: string) {
    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/v1/auth/verify-email/${token}`

    await transporter.sendMail({
        from: `"support Team" <${process.env.SMTP_USER}>`,
        to,
        subject: "verify your email address",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Welcome to Our App 🎉</h2>
            <p>Please confirm your email address by clicking the link below:</p>
            <a href="${verificationLink}" 
            style="background-color: #007bff; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none;">
            Verify Email
            </a>
            <p>If the button doesn’t work, copy and paste this link into your browser:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>This link will expire in 1 hour.</p>
        </div>
        `,
    })
}