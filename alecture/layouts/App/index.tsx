import React from "react";
import loadable from "@loadable/component"
import {Switch , Route , Redirect} from "react-router-dom";
const Workspace = loadable(()=> import('@layouts/Workspace'));
const LogIn = loadable(()=> import("@pages/Login")) ;
const SignUp = loadable(()=> import("@pages/SignUp")) ;

import { toast , ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App : React.FC = () => {
    return (
        <>
        <Switch>
            <Redirect exact path = "/" to = "/login" />
            <Route path = "/login" component = {LogIn} />
            <Route path = "/signup" component = {SignUp} />
            <Route path = "/workspace/:workspace" component = {Workspace} />
        </Switch>
        <ToastContainer/>
        </>
    );
};

export default App;