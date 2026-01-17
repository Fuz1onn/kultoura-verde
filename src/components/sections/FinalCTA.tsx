import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-green-600 py-20 text-white">
      <div className="max-w-5xl mx-auto px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Start Your Cultural Journey?
        </h2>
        <p className="mt-4 text-white/90">
          Browse experiences and book sessions with passionate local artisans.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="bg-white text-green-700 hover:bg-gray-100"
            onClick={() => navigate("/services")}
          >
            Browse Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
