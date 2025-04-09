// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateJam from './pages/CreateJam'
// import WaitingRoom from './pages/WaitingRoom'
// import WaitingRoomContainer from './pages/WaitingRoomContainer'
import JoinSession from './pages/JoinSession'
import HostWaitingRoom from './pages/HostWaitingRoom';
// import PlayerWaitingRoom from './pages/PlayerWaitingRoom';
// import TestWaitingRoom from './pages/TestWaitingRoom';
import NewWaitingRoom from './pages/NewWaitingRoom';
import PlayerJamRoom from './pages/PlayerJamRoom';
import JamDisplay from './pages/JamDisplay';


function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-jam/setup" element={<CreateJam />} />
        {/* <Route path="/join" element={<JoinSession />} /> */}
        <Route path="/waiting-room/:sessionId" element={<NewWaitingRoom />} />
        <Route path="/join" element={<JoinSession />} />
        <Route path="/waiting-room/:sessionId" element={<HostWaitingRoom />} />
        <Route path="/jam/:sessionId" element={<PlayerJamRoom/>}/>
        <Route path="/jam/:sessionId/host" element={<JamDisplay/>}/>
        {/* <Route path="/waiting-room/player/:sessionId" element={<PlayerWaitingRoom />} />
        <Route path="/test-waiting-room/:sessionId" element={<TestWaitingRoom />} /> */}
      </Routes>
    </Router>
  )
}

export default App