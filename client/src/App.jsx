// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateJam from './pages/CreateJam'
// import WaitingRoom from './pages/WaitingRoom'
import WaitingRoomContainer from './pages/WaitingRoomContainer'
import JoinSession from './pages/JoinSession'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-jam/setup" element={<CreateJam />} />
        {/* <Route path="/jam/:sessionId/waiting-room" element={<WaitingRoom/>}/> */}
        <Route path="/waiting-room/:sessionId" element={<WaitingRoomContainer />} />
        {/* <Route path="/join" element={<JoinSession />} /> */}
        <Route path="/join" element={<JoinSession />} />
      </Routes>
    </Router>
  )
}

export default App