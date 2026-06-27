import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("Add to .env.local and Vercel (never commit private key):\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("\nOptional: VAPID_SUBJECT=mailto:hello@nimbusly.pl");
