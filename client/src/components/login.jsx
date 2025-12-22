import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Eye,EyeOff } from "lucide-react";

export default function Login() {
const { setLogged } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate=useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const [eye,close]=useState(false)
  
  const handleLogin=(e)=>{
    e.preventDefault()
    
  fetch('https://hospital-locator-backend.onrender.com/api/auth/login',{
  method:'POST',
  headers:{'content-type':'application/json'},
  body:JSON.stringify(form)
  })
  .then(res=>res.json()).then(data=>{
  if(data.success){
  localStorage.setItem("token", data.token);
  setLogged(true);
  navigate("/");
  }else{
    alert(data.message)
    console.log(data.message)
  }
}).catch(err=>{
  console.log(err)
})}
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fff0] p-4">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-8">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-[#009b7d] text-center">
          Welcome Back
        </h2>
        <p className="text-gray-600 text-center mt-1 text-sm">
          Login to continue
        </p>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-[#009b7d]">
              Email
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl bg-[#f0fff0] border border-[#009b7d]/30 focus:border-[#009b7d] outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-[#009b7d]">
              Password
            </label>
            <div className=" flex mt-1 p-3 rounded-xl bg-[#f0fff0] border border-[#009b7d]/30 focus-within:border-[#009b7d] "
             >
            <input
             placeholder="Enter your password"
              type={eye? "text":"password"}
              name="password"
              onChange={handleChange}
              className="flex-1 outline-none"
            />
            {eye? <Eye size="19" onClick={()=>close(!eye)}/>:<EyeOff size="19" onClick={()=>close(!eye)}/>}
          </div>

        </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#009b7d] hover:bg-[#007b63] text-white font-semibold rounded-xl shadow-md transition"
          >
            Login
          </button>
        </form>

        {/* Register redirect */}
        <p className="text-center text-sm mt-4 text-gray-700">
          Don’t have an account?{" "}
          <a href="/register" className="text-[#009b7d] font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
