import { PAGES_DATA } from '@/data/pagesData';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email Styles
const BRAND_COLOR = '#00C16A'; // Primary Brand Green
const BRAND_GRADIENT = 'linear-gradient(135deg, #00C16A 0%, #009B55 100%)';
const BRAND_TEXT_COLOR = '#009B55';

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
                    <div style="background: ${BRAND_GRADIENT}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            You requested to reset your password for your FUDEX account. Use the verification code below to continue:
                        </p>
                        
                        <div style="background: white; border: 2px solid ${BRAND_COLOR}; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                            <p style="font-size: 36px; font-weight: bold; color: ${BRAND_COLOR}; margin: 0; letter-spacing: 8px;">${otp}</p>
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
                    <div style="background: ${BRAND_GRADIENT}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Welcome to FUDEX!</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            To complete your registration, please verify your email address using the code below:
                        </p>
                        
                        <div style="background: white; border: 2px solid ${BRAND_COLOR}; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                            <p style="font-size: 36px; font-weight: bold; color: ${BRAND_COLOR}; margin: 0; letter-spacing: 8px;">${otp}</p>
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

export async function sendVendorApprovalEmail(email: string, businessName: string, from: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `FUDEX <${from}>`,
            to: [email],
            subject: '🎉 Your FUDEX Vendor Account Has Been Approved!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Vendor Approved</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: ${BRAND_GRADIENT}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Great news!</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            Your vendor account for <strong>${businessName}</strong> has been approved by our team. You're now live on FUDEX!
                        </p>
                        
                        <div style="background: white; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 30px 0; border-radius: 4px;">
                            <p style="font-size: 16px; margin: 0; color: ${BRAND_TEXT_COLOR};">
                                <strong>What's next?</strong>
                            </p>
                            <ul style="margin: 10px 0 0 20px; padding: 0;">
                                <li>Customers can now discover your store</li>
                                <li>Start receiving orders immediately</li>
                                <li>Manage your menu and operations from your dashboard</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}${PAGES_DATA.vendor_dashboard_page}" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            Thank you for choosing FUDEX. We're excited to have you on board!
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

