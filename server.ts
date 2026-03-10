import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google OAuth
  app.get('/api/auth/google/url', (req, res) => {
    const redirectUri = `${process.env.APP_URL}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  app.get(['/api/auth/google/callback', '/api/auth/google/callback/'], async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('No code provided');
    }

    try {
      const redirectUri = `${process.env.APP_URL}/api/auth/google/callback`;
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || 'Failed to get token');
      }

      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      
      const userData = await userResponse.json();

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  provider: 'google',
                  user: {
                    name: '${userData.name}',
                    email: '${userData.email}'
                  }
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // Apple OAuth
  app.get('/api/auth/apple/url', (req, res) => {
    const redirectUri = `${req.headers.origin || process.env.APP_URL}/api/auth/apple/callback`;
    const params = new URLSearchParams({
      client_id: process.env.APPLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code id_token',
      scope: 'name email',
      response_mode: 'form_post'
    });
    
    res.json({ url: `https://appleid.apple.com/auth/authorize?${params.toString()}` });
  });

  app.post(['/api/auth/apple/callback', '/api/auth/apple/callback/'], express.urlencoded({ extended: true }), async (req, res) => {
    const { code, id_token, user } = req.body;
    
    if (!id_token) {
      return res.status(400).send('No token provided');
    }

    try {
      // In a real app, you'd verify the id_token signature and fetch user details.
      // Apple only sends the 'user' object (name/email) on the FIRST login.
      // For this demo, we'll extract email from the JWT (id_token) payload.
      
      const payloadBase64 = id_token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
      
      let name = 'Usuario de Apple';
      let email = payload.email || '';

      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.name) {
            name = `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim();
          }
        } catch (e) {}
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  provider: 'apple',
                  user: {
                    name: '${name}',
                    email: '${email}'
                  }
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Apple OAuth Error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
