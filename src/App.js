import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './Page/HomePage/HomePage';
import SignUp from './Page/SignUp/SignUp';
import Login from './Page/Login/Login';
import { AuthContextProvider} from './Context/AuthContext';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthContextProvider>
          <Routes>
            <Route path='/' element={<SignUp/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/home' element={<HomePage/>}/>
          </Routes>
        </AuthContextProvider>
      </Router>
    </div>
  );
}

export default App;
