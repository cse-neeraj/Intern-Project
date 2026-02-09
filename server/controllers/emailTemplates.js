export const getBackInStockEmailTemplate = (productName, productUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #22c55e; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Good News!</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #333333; margin-top: 0; font-size: 20px;">${productName} is Back in Stock!</h2>
        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          The item you were waiting for is now available. Hurry up and grab it before it runs out again!
        </p>
        <div style="text-align: center;">
          <a href="${productUrl}" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            View Product
          </a>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="color: #888888; font-size: 12px; margin: 0;">You received this email because you requested to be notified when this product is back in stock.</p>
        <p style="color: #888888; font-size: 12px; margin: 5px 0 0;">&copy; ${new Date().getFullYear()} BuyFresh. All rights reserved.</p>
      </div>
    </div>
  `;
};