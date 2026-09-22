import { db } from '../../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

        // 1. Get today's date in MM-DD format adjusted for IST
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const currentMonth = String(istDate.getMonth() + 1).padStart(2, '0');
        const currentDay = String(istDate.getDate()).padStart(2, '0');
        const todayMD = `${currentMonth}-${currentDay}`;

        let totalSentCount = 0;

        // 2. Fetch all school branches under Data
        const dataColSnap = await getDocs(collection(db, "Data"));

        for (const schoolDoc of dataColSnap.docs) {
            const schoolId = schoolDoc.id;

            // Fetch package name from Data -> {schoolId} -> config -> schoolDetails
            const schoolDetailsSnap = await getDoc(doc(db, "Data", schoolId, "config", "schoolDetails"));
            let packageName = "com.school.mvg";
            if (schoolDetailsSnap.exists()) {
                const sData = schoolDetailsSnap.data();
                packageName = sData.packageName || sData.appPackageName || packageName;
            }

            // Fetch active session from Data -> {schoolId} -> config -> settings
            const settingsSnap = await getDoc(doc(db, "Data", schoolId, "config", "settings"));
            const session = settingsSnap.exists()
                ? (settingsSnap.data().activeSession || settingsSnap.data().session || "2026-27")
                : "2026-27";

            // Fetch custom birthday template from Data -> {schoolId} -> config -> birthdaySettings
            const templateDoc = await getDoc(doc(db, "Data", schoolId, "config", "birthdaySettings"));
            const defaultTitle = "🎂 Happy Birthday!";
            const defaultMessage = "Happy Birthday, {name}! 🎉 Wishing you a wonderful year ahead.";

            const notificationTitle = templateDoc.exists() && templateDoc.data().title
                ? templateDoc.data().title
                : defaultTitle;
            const messageTemplate = templateDoc.exists() && templateDoc.data().message
                ? templateDoc.data().message
                : defaultMessage;

            // Fetch students from Data -> {schoolId} -> sessions -> {session} -> students
            const studentsSnap = await getDocs(collection(db, "Data", schoolId, "sessions", session, "students"));

            for (const studentDoc of studentsSnap.docs) {
                const data = studentDoc.data();

                if (data.dob && data.fcmToken) {
                    const parts = String(data.dob).trim().split('-');
                    if (parts.length === 3) {
                        const bMonth = parts[1];
                        const bDay = parts[2];
                        const studentMD = `${bMonth}-${bDay}`;

                        if (studentMD === todayMD) {
                            const studentName = data.name || data.studentName || data.fullName || "Student";
                            const personalizedBody = messageTemplate.replace(/{name}/g, studentName);

                            try {
                                await getMessaging().send({
                                    token: data.fcmToken,
                                    notification: {
                                        title: notificationTitle,
                                        body: personalizedBody,
                                    },
                                    android: {
                                        priority: "high",
                                        restrictedPackageName: packageName,
                                        notification: {
                                            sound: "default",
                                            channelId: "school_notifications",
                                        },
                                    },
                                    data: {
                                        type: "birthday",
                                        studentId: studentDoc.id,
                                        packageName: packageName,
                                        schoolId: schoolId,
                                    },
                                });
                                totalSentCount++;
                            } catch (fcmError) {
                                console.error(`Failed to send birthday push to ${studentName} (${schoolId}):`, fcmError);
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully sent ${totalSentCount} birthday wish notification(s) across all branches for today (${todayMD}).`
        });

    } catch (error) {
        console.error('Error processing birthday notifications:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}