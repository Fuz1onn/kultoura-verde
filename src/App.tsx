import Header from "@/components/layout/Header";
import Home from "@/pages/Home";
import Footer from "./components/layout/Footer";
import BackToTop from "./components/ui/BackToTop";

function App() {
  return (
    <div className="min-h-screen text-white">
      <Header />
      <Home />
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
