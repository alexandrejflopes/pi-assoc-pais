import React from "react";
import { Redirect } from "react-router-dom";

// Layout Types
import { DefaultLayout } from "./layouts";
import { DefaultConfigLayout } from "./layouts";

// Route Views
import BlogOverview from "./views/BlogOverview";
import UserProfileLite from "./views/UserProfileLite";
import AddNewPost from "./views/AddNewPost";
import Errors from "./views/Errors";
import ComponentsOverview from "./views/ComponentsOverview";
import Tables from "./views/Tables";
import BlogPosts from "./views/BlogPosts";
import AssocConfiguration from "./views/AssocConfiguration";
import LoginPage from "./views/Login";
import Casos from "./views/Casos";
import RegisterPage from "./views/Register";
import ApprovalPage from "./views/Approval";
import NewAssocChoicePage from "./views/NewAssocChoicePage";
import AssocConfigurationNew from "./views/AssocConfigurationNew";

export default [
  {
    path: "/",
    exact: true,
    layout: DefaultLayout,
    component: () => <Redirect to={"/blog-overview"} />,
  },
  {
    path: "/blog-overview",
    layout: DefaultLayout,
    component: BlogOverview,
  },
  {
    path: "/user-profile-lite",
    layout: DefaultLayout,
    component: UserProfileLite,
  },
  {
    path: "/add-new-post",
    layout: DefaultLayout,
    component: AddNewPost,
  },
  {
    path: "/errors",
    layout: DefaultLayout,
    component: Errors,
  },
  {
    path: "/components-overview",
    layout: DefaultLayout,
    component: ComponentsOverview,
  },
  {
    path: "/tables",
    layout: DefaultLayout,
    component: Tables,
  },
  {
    path: "/blog-posts",
    layout: DefaultLayout,
    component: BlogPosts,
  },
  {
    path: "/casos",
    layout: DefaultLayout,
    component: Casos,
  },
  {
    path: "/assoc-config",
    layout: DefaultConfigLayout,
    component: AssocConfiguration,
  },
  {
    path: "/new-assoc-config",
    layout: DefaultConfigLayout,
    component: AssocConfigurationNew,
  },
  {
    path: "/login",
    layout: DefaultConfigLayout,
    component: LoginPage,
  },
  {
    path: "/register",
    layout: DefaultConfigLayout,
    component: RegisterPage,
  },
  {
    path: "/approval",
    layout: DefaultLayout,
    component: ApprovalPage,
  },
  {
    path: "/init",
    layout: DefaultConfigLayout,
    component: NewAssocChoicePage,
  },
];
