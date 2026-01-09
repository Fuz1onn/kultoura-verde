import Header from "@/components/layout/Header";
import Home from "@/pages/Home";
import Footer from "./components/layout/Footer";
import backgroundImg from "/src/assets/images/background.jpg";

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{
        backgroundImage: backgroundImg ? `url(${backgroundImg})` : "none",
      }}
    >
      <Header />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
