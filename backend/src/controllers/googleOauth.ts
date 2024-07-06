import express, { Request, Response } from "express";

import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);

// Generate the URL for the authorization
export function getAuth(req: Request, res: Response) {
  try {
    const scopes = ["https://www.googleapis.com/auth/youtube.force-ssl"];
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
    console.log(url);
    res.redirect(url);
  } catch (err) {
    throw new Error("Failed to login");
  }
}

// Handle the OAuth 2.0 callback
export async function handleCallback(req: Request, res: Response) {
  try {
    const { code } = req.query;
    if (code) {
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);
      // Save the tokens for future use
      console.log("Access Token:", tokens.access_token);
      console.log("Refresh Token:", tokens.refresh_token);
      res.send("Authorization successful! You can close this tab.");
    } else {
      res.send("Authorization failed!");
    }
  } catch (err) {
    throw new Error("Error in handling callback");
  }
}
