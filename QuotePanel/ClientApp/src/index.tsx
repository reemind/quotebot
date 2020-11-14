import React from 'react';
import ReactDOM from 'react-dom';
import './index.sass';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history'
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { message } from 'antd';

const history = createBrowserHistory();


const logoutLink = onError(({ graphQLErrors, networkError, forward, operation }) => {
    if (graphQLErrors) {
        for (let err of graphQLErrors) {
            switch (err.extensions?.code) {
                case 'AUTH_NOT_AUTHORIZED':
                    if (history.location.pathname.startsWith('/panel'))
                        history.push("/logout");
            }
        }
    }
    if (networkError)
        message.warning("Network error")
    return forward(operation);
})

const httpLink = createHttpLink({
    uri: "/graphql",
    credentials: 'same-origin'
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
    </React.StrictMode>
    ,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

