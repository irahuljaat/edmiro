import { db } from '../../firebase/config';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getFormattedPrivateKey() {
    let key = process.env.FIREBASE_PRIVATE_KEY || "";
    if (!key) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is missing.");
    }
    if (key.includes("\\n")) {
        key = key.replace(/\\n/g, "\n");
    }
    return key;
}

function initFirebaseAdmin() {
    if (!getApps().length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: getFormattedPrivateKey(),
            }),
        });
    }
}

export async function GET(request) {
    try {
        initFirebaseAdmin();

        // 1. Get all school branches under 'Data'
        const dataColSnap = await getDocs(collection(db, "Data"));
        let totalSent = 0;
        let totalProcessedNotices = 0;

        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);

        for (const schoolDoc of dataColSnap.docs) {
            const schoolId = schoolDoc.id;

            // Fetch school config & package name
            const schoolDetailsSnap = await getDoc(doc(db, "Data", schoolId, "config", "schoolDetails"));
            let packageName = "com.school.mvg";
            if (schoolDetailsSnap.exists()) {
                const sData = schoolDetailsSnap.data();
                packageName = sData.packageName || sData.appPackageName || packageName;
            }

            const settingsSnap = await getDoc(doc(db, "Data", schoolId, "config", "settings"));
            const activeSession = settingsSnap.exists()
                ? (settingsSnap.data().activeSession || settingsSnap.data().session || "2026-27")
                : "2026-27";

            // Fetch notices under Data -> {schoolId} -> sessions -> {activeSession} -> notices
            const noticesSnap = await getDocs(collection(db, "Data", schoolId, "sessions", activeSession, "notices"));

            for (const noticeDoc of noticesSnap.docs) {
                const docData = noticeDoc.data();
                let docNeedsUpdate = false;
                const updatedDocData = { ...docData };

                for (const dateKey of Object.keys(docData)) {
                    const group = docData[dateKey];
                    if (typeof group !== "object" || !group) continue;

                    for (const tsKey of Object.keys(group)) {
                        const notice = group[tsKey];
                        if (notice && notice.fcmStatus === "scheduled" && notice.scheduledFor) {
                            const scheduledTime = new Date(notice.scheduledFor);

                            // Process if schedule time is met/passed
                            if (!isNaN(scheduledTime.getTime()) && scheduledTime <= istNow) {
                                totalProcessedNotices++;

                                // Resolve tokens for notice target
                                let tokens = [];
                                const stuSnap = await getDocs(
                                    collection(db, "Data", schoolId, "sessions", activeSession, "students")
                                );

                                if (notice.targetGroup === "all") {
                                    tokens = stuSnap.docs.map(d => d.data().fcmToken).filter(Boolean);
                                } else if (notice.targetGroup === "class") {
                                    tokens = stuSnap.docs
                                        .filter(d => d.data().grade === notice.targetId)
                                        .map(d => d.data().fcmToken)
                                        .filter(Boolean);
                                } else if (notice.targetGroup === "single") {
                                    const match = stuSnap.docs.find(d => d.id === notice.targetId);
                                    if (match?.data().fcmToken) tokens = [match.data().fcmToken];
                                } else if (notice.targetGroup === "teachers") {
                                    const tchSnap = await getDocs(collection(db, "Data", schoolId, "teachers"));
                                    if (notice.targetId === "all") {
                                        tokens = tchSnap.docs.map(d => d.data().fcmToken).filter(Boolean);
                                    } else {
                                        const match = tchSnap.docs.find(d => d.id === notice.targetId);
                                        if (match?.data().fcmToken) tokens = [match.data().fcmToken];
                                    }
                                }

                                const uniqueTokens = [...new Set(tokens.filter(t => typeof t === "string" && t.trim()))];

                                let successCount = 0;
                                let failureCount = 0;

                                if (uniqueTokens.length > 0) {
                                    const messaging = getMessaging();
                                    const messages = uniqueTokens.map(t => ({
                                        token: t,
                                        notification: {
                                            title: notice.title,
                                            body: notice.body,
                                        },
                                        android: {
                                            priority: "high",
                                            restrictedPackageName: packageName,
                                            notification: {
                                                sound: "default",
                                                channelId: "school_notifications",
                                                ...(notice.imageUrl ? { image: notice.imageUrl } : {}),
                                            },
                                        },
                                        data: {
                                            targetGroup: notice.targetGroup || "all",
                                            targetId: notice.targetId || "",
                                            targetName: notice.targetName || "",
                                            packageName: packageName,
                                            schoolId: schoolId,
                                            ...(notice.imageUrl ? { imageUrl: notice.imageUrl } : {}),
                                        },
                                    }));

                                    const response = await messaging.sendEach(messages);
                                    successCount = response.successCount;
                                    failureCount = response.failureCount;
                                    totalSent += successCount;
                                }

                                // Update notice status
                                updatedDocData[dateKey][tsKey] = {
                                    ...notice,
                                    fcmStatus: uniqueTokens.length === 0 ? "sent_no_tokens" : "sent",
                                    successCount,
                                    failureCount,
                                    dispatchedAt: new Date().toISOString(),
                                };
                                docNeedsUpdate = true;
                            }
                        }
                    }
                }

                if (docNeedsUpdate) {
                    await updateDoc(doc(db, "Data", schoolId, "sessions", activeSession, "notices", noticeDoc.id), updatedDocData);
                }
            }
        }

        return NextResponse.json({
            success: true,
            processedNotices: totalProcessedNotices,
            sentNotifications: totalSent,
            message: `Processed ${totalProcessedNotices} scheduled notice(s) and dispatched ${totalSent} notification(s).`,
        });

    } catch (error) {
        console.error("Error processing scheduled notices:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}