import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="container py-5">
              <h1>HairCutPro</h1>
              <p>Hair Cutting & Salon Booking Platform</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
