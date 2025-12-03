
import Home from './components/Home'
import Hospitals from './components/Hospitals'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/login'
import Emergency from './components/Emergency'

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/hospitals' element={<Hospitals/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/emergency' element={<Emergency/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
