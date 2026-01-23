import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0 });
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
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-8 text-sm leading-6 text-gray-700">
            <section>
              <h2 className="text-base font-semibold text-gray-900">
                1. Acceptance of Terms
              </h2>
              <p className="mt-2">
                By accessing or using Kultoura Verde, you agree to be bound by
                these Terms & Conditions. If you do not agree, please do not use
                the platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                2. Description of Service
              </h2>
              <p className="mt-2">
                Kultoura Verde provides an online booking platform for cultural
                workshops, tours, and related services offered by local
                artisans, instructors, and drivers.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                3. User Accounts
              </h2>
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>
                  You must provide accurate information when creating an account
                </li>
                <li>You are responsible for maintaining account security</li>
                <li>
                  You agree not to misuse or attempt to access other accounts
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                4. Bookings & Payments
              </h2>
              <p className="mt-2">
                Booking requests are subject to availability and confirmation by
                administrators. Prices shown may be estimated until confirmed.
                Once confirmed, final pricing is locked and displayed in your
                booking summary.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                5. Cancellations
              </h2>
              <p className="mt-2">
                Cancellation policies depend on booking status and timing.
                Kultoura Verde reserves the right to cancel or modify bookings
                for operational reasons.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                6. Conduct
              </h2>
              <p className="mt-2">
                Users agree to behave respectfully toward instructors, drivers,
                staff, and other participants during all activities.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                7. Limitation of Liability
              </h2>
              <p className="mt-2">
                Kultoura Verde is not liable for indirect, incidental, or
                consequential damages arising from participation in booked
                activities, to the fullest extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                8. Changes to Terms
              </h2>
              <p className="mt-2">
                We may update these Terms from time to time. Continued use of
                the platform constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                9. Contact
              </h2>
              <p className="mt-2">
                For questions about these Terms, contact us at:
              </p>
              <p className="mt-2">
                <span className="font-medium text-gray-900">Email:</span>{" "}
                <a
                  href="mailto:kultouraverde@gmail.com"
                  className="text-green-700 hover:underline"
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
