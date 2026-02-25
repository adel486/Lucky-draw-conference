const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: functions.config().email.user, // Set via firebase functions:config:set email.user="your-email@gmail.com"
        pass: functions.config().email.pass  // Set via firebase functions:config:set email.pass="your-app-password"
    }
});

exports.selectWinner = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        // 0. Explicit Preflight Handling for CORS
        if (req.method === "OPTIONS") {
            return res.status(204).send('');
        }

        // 1. Manually verify Authentication inside onRequest
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: Missing or invalid token." });
        }

        const idToken = authHeader.split("Bearer ")[1];
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (e) {
            return res.status(403).json({ error: "Unauthorized: Invalid token.", details: e.message });
        }

        try {
            // 2. Fetch all eligible participants
            const participantsRef = db.collection("participants");
            const snapshot = await participantsRef.get();

            if (snapshot.empty) {
                return res.status(400).json({ error: "No eligible participants found for the draw." });
            }

            const participants = [];
            snapshot.forEach((doc) => {
                participants.push({ id: doc.id, ...doc.data() });
            });

            // 3. Random Selection
            const randomIndex = Math.floor(Math.random() * participants.length);
            const selectedWinner = participants[randomIndex];

            // 4. Store the winner in a separate collection
            const winnerData = {
                ...selectedWinner,
                wonAt: admin.firestore.FieldValue.serverTimestamp(),
                participantId: selectedWinner.id
            };

            // Remove the original explicit id field for the new doc
            delete winnerData.id;

            const winnerDocRef = await db.collection("winners").add(winnerData);

            // 5. Send Email and SMS notifications to the winner
            try {
                const mailOptions = {
                    from: functions.config().email.user,
                    to: selectedWinner.email,
                    subject: 'Congratulations! You Won the Lucky Draw at AI Conference 2026',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2c3e50; text-align: center;">Congratulations!</h2>
                            <p>Dear ${selectedWinner.name},</p>
                            <p>You have been selected as a winner in the Lucky Draw at the <strong>AI Conference 2026</strong> organized by <strong>Union Christian College UCCIMT</strong>.</p>
                            <p>Your participation and engagement in the conference have been greatly appreciated. Please contact the organizing committee at your earliest convenience to claim your prize.</p>
                            <p>We look forward to your continued involvement in future events.</p>
                            <br>
                            <p>Best Regards,<br>
                            AI Conference 2026 Organizing Committee<br>
                            Union Christian College UCCIMT</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`Email sent successfully to winner: ${selectedWinner.email}`);
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }

            // SMS notification (mock for now)
            console.log(`[MOCK SMS NOTIFICATION] Sent to ${selectedWinner.phone}: "Congrats ${selectedWinner.name}! You've won at the UCC ICON 2026 AI Conference!"`);

            // 6. Return the winner profile to the frontend
            // Wrapped in { data: {} } to easily mimic the old Callable response structure for the frontend
            return res.status(200).json({
                data: {
                    message: "Winner successfully selected! Notifications sent.",
                    winner: {
                        id: winnerDocRef.id,
                        name: selectedWinner.name,
                        college: selectedWinner.college,
                        email: selectedWinner.email,
                        phone: selectedWinner.phone
                    }
                }
            });

        } catch (error) {
            console.error("Error selecting winner:", error);
            return res.status(500).json({ error: "An error occurred during winner selection", details: error.message });
        }
    });
});
