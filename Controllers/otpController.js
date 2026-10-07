const OTP = require("../models/OTP");
const nodemailer = require("nodemailer");

// ======================================================
// EMAIL CONFIG
// ======================================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error(
      "EMAIL CONFIG ERROR:",
      error.message
    );
  } else {
    console.log("EMAIL SERVER READY ✅");
  }
});

// ======================================================
// SEND OTP
// ======================================================

const generateOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP valid for 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Remove old OTP
    await OTP.deleteMany({
      email: cleanEmail,
    });

    // Save new OTP
    const otpRecord = await OTP.create({
      email: cleanEmail,
      otp: otp,
      verified: false,
      expiresAt: expiresAt,
    });

    console.log("--------------------------------");
    console.log("OTP CREATED");
    console.log("ID:", otpRecord._id);
    console.log("EMAIL:", cleanEmail);
    console.log("OTP:", otp);
    console.log("VERIFIED:", otpRecord.verified);
    console.log("EXPIRES:", expiresAt);
    console.log("--------------------------------");

    // Send email
    await transporter.sendMail({
      from: `"HairCutPro" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "HairCutPro - OTP Verification",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: 30px auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: #ffffff;
        ">

          <h2 style="
            text-align: center;
            color: #111;
          ">
            HairCutPro
          </h2>

          <p>Hello,</p>

          <p>
            Your OTP for HairCutPro verification is:
          </p>

          <div style="
            text-align: center;
            margin: 25px 0;
          ">

            <span style="
              display: inline-block;
              padding: 15px 25px;
              background: #f5f5f5;
              border-radius: 8px;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
            ">
              ${otp}
            </span>

          </div>

          <p>
            This OTP is valid for
            <strong>10 minutes</strong>.
          </p>

          <p>
            Please do not share this OTP.
          </p>

          <hr />

          <p style="
            font-size: 12px;
            color: #777;
            text-align: center;
          ">
            This is an automated email from HairCutPro.
          </p>

        </div>
      `,
    });

    console.log(
      "OTP EMAIL SENT ✅"
    );

    return res.status(200).json({
      success: true,
      message:
        "OTP sent successfully to your email",
    });

  } catch (error) {
    console.error(
      "SEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP email",
    });
  }
};

// ======================================================
// VERIFY OTP
// ======================================================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const cleanOTP = otp
      .toString()
      .trim();

    // Find latest OTP
    const otpRecord = await OTP.findOne({
      email: cleanEmail,
    }).sort({
      createdAt: -1,
    });

    if (!otpRecord) {
      console.log(
        "OTP NOT FOUND:",
        cleanEmail
      );

      return res.status(404).json({
        success: false,
        message:
          "OTP not found or expired",
      });
    }

    console.log("--------------------------------");
    console.log("VERIFY OTP");
    console.log("EMAIL:", cleanEmail);
    console.log(
      "FRONTEND OTP:",
      cleanOTP
    );
    console.log(
      "DATABASE OTP:",
      otpRecord.otp
    );
    console.log(
      "BEFORE VERIFIED:",
      otpRecord.verified
    );
    console.log(
      "EXPIRES:",
      otpRecord.expiresAt
    );
    console.log("--------------------------------");

    // Check expiry
    if (
      !otpRecord.expiresAt ||
      otpRecord.expiresAt < new Date()
    ) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Check OTP
    if (
      otpRecord.otp.toString() !==
      cleanOTP
    ) {
      console.log(
        "OTP DOES NOT MATCH ❌"
      );

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ==================================================
    // IMPORTANT
    // ==================================================

    otpRecord.verified = true;

    await otpRecord.save();

    // Verify from database again
    const verifiedRecord =
      await OTP.findById(
        otpRecord._id
      );

    console.log("--------------------------------");
    console.log(
      "AFTER SAVE VERIFIED:",
      verifiedRecord?.verified
    );
    console.log(
      "OTP ID:",
      verifiedRecord?._id
    );
    console.log("--------------------------------");

    if (
      !verifiedRecord ||
      verifiedRecord.verified !== true
    ) {
      return res.status(500).json({
        success: false,
        message:
          "OTP verification could not be saved",
      });
    }

    console.log(
      "OTP VERIFIED SUCCESSFULLY ✅"
    );

    // DO NOT DELETE OTP HERE

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully",
    });

  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  generateOTP,
  verifyOTP,
};