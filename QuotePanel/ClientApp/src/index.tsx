import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import App from './App';
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
                    if (history.location.pathname.startsWith('/panel') ||
                        history.location.pathname.startsWith('/user'))
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


