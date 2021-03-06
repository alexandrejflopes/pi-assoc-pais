import React from "react";
import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";

import routes from "./routes";
import withTracker from "./withTracker";

import "bootstrap/dist/css/bootstrap.min.css";
import "./shards-dashboard/styles/shards-dashboards.1.1.0.min.css";

import { initDoc } from "./firebase-config";
import { DefaultLayout } from "./layouts";
import { Container } from "shards-react";

const updateInitialRoute = () => {
  var flag = false;

  return initDoc
    .get()
    .then((doc) => {
      if (doc.exists === false) {
        console.log("vou devolver /init");
        routes[0] = {
          path: "/",
          exact: true,
          layout: DefaultLayout,
          component: () => <Redirect to={"/init"} />,
        };
      } else {
        console.log("vou devolver /login");
        routes[0] = {
          path: "/",
          exact: true,
          layout: DefaultLayout,
          component: () => <Redirect to={"/login"} />,
        };
      }
      flag = true;

      return true;
    })
    .catch((err) => {
      console.log("Error getting initial doc");
      //alert(err);
      return false;
    });
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: false }; // state antes de fazer a verificacao do doc de instalação
  }

  componentDidMount() {
    const self = this;
    const promise = updateInitialRoute();

    promise.then((result) => {
      /*
       * atualizar para o resultado para o resultado da verificacao
       * neste caso, o resultado é sempre true, já que a verificacao atualizada
       * diretamente o path para o qual vamos fazer redirect */
      if (result == false) {
        //Wait x seconds and try again
        self.componentDidMount();
      }
      self.setState({ data: result });
    });
  }

  render() {
    //console.log("state data antes do render -> ", this.state.data);

    if (this.state.data) {
      // se a verificacao ja tiver sido feita, renderizamos a pagina
      return (
        <Router basename={process.env.REACT_APP_BASENAME || ""}>
          <div>
            {routes.map((route, index) => {
              //console.log("index: ", index);
              //console.log("component: ", route.component);
              return (
                <Route
                  key={index}
                  path={route.path}
                  exact={route.exact}
                  component={withTracker((props) => {
                    return (
                      <route.layout {...props}>
                        <route.component {...props} />
                      </route.layout>
                    );
                  })}
                />
              );
            })}
          </div>
        </Router>
      );
    } else {
      // enquanto a verificacao nao tiver sido feita, vamos aguardar na Loading page
      return (
        <Container
          fluid
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {" "}
          <h1>A carregar...</h1>
        </Container>
      );
    }
  }
}

export default App;
