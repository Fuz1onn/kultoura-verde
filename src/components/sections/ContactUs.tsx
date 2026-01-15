import { Button } from "@/components/ui/button";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";

const ContactUs = () => {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section className="bg-gray-50 py-24">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto px-8 transition-all duration-700
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Get in Touch
          </h2>
          <p className="mt-4 text-gray-600">
            Have questions or special requests? We’d love to hear from you.
          </p>
        </div>

        <form className="mt-12 grid grid-cols-1 gap-6">
          <input
            type="text"
            placeholder="Your Name"
            className="h-12 rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="h-12 rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <textarea
            placeholder="Your Message"
            rows={4}
            className="rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <Button className="bg-green-600 hover:bg-green-700 text-white h-12">
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactUs;
