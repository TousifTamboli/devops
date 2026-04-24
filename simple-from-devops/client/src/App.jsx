import { useState } from "react";
import axios from "axios";


function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(`${BACKEND_URL}/api/users/add`, {
      name,
      email
    });

    alert("User saved!");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Name"
          className="border p-2"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="border p-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" className="bg-black text-white px-4 py-2">
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;