/**
 * POST /api/send-notification
 *
 * Sends FCM push notifications using the Firebase HTTP v1 API.
 * Uses a service account JWT to obtain a short-lived OAuth2 access token.
 */

import { NextResponse } from "next/server";

const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`;
const OAUTH_ENDPOINT = "https://oauth2.googleapis.com/token";
const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

// ── JWT helpers (no external deps) ───────────────────────────────────────────

function base64url(str) {
    return Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

/**
 * Safely normalizes the private key from .env.local whether unquoted, 
 * quoted, containing literal newlines, or escaped '\n' strings.
 */
function getFormattedPrivateKey() {
    let key = process.env.FIREBASE_PRIVATE_KEY || "";
    if (!key) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is missing.");
    }
    
    // Replace literal '\n' characters with actual line breaks
    if (key.includes("\\n")) {
        key = key.replace(/\\n/g, "\n");
    }

    return key;
}

async function signJWT(header, payload, privateKeyPem) {
    const enc = new TextEncoder();
    const headerB64 = base64url(JSON.stringify(header));
    const payloadB64 = base64url(JSON.stringify(payload));
    const signingInput = `${headerB64}.${payloadB64}`;

    // Extract raw base64 body of PKCS8 key
    const pemBody = privateKeyPem
        .replace(/-----BEGIN PRIVATE KEY-----/, "")
        .replace(/-----END PRIVATE KEY-----/, "")
        .replace(/\s+/g, "");

    const keyBuffer = Buffer.from(pemBody, "base64");

    const cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        keyBuffer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        enc.encode(signingInput)
    );

    const sigB64 = Buffer.from(signature)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    return `${signingInput}.${sigB64}`;
}

async function getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    const formattedPrivateKey = getFormattedPrivateKey();

    const jwt = await signJWT(
        { alg: "RS256", typ: "JWT" },
        {
            iss: process.env.FIREBASE_CLIENT_EMAIL,
            sub: process.env.FIREBASE_CLIENT_EMAIL,
            aud: OAUTH_ENDPOINT,
            iat: now,
            exp: now + 3600,
            scope: FCM_SCOPE,
        },
        formattedPrivateKey
    );

    const res = await fetch(OAUTH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OAuth token fetch failed: ${err}`);
    }

    const data = await res.json();
    return data.access_token;
}

// ── Send one FCM message ──────────────────────────────────────────────────────

async function sendOne(token, title, body, imageUrl, accessToken, extraData = {}) {
    const message = {
        token,
        notification: { title, body },
        android: {
            priority: "high",
            ...(extraData.packageName ? { restricted_package_name: extraData.packageName } : {}),
            notification: {
                sound: "default",
                channel_id: "school_notifications",
                ...(imageUrl ? { image: imageUrl } : {}),
            },
        },
        data: {
            ...extraData,
            ...(imageUrl ? { imageUrl } : {}),
        },
    };

    const res = await fetch(FCM_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    });

    const json = await res.json();
    return { ok: res.ok, status: res.status, body: json, token };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req) {
    try {
        const { 
            tokens, 
            title, 
            body, 
            imageUrl, 
            targetGroup, 
            targetId, 
            targetName, 
            packageName, 
            schoolId 
        } = await req.json();

        // Validate
        if (!Array.isArray(tokens) || tokens.length === 0) {
            return NextResponse.json({ error: "No tokens provided" }, { status: 400 });
        }
        if (!title || !body) {
            return NextResponse.json({ error: "title and body are required" }, { status: 400 });
        }

        // Get a fresh access token (valid for 1 hour)
        const accessToken = await getAccessToken();

        const extraData = {
            targetGroup: targetGroup || "all",
            targetId: targetId || "",
            targetName: targetName || "",
            packageName: packageName || "com.school.mvg",
            schoolId: schoolId || "",
        };

        // Send to all tokens concurrently
        const results = { success: 0, failure: 0, staleTokens: [] };
        const BATCH = 100;

        for (let i = 0; i < tokens.length; i += BATCH) {
            const chunk = tokens.slice(i, i + BATCH);
            const settled = await Promise.allSettled(
                chunk.map(t => sendOne(t, title, body, imageUrl, accessToken, extraData))
            );

            settled.forEach(result => {
                if (result.status === "fulfilled") {
                    const { ok, body: respBody, token } = result.value;
                    if (ok) {
                        results.success++;
                    } else {
                        results.failure++;
                        const errCode = respBody?.error?.details?.[0]?.errorCode || respBody?.error?.status;
                        if (
                            errCode === "UNREGISTERED" ||
                            errCode === "INVALID_ARGUMENT"
                        ) {
                            results.staleTokens.push(token);
                        }
                    }
                } else {
                    results.failure++;
                }
            });
        }

        return NextResponse.json({
            success: results.success,
            failure: results.failure,
            staleTokens: results.staleTokens,
            total: tokens.length,
            packageName: extraData.packageName,
            schoolId: extraData.schoolId
        });
    } catch (err) {
        console.error("[send-notification] error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}