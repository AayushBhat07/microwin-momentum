export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex", // for email-otp
    },
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "google",
    },
  ],
};