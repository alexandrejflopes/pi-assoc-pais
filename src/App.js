import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory } from 'history';

// import views router
import viewsRouter from './routers/viewsRouter';

function App() {
    const hist = createBrowserHistory();

    console.log(viewsRouter);
    return (
        <div id="app">
            <Router history={hist}>
                <Switch>
                    {viewsRouter.map((page) => {
                        return page.component
                    })}
                </Switch>
            </Router>
        </div>
    );
}

export default App;
