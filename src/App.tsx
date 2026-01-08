import Header from "@/components/layout/Header";
import Home from "@/pages/Home";

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{
        backgroundImage: "url('/src/assets/images/background.jpg')",
      }}
    >
      <Header />
      <Home />
    </div>
  );
}

export default App;
