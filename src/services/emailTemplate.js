export const emailTemplate = (emailSubject, name, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
    
    body {
      font-family: 'Orbitron', sans-serif;
      background-color: #000000;
      color: #ffffff;
      margin: 0;
      padding: 0;
      text-align: center;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #000000;
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
      overflow: hidden;
      padding: 30px;
      border: 2px solid rgba(0, 255, 255, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #00ff99, #00ccff);
      color: #000;
      padding: 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 20px;
    }
    .content p {
      margin: 15px 0;
      font-size: 16px;
      line-height: 1.8;
      color: #cccccc;
    }
    .highlight {
      color: #00ff99;
      font-weight: 700;
    }
    .otp-box {
      margin: 20px 0;
      padding: 15px;
      background: rgba(0, 255, 255, 0.2);
      border-radius: 8px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      color: #00ff99;
      letter-spacing: 4px;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
      border: 1px solid rgba(0, 255, 255, 0.4);
    }
    .footer {
      background: #111111;
      text-align: center;
      padding: 15px;
      font-size: 14px;
      color: #888888;
      border-radius: 0 0 12px 12px;
      border-top: 1px solid rgba(0, 255, 255, 0.3);
    }
    .footer a {
      color: #00ff99;
      text-decoration: none;
      font-weight: 500;
    }
    .footer a:hover {
      text-decoration: underline;
      color: #00ccff;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${emailSubject}</h1>
    </div>
    <div class="content">
      <p>Hi <span class="highlight">${name}</span>,</p>
      ${body}
    </div>
    <div class="footer">
      <p>&copy; 2025 Job Search App. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
`;