export async function sendVendorDeclineEmail(email: string, businessName: string, reason: string, from: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `FUDEX <${from}>`,
            to: [email],
            subject: 'Update on Your FUDEX Vendor Application',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Vendor Application Update</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: ${BRAND_GRADIENT}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Application Update</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            Thank you for your interest in becoming a vendor on FUDEX with <strong>${businessName}</strong>.
                        </p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            After reviewing your application, we're unable to approve your vendor account at this time.
                        </p>
                        
                        <div style="background: #fff3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                            <p style="font-size: 14px; margin: 0 0 10px 0; color: #856404; font-weight: bold;">
                                Reason:
                            </p>
                            <p style="font-size: 14px; margin: 0; color: #856404;">
                                ${reason}
                            </p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            You're welcome to address the concerns mentioned above and resubmit your application. We review each application carefully to ensure quality service for our customers.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor-onboarding/personal-details" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Resubmit Application</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            If you have any questions or need clarification, please contact our support team.
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

export async function sendVendorSubmissionConfirmation(email: string, businessName: string, from: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `FUDEX <${from}>`,
            to: [email],
            subject: 'Application Submitted - FUDEX Vendor Review',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Application Submitted</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: ${BRAND_GRADIENT}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Application Received!</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Thank you for submitting your application!</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            We've received your vendor application for <strong>${businessName}</strong> and our team is now reviewing it.
                        </p>
                        
                        <div style="background: white; border: 2px solid ${BRAND_COLOR}; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style="font-size: 14px; color: #666; margin: 0 0 15px 0;">
                                <strong style="color: ${BRAND_TEXT_COLOR};">What happens next?</strong>
                            </p>
                            <ol style="margin: 0; padding-left: 20px; color: #666;">
                                <li style="margin-bottom: 10px;">Our team will review your application and documentation</li>
                                <li style="margin-bottom: 10px;">You'll receive an email with our decision within 24-48 hours</li>
                                <li>Once approved, your store will be live on FUDEX!</li>
                            </ol>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            In the meantime, you can continue setting up your vendor dashboard. Your store won't be visible to customers until approved.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}${PAGES_DATA.vendor_dashboard_page}" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
                        </div>
                        
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

export async function sendAdminNewVendorNotification(adminEmail: string, businessName: string, vendorEmail: string, from: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `FUDEX <${from}>`,
            to: [adminEmail],
            subject: '🔔 New Vendor Application Pending Review',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Vendor Application</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: ${BRAND_GRADIENT}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">New Vendor Application</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">A new vendor application requires your review.</p>
                        
                        <div style="background: white; border: 2px solid ${BRAND_COLOR}; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
                                <strong>Business Name:</strong> ${businessName}
                            </p>
                            <p style="font-size: 14px; color: #666; margin: 0;">
                                <strong>Email:</strong> ${vendorEmail}
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/vendors/pending" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review Application</a>
                        </div>
                        
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

export async function sendVendorNewOrderEmail(email: string, businessName: string, orderId: string, amount: number, currency: string, from: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: `FUDEX <${from}>`,
            to: [email],
            subject: '🛍️ New Order Received!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Order Received</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: ${BRAND_GRADIENT}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">New Order! 🛍️</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${businessName}</strong>,</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            You have received a new order on FUDEX! The payment has been confirmed.
                        </p>
                        
                        <div style="background: white; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 30px 0; border-radius: 4px;">
                            <p style="font-size: 16px; margin: 0 0 10px 0;">
                                <strong>Order Details:</strong>
                            </p>
                            <p style="font-size: 14px; margin: 0 0 5px 0; color: #555;">
                                Order ID: <strong>#${orderId.slice(0, 8)}</strong>
                            </p>
                            <p style="font-size: 14px; margin: 0; color: #555;">
                                Amount: <strong>${currency} ${amount.toLocaleString()}</strong>
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}${PAGES_DATA.vendor_dashboard_new_orders_page}" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                            Please verify the order details in your dashboard and start preparation.
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

export async function sendOperatorNewOrderEmail(
    emails: string[],
    vendorName: string,
    vendorAddress: string,
    customerName: string,
    customerAddress: string,
    orderId: string,
    amount: number,
    currency: string,
    from: string
) {
    try {
        const { data, error } = await resend.emails.send({
            from: `FUDEX <${from}>`,
            to: emails,
            subject: '🚨 New Order Alert!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Order Alert</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: ${BRAND_GRADIENT}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">New Order! 🚨</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hello Operator,</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            A new order has been placed on FUDEX that requires your attention.
                        </p>
                        
                        <div style="background: white; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 15px 0; border-radius: 4px;">
                            <p style="font-size: 16px; margin: 0 0 10px 0;">
                                <strong>Vendor Details:</strong>
                            </p>
                            <p style="font-size: 14px; margin: 0 0 5px 0; color: #555;">
                                Name: <strong>${vendorName}</strong>
                            </p>
                             <p style="font-size: 14px; margin: 0 0 5px 0; color: #555;">
                                Address: <strong>${vendorAddress}</strong>
                            </p>
                        </div>

                        <div style="background: white; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 15px 0; border-radius: 4px;">
                            <p style="font-size: 16px; margin: 0 0 10px 0;">
                                <strong>Customer Details:</strong>
                            </p>
                            <p style="font-size: 14px; margin: 0 0 5px 0; color: #555;">
                                Name: <strong>${customerName}</strong>
                            </p>
                            <p style="font-size: 14px; margin: 0 0 5px 0; color: #555;">
                                Address: <strong>${customerAddress}</strong>
                            </p>
                        </div>
                        
                        <div style="background: white; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 30px 0; border-radius: 4px;">
                            <p style="font-size: 16px; margin: 0 0 10px 0;">
                                <strong>Order Details:</strong>
                            </p>
                            <p style="font-size: 14px; margin: 0 0 5px 0; color: #555;">
                                Order ID: <strong>#${orderId.slice(0, 8)}</strong>
                            </p>
                            <p style="font-size: 14px; margin: 0; color: #555;">
                                Amount: <strong>${currency} ${amount.toLocaleString()}</strong>
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/operator/dashboard" style="display: inline-block; background: ${BRAND_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order</a>
                        </div>
                        
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
