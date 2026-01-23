import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: scroll to top on page open
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-green-700"
        >
          ← Back
        </button>

        <div className="mt-6 rounded-3xl bg-white border shadow-sm p-6 md:p-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-8 text-sm leading-6 text-gray-700">
            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Overview
              </h2>
              <p className="mt-2">
                This Privacy Policy explains how Kultoura Verde (“we”, “our”, or
                “us”) collects, uses, and protects your information when you use
                our website and booking services.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Information We Collect
              </h2>
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium text-gray-900">
                    Account information:
                  </span>{" "}
                  your email address and authentication details needed to sign
                  in.
                </li>
                <li>
                  <span className="font-medium text-gray-900">
                    Booking information:
                  </span>{" "}
                  selected service, instructor, schedule, transport option, and
                  any notes you provide (e.g., pickup notes).
                </li>
                <li>
                  <span className="font-medium text-gray-900">
                    Tour add-ons:
                  </span>{" "}
                  selected optional tour stops (e.g., places to eat, pasalubong
                  center), if you choose them.
                </li>
              </ul>
              <p className="mt-3 text-gray-600">
                We do not intentionally collect sensitive personal information.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                How We Use Your Information
              </h2>
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>To create and manage your account</li>
                <li>To process, confirm, and manage bookings</li>
                <li>
                  To communicate booking updates (e.g., confirmation, rejection,
                  completion)
                </li>
                <li>To improve reliability and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Cookies & Local Storage
              </h2>
              <p className="mt-2">
                We use essential cookies and/or local storage to keep you signed
                in and to make sure the booking experience works correctly. We
                do not use cookies for advertising.
              </p>
              <p className="mt-2">
                If we add analytics tools in the future, we will update this
                policy accordingly.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Data Storage & Third-Party Services
              </h2>
              <p className="mt-2">
                Our application uses third-party services to operate:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium text-gray-900">Supabase</span>{" "}
                  (authentication, database, file storage)
                </li>
                <li>
                  <span className="font-medium text-gray-900">Vercel</span>{" "}
                  (website hosting and deployment)
                </li>
              </ul>
              <p className="mt-2">
                These services process data only as needed to provide the app
                functionality.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Data Retention
              </h2>
              <p className="mt-2">
                We retain your information for as long as needed to provide the
                service and meet operational requirements. You may request
                deletion of your account and associated data, subject to any
                legitimate business or legal requirements.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Security
              </h2>
              <p className="mt-2">
                We take reasonable measures to protect your information.
                However, no system can be guaranteed 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Your Choices
              </h2>
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>You can review booking details in your account</li>
                <li>You may request account deletion</li>
                <li>
                  You can dismiss cookie notices; essential storage is still
                  required for login/session functionality
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                Contact Us
              </h2>
              <p className="mt-2">
                If you have questions about this Privacy Policy, contact us at:
              </p>
              <p className="mt-2">
                <span className="font-medium text-gray-900">Email:</span>{" "}
                <a
                  className="text-green-700 hover:underline"
                  href="mailto:kultouraverde@gmail.com"
                >
                  kultouraverde@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
