import React from 'react';
import ReactDOM from 'react-dom';
import './index.sass';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history'
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const history = createBrowserHistory();

const logoutLink = onError(({ graphQLErrors, forward, operation }) => {
    if (graphQLErrors) {
        for (let err of graphQLErrors) {
          switch (err.extensions?.code) {
            case 'AUTH_NOT_AUTHORIZED':
                if(history.location.pathname.startsWith('/panel'))
                    history.push("/logout");
          }
        }
    }
    return forward(operation);
  })

const httpLink = createHttpLink({
    uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them

    const token = localStorage.getItem("token")

    return {
        headers: {
            ...headers,

            authorization: token ? `Bearer ${token}` : "",
        }
    }
});

const client = new ApolloClient({
    link: authLink.concat(logoutLink.concat(httpLink)),
    cache: new InMemoryCache(),
    connectToDevTools: true
});

ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <Router history={history}>
                <App />
            </Router>
        </ApolloProvider>
    </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister()