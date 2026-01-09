import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, otp: string, from: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `FUDEX <${from}>`,
            to: [email],
            subject: 'Reset Your FUDEX Password',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Password</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            You requested to reset your password for your FUDEX account. Use the verification code below to continue:
                        </p>
                        
                        <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                            <p style="font-size: 36px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px;">${otp}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            This code will expire in <strong>5 minutes</strong> for security reasons.
                        </p>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            © ${new Date().getFullYear()} FUDEX. All rights reserved.<br>
                            This is an automated email, please do not reply.
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export async function sendEmailVerification(email: string, otp: string, from: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `FUDEX <${from}>`,
            to: [email],
            subject: 'Verify Your FUDEX Email',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Welcome to FUDEX!</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            To complete your registration, please verify your email address using the code below:
                        </p>
                        
                        <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                            <p style="font-size: 36px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px;">${otp}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            This code will expire in <strong>5 minutes</strong> for security reasons.
                        </p>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            If you didn't create a FUDEX account, you can safely ignore this email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            © ${new Date().getFullYear()} FUDEX. All rights reserved.<br>
                            This is an automated email, please do not reply.
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}