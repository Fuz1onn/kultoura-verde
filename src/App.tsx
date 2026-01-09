import Header from "@/components/layout/Header";
import Home from "@/pages/Home";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{
        backgroundImage: 'url("/images/background.jpg")',
      }}
    >
      <Header />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
