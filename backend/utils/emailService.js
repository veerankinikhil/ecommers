import nodemailer from 'nodemailer';

// Helper to create mail transporter
const getMailTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return null;
};

// Generic mail sender
export const sendHtmlEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = getMailTransporter();
    if (!transporter) {
      console.log(`⚠️ [Email Service]: Nodemailer is not configured. Falling back to console logger.`);
      console.log(`To: ${to}\nSubject: ${subject}\nContent: ${htmlContent}`);
      return false;
    }

    const fromEmail = process.env.SMTP_USER || process.env.GMAIL_USER;
    const info = await transporter.sendMail({
      from: `"NovaKart Delivery" <${fromEmail}>`,
      to,
      subject,
      html: htmlContent
    });
    console.log(`✅ [Email Service]: Email sent successfully. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ [Email Service]: Failed to send email to ${to}:`, error.message);
    return false;
  }
};

// 1. Order Confirmed Mail Template
export const sendOrderPlacedEmail = async (email, order, expectedDate) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid var(--secondary-color); padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #ff9900; margin: 0;">NovaKart Order Confirmed!</h2>
        <p style="color: #64748b; margin: 5px 0 0;">Thank you for shopping with us.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Estimated Delivery Date:</strong> <span style="color: #2e7d32; font-weight: bold;">${expectedDate}</span></p>
      </div>

      <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td style="padding: 10px; font-weight: bold; border-top: 2px solid #e2e8f0;">Shipping Fee:</td>
            <td style="padding: 10px; font-weight: bold; border-top: 2px solid #e2e8f0; text-align: right;">₹${order.shippingFee}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #2e7d32;">Discount Applied:</td>
            <td style="padding: 10px; font-weight: bold; color: #2e7d32; text-align: right;">-₹${order.discount}</td>
          </tr>
          ` : ''}
          <tr style="font-size: 1.15rem; font-weight: bold; color: #1e293b;">
            <td style="padding: 10px; border-top: 2px solid #e2e8f0;">Total Payable:</td>
            <td style="padding: 10px; border-top: 2px solid #e2e8f0; text-align: right;">₹${order.totalAmount}</td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 0.9rem;">
        <strong>Shipping Address:</strong><br/>
        ${order.deliveryAddress.fullName}<br/>
        ${order.deliveryAddress.street}<br/>
        ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.postalCode}<br/>
        Phone: ${order.deliveryAddress.phone}
      </div>

      <div style="text-align: center; color: #94a3b8; font-size: 0.78rem; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        This is an automated shipping notification from your NovaKart secure checkout system.
      </div>
    </div>
  `;

  await sendHtmlEmail(email, `🛒 Order Placed Successfully: ${order.orderNumber}`, html);
};

// 2. Order Status Update Template
export const sendOrderStatusUpdateEmail = async (email, order, status, note, expectedDate) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid var(--secondary-color); padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #ff9900; margin: 0;">Order Status Update</h2>
        <p style="color: #64748b; margin: 5px 0 0;">Your NovaKart order has a new update.</p>
      </div>

      <div style="margin-bottom: 20px; line-height: 1.6;">
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>New Status:</strong> <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 0.8rem;">${status}</span></p>
        ${note ? `<p><strong>Update Note:</strong> ${note}</p>` : ''}
        ${expectedDate ? `<p><strong>Expected Delivery:</strong> <span style="color: #2e7d32; font-weight: bold;">${expectedDate}</span></p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/orders/${order._id}/track" style="background-color: #ff9900; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Order</a>
      </div>

      <div style="text-align: center; color: #94a3b8; font-size: 0.78rem; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        Need help? Contact support or track real-time delivery agents on our website.
      </div>
    </div>
  `;

  await sendHtmlEmail(email, `📦 Order ${order.orderNumber} Status Updated: ${status}`, html);
};

// 3. Gift Card Earned Template
export const sendGiftCardEmail = async (email, giftCard) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; text-align: center;">
      <div style="font-size: 4rem; margin-bottom: 10px;">🎁</div>
      <h2 style="color: #ff9900; margin: 0 0 10px;">You've Received a ₹50 Gift Card!</h2>
      <p style="color: #64748b; font-size: 1.05rem; margin-bottom: 24px;">Thank you for placing an order above ₹1000 on NovaKart. Here is your reward!</p>

      <div style="background: linear-gradient(135deg, #ff9900, #ff5500); color: white; border-radius: 12px; padding: 24px; display: inline-block; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(255, 85, 0, 0.25);">
        <span style="font-size: 0.85rem; letter-spacing: 2px; text-transform: uppercase; opacity: 0.85;">GIFT CARD CODE</span><br/>
        <strong style="font-size: 2.2rem; letter-spacing: 1px; display: block; margin: 8px 0;">${giftCard.code}</strong>
        <span style="font-size: 0.9rem; font-weight: bold; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px;">VALUE: ₹50</span>
      </div>

      <div style="font-size: 0.9rem; color: #4b5563; margin-bottom: 24px; line-height: 1.5;">
        Valid for 30 days until <span style="font-weight: bold; color: #ef4444;">${new Date(giftCard.expiryDate).toLocaleDateString()}</span>.<br/>
        You can apply this code during checkout to get an instant ₹50 discount on your next order!
      </div>

      <div style="text-align: center; color: #94a3b8; font-size: 0.78rem; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        NovaKart secure rewards and offers panel.
      </div>
    </div>
  `;

  await sendHtmlEmail(email, `🎁 Congratulations! You've earned a ₹50 Gift Card!`, html);
};
