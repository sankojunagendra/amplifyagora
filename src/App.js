import React from "react";
import { Auth, Hub } from 'aws-amplify';
import { AmplifyTheme, Authenticator } from 'aws-amplify-react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import MarketPage from './pages/MarketPage'
import NavBar from './components/Navbar'
import "./App.css";

export const UserContext = React.createContext()

class App extends React.Component {
  state = {
    user: null
  };

  componentDidMount() {
    console.dir(AmplifyTheme); // we can look at all of the different classes that are possible to change
    // on the amplify theme
    this.getUserData();
    Hub.listen('auth', this, 'onHubCapsule')
  }

  getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser()
    console.log(user);
    user ? this.setState({ user }) : this.setState({ user: null }) 
  }

  onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case "signIn":
        console.log("signed In")
        this.getUserData()
        break;
      case "signUp":
        console.log("signed Up")
        break;
      case "signOut":
        console.log("signed Out")
        this.setState({ user: null })
        break;
      default:
        return;
    }
  };

  handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
        console.error('Error signing out user', error)
    }
  }

  render() {
    const { user } = this.state;

    return !user ? (
      <Authenticator theme={theme} />
    ) : (
      <UserContext.Provider value={{ user }}>
      <Router>
        {/* React.Fragment */}
        <>
          {/* Navigation */}
          <NavBar user={user} handleSignOut= {this.handleSignOut} />
          {/* Routes */}
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route path="/profile" component={ProfilePage}/>
            <Route path="/markets/:marketId" component={
              ({ match }) => <MarketPage user={user} marketId={match.params.marketId}/>} />
          </div>
        </>
      </Router>
      </UserContext.Provider>
    )
  }
}

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: "var(--light-blue)"
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "var(--amazonOrange)"
  }
}

//export default withAuthenticator(App, true, [], null, theme);
export default App;