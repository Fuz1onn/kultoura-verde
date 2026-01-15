import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="
    fixed bottom-6 right-6 z-50
    h-12 w-12
    rounded-full
    bg-green-700 hover:bg-green-800
    text-white
    shadow-lg
    transition-all duration-300
    hover:scale-105
  "
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
};

export default BackToTop;
