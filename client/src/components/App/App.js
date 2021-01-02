import './App.css';
import {BrowserRouter as Router, Route} from "react-router-dom";
import JoinForm from "../JoinFrom/JoinForm.js";
import Channel from "../Channel/Channel.js";

function App() {
  return (
    <Router>
      <Route 
        path='/'
        exact
        component={JoinForm}
      />
      <Route
        path='/channel'
        component={Channel}
      />
    </Router>
  );
}

export default App;
