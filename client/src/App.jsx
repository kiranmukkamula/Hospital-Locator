
import Home from './components/Home'
import HospitalList from './components/HospitalList'
import GovtScheme from './components/GovtScheme'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/login'

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/hospitallist' element={<HospitalList/>}/>
          <Route path='/govtscheme' element={<GovtScheme/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
